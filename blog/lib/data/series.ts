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
