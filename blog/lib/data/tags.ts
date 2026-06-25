import 'server-only'
import type { Tag, Post } from '@/payload-types'
import { getPayload } from './getPayload'

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'tags',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return docs[0] ?? null
}

export async function getTags(): Promise<Tag[]> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'tags',
    limit: 100,
    sort: 'name',
  })
  return docs
}

/**
 * Recupera un tag con sus posts publicados.
 * Retorna `null` si el tag no existe (llamador debe hacer `notFound()`).
 * Si el tag existe pero no tiene posts, retorna `{ tag, posts: [] }`
 * para que el llamador renderice EmptyState.
 */
export async function getTagWithPosts(slug: string): Promise<{ tag: Tag; posts: Post[] } | null> {
  const tag = await getTagBySlug(slug)
  if (!tag) return null

  const payload = await getPayload()
  const { docs: posts } = await payload.find({
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

  return { tag, posts }
}
