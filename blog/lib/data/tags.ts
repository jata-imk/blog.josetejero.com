import 'server-only'
import type { Category, Tag, Post } from '@/payload-types'
import { getPayload } from './getPayload'
import { BUILD_WITHOUT_DB } from './build-guard'

export type RelatedTag = Pick<Tag, 'id' | 'name' | 'slug'>

export type TagWithPosts = {
  tag: Tag
  posts: Post[]
  relatedTags: RelatedTag[]
  categories: Category[]
}

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
  if (BUILD_WITHOUT_DB) return []
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
export async function getTagWithPosts(slug: string): Promise<TagWithPosts | null> {
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

  const relatedTags = getRelatedTagsFromPosts(posts, tag.id)
  const categories = getCategoriesFromPosts(posts)

  return { tag, posts, relatedTags, categories }
}

function getRelatedTagsFromPosts(posts: Post[], currentTagId: number): RelatedTag[] {
  const counts = new Map<number, RelatedTag & { count: number }>()

  for (const post of posts) {
    for (const tag of (post.tags ?? []) as Array<number | Tag>) {
      if (typeof tag !== 'object' || tag === null || tag.id === currentTagId) continue

      const existing = counts.get(tag.id)
      if (existing) {
        existing.count += 1
      } else {
        counts.set(tag.id, { id: tag.id, name: tag.name, slug: tag.slug, count: 1 })
      }
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 5)
    .map(({ id, name, slug }) => ({ id, name, slug }))
}

function getCategoriesFromPosts(posts: Post[]): Category[] {
  const categories = new Map<number, Category>()

  for (const post of posts) {
    for (const category of (post.categories ?? []) as Array<number | Category>) {
      if (typeof category === 'object' && category !== null) {
        categories.set(category.id, category)
      }
    }
  }

  return Array.from(categories.values()).sort((a, b) => a.name.localeCompare(b.name))
}
