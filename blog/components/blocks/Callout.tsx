import type { ReactNode } from 'react'
import { Ic } from '../ui/Ic'

type Kind = 'note' | 'tip' | 'warning' | 'danger'

const CONFIG: Record<Kind, { icon: string; label: string }> = {
  note:    { icon: 'info',     label: 'Nota' },
  tip:     { icon: 'check',    label: 'Consejo' },
  warning: { icon: 'alertTri', label: 'Atención' },
  danger:  { icon: 'xCircle',  label: 'Peligro' },
}

export function Callout({
  kind = 'note',
  title,
  children,
}: {
  kind?: Kind
  title?: string
  children: ReactNode
}) {
  const { icon, label } = CONFIG[kind]
  return (
    <div className={`ab-callout ab-callout-${kind}`}>
      <div className="ic">
        <Ic name={icon} size={14} sw={2.2} />
      </div>
      <div>
        <b>{title ?? label}</b>
        {children}
      </div>
    </div>
  )
}
