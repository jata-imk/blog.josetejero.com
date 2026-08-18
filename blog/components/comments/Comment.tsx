import type { ReactNode } from 'react'
import { Ic } from '../ui/Ic'
import { Status } from '../ui/Status'

const AVATAR_COLORS = [
  'var(--blue)', 'var(--violet)', 'var(--cyan)',
  'var(--green)', 'var(--amber)',
]

function avatarColor(name: string) {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xff
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export function Comment({
  authorName,
  date,
  text,
  status,
  isReply,
  onReply,
  children,
}: {
  authorName: string
  date: string
  text: string
  status?: 'pending' | 'ok' | 'err'
  /** Las respuestas no pueden a su vez responderse: los hilos son de un solo nivel. */
  isReply?: boolean
  onReply?: () => void
  children?: ReactNode
}) {
  const initials = authorName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="ab-comment">
      <div
        className="ab-avatar"
        style={{ background: avatarColor(authorName) }}
        aria-hidden="true"
      >
        {initials}
      </div>
      <div className="ab-comment-body">
        <div className="ab-comment-head">
          <span className="ab-comment-name">{authorName}</span>
          <span className="ab-comment-date">{date}</span>
          {status && <Status variant={status} />}
        </div>
        <p className="ab-comment-text">{text}</p>
        {onReply && !isReply && (
          <div className="ab-comment-actions">
            <button type="button" onClick={onReply}>
              <Ic name="reply" size={13} sw={2} />
              Responder
            </button>
          </div>
        )}
        {children && (
          <div className="ab-comment-replies">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
