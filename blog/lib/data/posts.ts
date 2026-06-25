import 'server-only'
import type { Where } from 'payload'
import type { Post } from '@/payload-types'
import { getPayload } from './getPayload'

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { slug: { equals: slug } },
        { status: { equals: 'published' } },
      ],
    },
    depth: 2,
    limit: 1,
  })
  return docs[0] ?? null
}

export type PaginatedPosts = {
  docs: Post[]
  totalDocs: number
  limit: number
  totalPages: number
  page?: number | undefined
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage?: number | null
  nextPage?: number | null
}

export type GetPostsOptions = {
  category?: string
  tag?: string
  sort?: '-publishedAt' | 'publishedAt'
  excludeFeatured?: boolean
  limit?: number
  page?: number
}

export async function getPosts(limit: number, page?: number): Promise<PaginatedPosts>
export async function getPosts(options: GetPostsOptions): Promise<PaginatedPosts>
export async function getPosts(
  optionsOrLimit: GetPostsOptions | number = {},
  page?: number
): Promise<PaginatedPosts> {
  // Handle backwards compatibility: if first arg is a number, convert to options
  const options: GetPostsOptions = typeof optionsOrLimit === 'number'
    ? { limit: optionsOrLimit, page }
    : optionsOrLimit

  const {
    category,
    tag,
    sort = '-publishedAt',
    excludeFeatured = false,
    limit = 10,
    page: optionsPage = 1,
  } = options

  const payload = await getPayload()
  const conditions: Where[] = [{ status: { equals: 'published' } }]

  if (category) conditions.push({ 'categories.slug': { equals: category } })
  if (tag) conditions.push({ 'tags.slug': { equals: tag } })
  if (excludeFeatured) conditions.push({ featured: { not_equals: true } })

  const result = await payload.find({
    collection: 'posts',
    where: conditions.length > 1 ? { and: conditions } : conditions[0],
    depth: 1,
    limit,
    page: optionsPage,
    sort,
  })
  return result
}

export async function getPostsByCategory(slug: string): Promise<Post[]> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { 'categories.slug': { equals: slug } },
        { status: { equals: 'published' } },
      ],
    },
    depth: 1,
    limit: 100,
    sort: '-publishedAt',
  })
  return docs
}

export async function getPostsByTag(slug: string): Promise<Post[]> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { 'tags.slug': { equals: slug } },
        { status: { equals: 'published' } },
      ],
    },
    depth: 1,
    limit: 100,
    sort: '-publishedAt',
  })
  return docs
}

export async function getFeaturedPost(): Promise<Post | null> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { featured: { equals: true } },
        { status: { equals: 'published' } },
      ],
    },
    depth: 1,
    limit: 1,
    sort: '-publishedAt',
  })
  return docs[0] ?? null
}

export async function getPopularTags(limit = 10): Promise<Array<{ id: number; name: string; slug: string; count: number }>> {
  const payload = await getPayload()
  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    depth: 1,
    limit: 1000,
  })

  const tagCounts = new Map<number, { id: number; name: string; slug: string; count: number }>()

  for (const post of posts) {
    if (post.tags && Array.isArray(post.tags)) {
      for (const tag of post.tags) {
        if (typeof tag === 'object' && tag !== null && 'id' in tag) {
          const tagId = tag.id as number
          const existing = tagCounts.get(tagId)
          if (existing) {
            existing.count++
          } else {
            tagCounts.set(tagId, {
              id: tagId,
              name: (tag as { name: string }).name,
              slug: (tag as { slug: string }).slug,
              count: 1,
            })
          }
        }
      }
    }
  }

  return Array.from(tagCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
