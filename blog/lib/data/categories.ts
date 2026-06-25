import 'server-only'
import type { Category, Post } from '@/payload-types'
import { getPayload } from './getPayload'

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return docs[0] ?? null
}

export async function getCategories(): Promise<Category[]> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'name',
  })
  return docs
}

/**
 * Recupera una categoría con sus posts publicados.
 * Retorna `null` si la categoría no existe (llamador debe hacer `notFound()`).
 * Si la categoría existe pero no tiene posts, retorna `{ category, posts: [] }`
 * para que el llamador renderice EmptyState.
 */
export async function getCategoryWithPosts(slug: string): Promise<{ category: Category; posts: Post[] } | null> {
  const category = await getCategoryBySlug(slug)
  if (!category) return null

  const payload = await getPayload()
  const { docs: posts } = await payload.find({
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

  return { category, posts }
}
