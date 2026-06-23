import 'server-only'
import type { Category } from '@/payload-types'
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
