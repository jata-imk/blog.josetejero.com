import { Feed } from 'feed'
import { getPosts } from '@/lib/data'
import { coverImageOf } from '@/lib/media'
import {
  SITE_URL,
  SITE_NAME,
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  absoluteUrl,
} from '@/lib/seo'

/* ============================================================
   Feed RSS (ADR 0029)

   RSS no tiene convención nativa en Next (como sí sitemap/robots),
   así que se implementa como Route Handler: `app/rss.xml/route.ts`
   responde a GET /rss.xml — la URL que el Footer ya enlazaba.

   Usamos la librería `feed` en vez de armar el XML a mano porque
   escapa caracteres especiales (un "&" o "<" en un título rompería
   un XML artesanal) y emite fechas en RFC-822, el formato que los
   lectores RSS esperan.

   Estrategia excerpt + enlace (decisión ADR 0029): el feed anuncia
   la entrada y trae al lector al sitio; no replica el cuerpo.
   ============================================================ */

// Cuántas entradas expone el feed. Los lectores RSS solo necesitan
// "lo reciente"; el archivo completo vive en el sitemap.
const FEED_LIMIT = 20

// Mismo ciclo ISR que el resto del sitio: el feed se regenera como
// máximo cada hora, sin costo por request.
export const revalidate = 3600

export async function GET() {
  const { docs: posts } = await getPosts({ limit: FEED_LIMIT, sort: '-publishedAt' })

  const feed = new Feed({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    // `id` es el identificador único del feed; por convención, la URL del sitio
    id: SITE_URL,
    link: SITE_URL,
    language: 'es',
    // Favicon que algunos lectores muestran junto al feed. No se emite
    // <image> de canal: Next sirve la OG image bajo una ruta con hash
    // no predecible, y el spec de RSS pide GIF/JPEG/PNG (no SVG).
    favicon: absoluteUrl('/icon.svg'),
    copyright: `© ${new Date().getFullYear()} ${SITE_AUTHOR}`,
    // <lastBuildDate>: la fecha del post más reciente
    updated: posts[0]?.publishedAt ? new Date(posts[0].publishedAt) : new Date(),
    feedLinks: { rss: absoluteUrl('/rss.xml') },
    author: { name: SITE_AUTHOR, link: SITE_URL },
  })

  for (const post of posts) {
    const url = absoluteUrl(`/blog/${post.slug}`)
    const cover = coverImageOf(post, 'card')

    feed.addItem({
      title: post.title,
      // <guid>: identificador estable del ítem — los lectores lo usan
      // para saber si ya mostraron esta entrada. La URL canónica sirve.
      id: url,
      link: url,
      description: post.excerpt ?? undefined,
      date: post.publishedAt ? new Date(post.publishedAt) : new Date(post.updatedAt),
      // La portada viaja como <enclosure>; debe ser URL absoluta
      ...(cover ? { image: absoluteUrl(cover.url) } : {}),
    })
  }

  return new Response(feed.rss2(), {
    headers: {
      // El MIME correcto para RSS (no text/xml): los lectores y
      // navegadores lo reconocen como feed
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
