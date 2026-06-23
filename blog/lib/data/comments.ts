import 'server-only'
import type { Comment } from '@/payload-types'
import { getPayload } from './getPayload'

export async function getCommentsByPost(postId: number | string): Promise<Comment[]> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'comments',
    where: {
      and: [
        { post: { equals: postId } },
        { status: { equals: 'approved' } },
      ],
    },
    sort: '-createdAt',
    limit: 100,
  })
  return docs
}

export async function getPendingComments(): Promise<Comment[]> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'comments',
    where: { status: { equals: 'pending' } },
    sort: '-createdAt',
    limit: 100,
    depth: 1,
  })
  return docs
}
