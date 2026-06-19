import 'server-only'
import type { Post } from '@/payload-types'
import { getPayload } from './getPayload'

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
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
