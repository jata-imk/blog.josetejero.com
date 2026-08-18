import 'server-only'
import type { Comment } from '@/payload-types'
import { getPayload } from './getPayload'

/** Comentario raíz junto a sus respuestas (un solo nivel de anidación). */
export type CommentThread = {
  comment: Comment
  replies: Comment[]
}

export type CreateCommentInput = {
  postId: number
  parentId?: number | null
  name: string
  email: string
  text: string
}

export type CreateCommentResult =
  | { ok: true }
  | { ok: false; reason: 'post-not-found' | 'invalid-parent' | 'error' }

/** Id de una relación de Payload, venga como número o ya poblada. */
function relId(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id: unknown }).id
    return typeof id === 'number' ? id : null
  }
  return null
}

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
    depth: 0,
    limit: 100,
  })
  return docs
}

/**
 * Agrupa los comentarios aprobados en hilos de un nivel: raíces de más nueva a más vieja
 * (como se venían mostrando) y, dentro de cada una, respuestas en orden cronológico.
 */
export async function getCommentThreads(postId: number | string): Promise<CommentThread[]> {
  const comments = await getCommentsByPost(postId)

  const repliesByParent = new Map<number, Comment[]>()
  for (const comment of comments) {
    const parentId = relId(comment.parent)
    if (parentId === null) continue
    const siblings = repliesByParent.get(parentId)
    if (siblings) siblings.push(comment)
    else repliesByParent.set(parentId, [comment])
  }

  return comments
    .filter((comment) => relId(comment.parent) === null)
    .map((comment) => ({
      comment,
      // La consulta viene en '-createdAt'; las respuestas se leen mejor en orden cronológico.
      replies: (repliesByParent.get(comment.id) ?? []).slice().reverse(),
    }))
}

/**
 * Alta de un comentario desde el formulario público. Corre con la Local API, que ignora el access
 * control de la colección (donde `create` está cerrado a usuarios autenticados): el filtro real son
 * el honeypot y el rate limit de la ruta HTTP que llama aquí.
 */
export async function createComment(input: CreateCommentInput): Promise<CreateCommentResult> {
  const payload = await getPayload()

  try {
    const post = await payload.findByID({
      collection: 'posts',
      id: input.postId,
      depth: 0,
    })
    if (post.status !== 'published') return { ok: false, reason: 'post-not-found' }
  } catch {
    return { ok: false, reason: 'post-not-found' }
  }

  if (input.parentId != null) {
    try {
      const parent = await payload.findByID({
        collection: 'comments',
        id: input.parentId,
        depth: 0,
      })
      // Un solo nivel: el padre tiene que ser una raíz aprobada del mismo post.
      const samePost = relId(parent.post) === input.postId
      const isRoot = relId(parent.parent) === null
      if (!samePost || !isRoot || parent.status !== 'approved') {
        return { ok: false, reason: 'invalid-parent' }
      }
    } catch {
      return { ok: false, reason: 'invalid-parent' }
    }
  }

  try {
    await payload.create({
      collection: 'comments',
      data: {
        post: input.postId,
        parent: input.parentId ?? null,
        authorName: input.name,
        authorEmail: input.email,
        body: input.text,
        status: 'pending',
      },
    })
    return { ok: true }
  } catch (err) {
    payload.logger.error(`[comments] No se pudo crear el comentario: ${String(err)}`)
    return { ok: false, reason: 'error' }
  }
}
