import type { ReactNode } from 'react'

export function Tag({
  children,
  hash = true,
  href,
  slug,
}: {
  children: ReactNode
  hash?: boolean
  href?: string
  slug?: string
}) {
  const content = (
    <>
      {hash && '#'}{children}
    </>
  )
  const target = href ?? (slug ? `/tags/${slug}` : undefined)

  if (target) {
    return (
      <a className="tag-pill" href={target}>
        {content}
      </a>
    )
  }

  return (
    <span className="tag-pill">
      {content}
    </span>
  )
}

export function TagRow({ children }: { children: ReactNode }) {
  return <div className="tagrow">{children}</div>
}
