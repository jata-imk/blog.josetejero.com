import type { CSSProperties } from 'react'

const TONE: Record<string, string> = {
  'ia-y-agentes':               'thumb-violet',
  'devops-e-infraestructura':   'thumb-green',
  'linux-y-sysadmin':           'thumb-cyan',
  'git-y-control-de-versiones': 'thumb-amber',
  'desarrollo-web':             'thumb-blue',
  'seguridad':                  'thumb-violet',
}
const DEFAULT_TONE = 'thumb-blue'

export function Thumb({
  slug,
  label,
  glow,
  style,
  className,
}: {
  slug?: string | null
  label?: string
  glow?: boolean
  style?: CSSProperties
  className?: string
}) {
  const tone = (slug && TONE[slug]) || DEFAULT_TONE
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
