import type { Post, User, Category } from '@/payload-types'
import { coverImageOf } from '@/lib/media'

/* ============================================================
   SEO — fuente única de la verdad (ADR 0029)

   Todo lo que buscadores y redes sociales necesitan saber sobre
   la identidad del sitio vive aquí: URL base, nombre, descripción
   y los builders de JSON-LD (schema.org). Las páginas importan de
   este módulo para que metadata y datos estructurados nunca se
   contradigan (principio: derivar, no duplicar).
   ============================================================ */

/**
 * URL pública del sitio. En producción viene del entorno
 * (NEXT_PUBLIC_SITE_URL=https://josetejero.com); en local apunta a
 * localhost. Es la base sobre la que Next resuelve toda URL relativa
 * de metadata (canonicals, og:image) vía `metadataBase`.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

/** Identidad editorial del sitio — un solo lugar para cambiarla. */
export const SITE_NAME = 'josetejero.com'
export const SITE_AUTHOR = 'José Tejero'
export const SITE_TITLE = `${SITE_AUTHOR} — Desarrollo web, automatización e IA`
export const SITE_DESCRIPTION =
  'Notas sobre desarrollo web, automatización e IA — construyendo software, en voz alta.'
/** Locale del contenido; alimenta og:locale (formato territorio de OG). */
export const SITE_LOCALE = 'es_MX'

/** Perfiles públicos del autor. JSON-LD los usa en `sameAs`: le dicen a
 *  Google que este sitio y estas cuentas son la misma persona (entidad). */
export const SOCIAL_PROFILES = [
  'https://github.com/jata-imk',
  'https://x.com/JoseTejero98',
  'https://www.linkedin.com/in/jatejeroaguilar',
]

/**
 * `alternates` de una página: canonical + autodiscovery del RSS.
 *
 * Existe porque la Metadata API de Next REEMPLAZA los objetos anidados
 * (no los fusiona): si una página declara `alternates: { canonical }`,
 * pisa el `alternates.types` del layout y el <link> de autodiscovery
 * del feed desaparece de esa página. Este helper declara ambos juntos
 * para que ninguna página pierda el feed al fijar su canonical.
 */
export function alternatesFor(canonical: string) {
  return {
    canonical,
    types: {
      'application/rss+xml': [{ url: '/rss.xml', title: `${SITE_NAME} — RSS` }],
    },
  }
}

/** Convierte una ruta relativa (`/blog/mi-post`) en URL absoluta.
 *  Sitemap, RSS y JSON-LD exigen URLs absolutas (los crawlers no
 *  tienen un "documento base" contra el cual resolver rutas). */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString()
}

/* ============================================================
   JSON-LD (schema.org) — datos estructurados

   JSON-LD es un bloque <script type="application/ld+json"> con un
   objeto que describe la página en el vocabulario de schema.org.
   Los humanos no lo ven; Google lo lee para entender QUÉ es la
   página (un blog, un artículo, una persona) y habilitar resultados
   enriquecidos (fecha, autor y portada en el listado de búsqueda).

   `@context` declara el vocabulario; `@type` el tipo de entidad.
   ============================================================ */

/** Identidad del autor como entidad Person de schema.org.
 *  Se reutiliza dentro de WebSite y BlogPosting. */
function personJsonLd() {
  return {
    '@type': 'Person',
    name: SITE_AUTHOR,
    url: SITE_URL,
    sameAs: SOCIAL_PROFILES,
  }
}

/**
 * `WebSite` — se emite una sola vez, en el layout del sitio.
 * Le dice a Google el nombre canónico del sitio (útil para cómo lo
 * muestra en resultados) y quién lo publica.
 */
export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'es',
    publisher: personJsonLd(),
  }
}

/**
 * `BlogPosting` — se emite en cada entrada. Es el que habilita
 * resultados enriquecidos de artículo: Google muestra fecha, autor
 * y portada junto al enlace. Reutiliza los mismos campos del post
 * que alimentan el metadata (título, excerpt, portada, fechas).
 */
export function blogPostingJsonLd(post: Post) {
  // Con depth >= 1 el autor llega poblado como objeto User; si no,
  // es un id numérico y caemos al autor por defecto del sitio.
  const author =
    typeof post.author === 'object' && post.author !== null ? (post.author as User) : null

  const cover = coverImageOf(post, 'hero')

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? undefined,
    // `image` debe ser URL absoluta — los crawlers no resuelven rutas relativas
    image: cover ? [absoluteUrl(cover.url)] : undefined,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt,
    inLanguage: 'es',
    author: author?.name ? { '@type': 'Person', name: author.name, url: SITE_URL } : personJsonLd(),
    // mainEntityOfPage = "esta URL ES el artículo" (no una copia/agregador)
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(`/blog/${post.slug}`),
    },
  }
}

/**
 * `BreadcrumbList` — describe la ruta de navegación (Inicio › Blog ›
 * Categoría › Post). Google puede mostrarla en el resultado en vez de
 * la URL cruda, y le ayuda a entender la jerarquía del sitio.
 * `position` es 1-based por especificación de schema.org.
 */
export function breadcrumbJsonLd(items: Array<{ name: string; path?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      // El último item (la página actual) no lleva URL por convención
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  }
}

/** Breadcrumb estándar de una entrada: Inicio › Blog › [Categoría] › Post. */
export function postBreadcrumbJsonLd(post: Post, primaryCategory: Category | null) {
  return breadcrumbJsonLd([
    { name: 'Inicio', path: '/' },
    { name: 'Blog', path: '/blog' },
    ...(primaryCategory
      ? [{ name: primaryCategory.name, path: `/categorias/${primaryCategory.slug}` }]
      : []),
    { name: post.title },
  ])
}
