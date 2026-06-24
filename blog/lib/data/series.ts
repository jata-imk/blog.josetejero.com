import 'server-only'
import type { Post, Series } from '@/payload-types'
import { getPayload } from './getPayload'

export async function getSeriesBySlug(slug: string): Promise<Series | null> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'series',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return docs[0] ?? null
}

export const getSeries = getSeriesList

export async function getSeriesList(): Promise<Series[]> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'series',
    limit: 100,
    sort: 'title',
  })
  return docs
}

export async function getSeriesWithPosts(slug: string): Promise<{ series: Series; posts: Post[] } | null> {
  const series = await getSeriesBySlug(slug)
  if (!series) return null

  const payload = await getPayload()
  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { series: { equals: series.id } },
        { status: { equals: 'published' } },
      ],
    },
    depth: 1,
    limit: 100,
    sort: 'seriesOrder',
  })

  return { series, posts }
}

export async function getPostsInSeries(
  seriesId: number | string,
): Promise<Post[]> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { series: { equals: seriesId } },
        { status: { equals: 'published' } },
      ],
    },
    depth: 0,
    limit: 100,
    sort: 'seriesOrder',
  })
  return docs
}

export type SeriesNavigationContext = {
  series: Series
  currentPosition: number
  totalPosts: number
  previousPost: Post | null
  nextPost: Post | null
}

/**
 * Deriva el contexto de navegación de serie para un post dado.
 * Retorna la serie, la posición visible (1-based), el total de posts,
 * y los posts anterior/siguiente según `seriesOrder`.
 *
 * La posición NO se persiste: se calcula encontrando el índice del post
 * actual en la lista ordenada (ADR 0012).
 */
export async function getSeriesNavigationContext(
  post: Post,
): Promise<SeriesNavigationContext | null> {
  // Si el post no pertenece a una serie, no hay contexto
  if (!post.series) return null

  const seriesId = typeof post.series === 'object' ? post.series.id : post.series

  // Obtener la serie completa
  const payload = await getPayload()
  const series = await payload.findByID({
    collection: 'series',
    id: seriesId,
  })

  if (!series) return null

  // Obtener todos los posts de la serie ordenados
  const posts = await getPostsInSeries(seriesId)

  // Encontrar la posición del post actual
  const currentIndex = posts.findIndex((p) => p.id === post.id)
  if (currentIndex === -1) return null

  return {
    series,
    currentPosition: currentIndex + 1, // 1-based para display
    totalPosts: posts.length,
    previousPost: currentIndex > 0 ? posts[currentIndex - 1] : null,
    nextPost: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
  }
}
