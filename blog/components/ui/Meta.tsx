import type { ReactNode } from 'react'
import { Ic } from './Ic'

export function Meta({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <span className="meta">
      <Ic name={icon} size={14} sw={1.9} />
      {children}
    </span>
  )
}

export function MetaSep() {
  return <span className="meta-sep" />
}
