import type { CSSProperties } from 'react'
import Image from 'next/image'
import type { CoverImage } from '@/lib/media'

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
  image,
  sizes,
  priority,
  style,
  className,
}: {
  slug?: string | null
  label?: string
  glow?: boolean
  /** Portada del post (ver lib/media.ts). Si no hay, se muestra el degradado placeholder. */
  image?: CoverImage | null
  /** `sizes` de next/image; requerido junto con `image` para servir el tamaño correcto. */
  sizes?: string
  /** Marca la imagen como LCP candidate (hero del detalle, above the fold). */
  priority?: boolean
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
      {image ? (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes={sizes ?? '(max-width: 768px) 100vw, 400px'}
          className="thumb-img"
          priority={priority}
        />
      ) : (
        <span className="label font-mono">{label ?? '// cover image'}</span>
      )}
    </div>
  )
}
