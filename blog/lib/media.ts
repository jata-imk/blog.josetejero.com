import type { Post, Media } from '@/payload-types'

export type CoverImage = { url: string; alt: string }

/**
 * Extrae la imagen de portada de un post en el tamaño pedido.
 * `coverImage` llega poblado como objeto Media cuando el `find()` usa depth >= 1
 * (ver lib/data/posts.ts, categories.ts, tags.ts). Si el post viene con depth 0
 * o sin portada, `coverImage` es un id numérico o null/undefined → no hay imagen.
 */
export function coverImageOf(
  post: Pick<Post, 'coverImage'>,
  size: 'thumbnail' | 'card' | 'hero',
): CoverImage | null {
  const media = post.coverImage
  if (!media || typeof media !== 'object') return null

  const m = media as Media
  const url = m.sizes?.[size]?.url ?? m.url
  if (!url) return null

  return { url, alt: m.alt ?? '' }
}
