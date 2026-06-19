import type { ReactNode } from 'react'

type Variant = 'grad' | 'secondary' | 'ghost' | 'primary'
type Size    = 'sm' | 'md'

export function Btn({
  href,
  onClick,
  variant = 'secondary',
  size = 'md',
  disabled,
  type = 'button',
  children,
}: {
  href?: string
  onClick?: () => void
  variant?: Variant
  size?: Size
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  children: ReactNode
}) {
  const cls = [
    'btn',
    variant === 'grad'      ? 'btn-grad' :
    variant === 'secondary' ? 'btn-secondary' :
    variant === 'ghost'     ? 'btn-ghost' :
                              'btn-primary',
    size === 'sm' ? 'btn-sm' : '',
  ].filter(Boolean).join(' ')

  if (href) {
    return <a href={href} className={cls}>{children}</a>
  }

  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
