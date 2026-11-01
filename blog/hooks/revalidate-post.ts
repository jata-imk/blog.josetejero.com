import type { Payload } from 'payload'
import type { Comment } from '@/payload-types'

/**
 * Revalidación on-demand del caché ISR. `revalidateCommentPost`: la página de un post cuando
 * cambia uno de sus comentarios. `revalidatePublishedPost`: todo el sitio cuando cambia un post
 * publicado (ver más abajo).
 *
 * La página del post se sirve con ISR (`revalidate = 3600` en el layout público), así que aprobar
 * un comentario en /admin no se vería en la web hasta que expirara el caché. Estos hooks corren
 * dentro del proceso de Next —el admin y el REST de Payload son rutas de la misma app—, así que
 * pueden llamar a `revalidatePath` y refrescar la página al instante.
 *
 * `next/cache` se importa de forma dinámica y todo va envuelto en try/catch porque `payload.config`
 * también se carga fuera de Next (CLI: `payload migrate`, `generate:types`), donde no hay contexto
 * de request. Un fallo aquí nunca debe tumbar la escritura del comentario.
 */
export async function revalidateCommentPost(
  payload: Payload,
  post: Comment['post'],
): Promise<void> {
  try {
    const slug =
      typeof post === 'object' && post !== null
        ? post.slug
        : (await payload.findByID({ collection: 'posts', id: post, depth: 0 })).slug

    if (!slug) return

    const { revalidatePath } = await import('next/cache')
    revalidatePath(`/blog/${slug}`)
  } catch (err) {
    payload.logger.warn(`[comments] No se pudo revalidar la página del post: ${String(err)}`)
  }
}

type PublishState = { slug?: string | null; status?: string | null } | null | undefined

/**
 * Revalidación on-demand del sitio cuando un post entra, sale o cambia estando publicado.
 *
 * Sin esto, publicar un post no se veía hasta que expiraba el ISR (hasta 1 h): la URL del post
 * podía tener un 404 cacheado de antes de publicarse, y el inicio, los listados, el sitemap y
 * el RSS seguían sin él. Un post aparece en muchas páginas (inicio, /blog, serie, categorías,
 * tags), así que se invalida todo el árbol con `revalidatePath('/', 'layout')`, igual que el
 * warm-up del pipeline (ADR 0033). Las páginas se regeneran en la siguiente visita.
 *
 * Los borradores que siguen siendo borradores no tocan nada público y se ignoran.
 */
export async function revalidatePublishedPost(
  payload: Payload,
  doc: PublishState,
  previousDoc?: PublishState,
): Promise<void> {
  const isPublic = doc?.status === 'published'
  const wasPublic = previousDoc?.status === 'published'
  if (!isPublic && !wasPublic) return
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
    revalidatePath('/rss.xml')
    payload.logger.info(`[posts] Caché revalidada por cambio en /blog/${doc?.slug ?? previousDoc?.slug}`)
  } catch (err) {
    payload.logger.warn(`[posts] No se pudo revalidar el caché: ${String(err)}`)
  }
}
