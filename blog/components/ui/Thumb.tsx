import type { CSSProperties } from 'react'
import type { CatKey } from './Cat'

const TONE: Record<CatKey, string> = {
  'frontend':       'thumb-blue',
  'backend':        'thumb-violet',
  'bases-de-datos': 'thumb-cyan',
  'ia':             'thumb-violet',
  'devops':         'thumb-green',
  'tutoriales':     'thumb-amber',
  'opinion':        'thumb-blue',
}

export function Thumb({
  cat,
  label,
  glow,
  style,
  className,
}: {
  cat: CatKey
  label?: string
  glow?: boolean
  style?: CSSProperties
  className?: string
}) {
  const tone = TONE[cat]
  return (
    <div className={`thumb ${tone}${className ? ` ${className}` : ''}`} style={style}>
      <div
        className="thumb-glow"
        style={{ top: glow ? '-30%' : '-40%', left: glow ? '-10%' : '40%' }}
      />
      <span className="label font-mono">{label ?? '// cover image'}</span>
    </div>
  )
}
