import type { MetadataRoute } from 'next'
import { getPostsForSitemap, getCategories, getTags, getSeriesList } from '@/lib/data'
import { absoluteUrl } from '@/lib/seo'

/* ============================================================
   Sitemap (ADR 0029)

   Convención de Next: `app/sitemap.ts` genera /sitemap.xml. El
   sitemap es el "índice" que le entregamos a Google: la lista
   completa de URLs que existen y cuándo cambiaron por última vez.
   Sin él, Google solo descubre páginas siguiendo enlaces — con él,
   sabe exactamente qué rastrear y qué re-visitar (via <lastmod>).

   Es también lo que se envía a Search Console (punto 2 del roadmap).

   Todos los datos salen de lib/data (contrato ADR 0011: las rutas
   nunca consultan Payload directo).
   ============================================================ */

// El sitemap se regenera como el resto del sitio (ISR horario):
// publicar un post aparece aquí en ≤ 1 hora sin rebuild manual.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories, tags, series] = await Promise.all([
    getPostsForSitemap(),
    getCategories(),
    getTags(),
    getSeriesList(),
  ])

  // Páginas fijas del sitio. `changeFrequency` y `priority` son
  // SUGERENCIAS para el crawler (Google admite que apenas las usa,
  // pero son gratis de declarar): la home y el listado cambian con
  // cada publicación; sobre-mí casi nunca.
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/blog'), changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/sobre-mi'), changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/categorias'), changeFrequency: 'monthly', priority: 0.4 },
    { url: absoluteUrl('/tags'), changeFrequency: 'monthly', priority: 0.4 },
    { url: absoluteUrl('/series'), changeFrequency: 'monthly', priority: 0.4 },
  ]

  // Cada entrada publicada. `lastModified` (→ <lastmod>) es el dato
  // que Google SÍ usa: le dice si vale la pena re-rastrear la página.
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  // Páginas de taxonomía (categorías, tags, series): menos prioritarias
  // que los posts, pero indexables — agrupan contenido por tema.
  const taxonomyPages: MetadataRoute.Sitemap = [
    ...categories.map((c) => ({
      url: absoluteUrl(`/categorias/${c.slug}`),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
    ...tags.map((t) => ({
      url: absoluteUrl(`/tags/${t.slug}`),
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    })),
    ...series.map((s) => ({
      url: absoluteUrl(`/series/${s.slug}`),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]

  return [...staticPages, ...postPages, ...taxonomyPages]
}
