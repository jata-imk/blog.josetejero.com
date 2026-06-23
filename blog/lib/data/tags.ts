import 'server-only'
import type { Tag } from '@/payload-types'
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
