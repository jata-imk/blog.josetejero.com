import type { ReactNode } from 'react'

export function Tag({ children, hash = true }: { children: ReactNode; hash?: boolean }) {
  return (
    <span className="tag-pill">
      {hash && '#'}{children}
    </span>
  )
}

export function TagRow({ children }: { children: ReactNode }) {
  return <div className="tagrow">{children}</div>
}
