import type { ReactNode } from 'react'

type Variant = 'grad' | 'secondary'

export function Btn({
  href,
  onClick,
  variant = 'secondary',
  disabled,
  type = 'button',
  children,
}: {
  href?: string
  onClick?: () => void
  variant?: Variant
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  children: ReactNode
}) {
  const cls = ['btn', variant === 'grad' ? 'btn-grad' : 'btn-secondary'].join(' ')

  if (href) {
    return <a href={href} className={cls}>{children}</a>
  }

  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
