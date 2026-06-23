import 'server-only'
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

export async function getPosts(limit = 10, page = 1): Promise<Post[]> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    depth: 1,
    limit,
    page,
    sort: '-publishedAt',
  })
  return docs
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
