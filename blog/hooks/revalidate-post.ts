import type { Payload } from 'payload'
import type { Comment } from '@/payload-types'

/**
 * Revalidación on-demand de la página de un post cuando cambia uno de sus comentarios.
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
