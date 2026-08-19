'use client'

import { useState } from 'react'
import { Comment } from './Comment'
import { CommentForm } from './CommentForm'

/**
 * Forma pública de un comentario: solo lo que se pinta. El documento de Payload trae además
 * `authorEmail`, y todo lo que llega hasta aquí viaja al navegador dentro del payload de RSC —
 * así que el mapeo se hace en el servidor y el email nunca sale de la base.
 */
export type PublicComment = {
  id: number
  authorName: string
  date: string
  text: string
}

export type PublicThread = {
  comment: PublicComment
  replies: PublicComment[]
}

/**
 * Isla cliente de la sección de comentarios.
 *
 * La página del post es un Server Component (consulta la base directamente), pero "Responder"
 * necesita estado en el navegador. En vez de convertir la página entera en cliente, se envía aquí
 * la lista ya resuelta y solo este árbol se hidrata.
 */
export function CommentsSection({
  postId,
  threads,
}: {
  postId: string
  threads: PublicThread[]
}) {
  const [replyTo, setReplyTo] = useState<number | null>(null)

  const total = threads.reduce((count, thread) => count + 1 + thread.replies.length, 0)

  return (
    <div className="post-comments" style={{ marginTop: 48 }}>
      <div className="post-comments-head">
        <h2 className="post-comments-title">Comentarios</h2>
        {total > 0 && (
          <span
            className="badge badge-soft"
            style={{ fontSize: 13, textTransform: 'none', letterSpacing: 0 }}
          >
            {total}
          </span>
        )}
      </div>

      <CommentForm postId={postId} />

      {threads.length === 0 ? (
        <p style={{ marginTop: 24, color: 'var(--ink-3)', fontSize: 14, fontStyle: 'italic' }}>
          Sé la primera persona en comentar.
        </p>
      ) : (
        <div className="post-comments-list">
          {threads.map(({ comment, replies }) => {
            const isReplying = replyTo === comment.id
            const hasThread = replies.length > 0 || isReplying

            return (
              <Comment
                key={comment.id}
                authorName={comment.authorName}
                date={comment.date}
                text={comment.text}
                onReply={() => setReplyTo(comment.id)}
              >
                {hasThread ? (
                  <>
                    {replies.map((reply) => (
                      <Comment
                        key={reply.id}
                        authorName={reply.authorName}
                        date={reply.date}
                        text={reply.text}
                        isReply
                      />
                    ))}
                    {isReplying && (
                      <CommentForm
                        postId={postId}
                        parentId={String(comment.id)}
                        replyingTo={comment.authorName}
                        onCancel={() => setReplyTo(null)}
                      />
                    )}
                  </>
                ) : null}
              </Comment>
            )
          })}
        </div>
      )}
    </div>
  )
}
