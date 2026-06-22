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
  kind,
  title,
  children,
}: {
  kind?: Kind | null
  title?: string
  children: ReactNode
}) {
  const safeKind: Kind = (kind && CONFIG[kind]) ? kind : 'note'
  const { icon, label } = CONFIG[safeKind]
  return (
    <div className={`ab-callout ab-callout-${safeKind}`}>
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
