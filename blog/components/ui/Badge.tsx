import type { ReactNode } from 'react'
import { Ic } from './Ic'

type Variant = 'grad' | 'series' | 'soft'

export function Badge({ variant, children }: { variant: Variant; children?: ReactNode }) {
  const cls =
    variant === 'grad'   ? 'badge badge-grad' :
    variant === 'series' ? 'badge badge-series' :
                           'badge badge-soft'

  return (
    <span className={cls}>
      {variant === 'series' && <Ic name="layers" size={11} sw={2.2} />}
      {children ?? (variant === 'grad' ? 'Destacado' : variant === 'series' ? 'Serie' : 'Borrador')}
    </span>
  )
}
