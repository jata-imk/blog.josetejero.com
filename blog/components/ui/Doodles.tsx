import type { CSSProperties, ReactNode } from 'react'

// Kit de Trazos & Doodles (ADR 0038). Solo presentación: SVG inline que pinta con
// `currentColor`, así el tono sale de las clases `.doodle-tone-*` (tokens --chalk-* en
// globals.css) y se adapta solo al tema. Todo es decorativo (aria-hidden): el texto
// envuelto sigue siendo texto normal para lectores de pantalla y buscadores.
//
// Idioma visual (ADR 0037): trazo de 2 px, colores planos, sin blur ni degradados.
// Server Components puros: no hay estado ni efectos, se renderizan en el HTML.

export type DoodleTone = 'ink' | 'blue' | 'pink' | 'yellow' | 'green' | 'orange'

type Animated = {
  /** Dibuja el trazo al cargar. Solo para piezas visibles sin scroll; respeta prefers-reduced-motion. */
  animated?: boolean
}

function toneClass(tone: DoodleTone) {
  return `doodle-tone-${tone}`
}

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ')
}

const svgBase = {
  'aria-hidden': true,
  focusable: false,
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/* ── Subrayado de gis ─────────────────────────────────────────── */

// Trazos dibujados en un lienzo 200×12 y estirados al ancho del texto
// (preserveAspectRatio="none"); vector-effect mantiene el grosor fijo en 2 px.
const UNDERLINE_PATHS = {
  single: ['M2 7.5C34 5.2 71 8.6 108 6.1S170 4.9 198 6.4'],
  double: ['M2 5.6C40 3.9 88 6.8 128 4.8S181 4.4 198 5.2', 'M9 9.6C52 8.1 101 10.2 146 8.6S186 8.3 194 9'],
} as const

export function ChalkUnderline({
  children,
  tone = 'blue',
  variant = 'single',
  animated,
  className,
}: {
  children: ReactNode
  tone?: DoodleTone
  variant?: keyof typeof UNDERLINE_PATHS
} & Animated & { className?: string }) {
  return (
    <span className={cx('doodle-underline', className)}>
      {children}
      <svg
        {...svgBase}
        className={cx('doodle-underline-svg', toneClass(tone), animated && 'doodle-animated')}
        viewBox="0 0 200 12"
        preserveAspectRatio="none"
      >
        {UNDERLINE_PATHS[variant].map((d) => (
          <path key={d} d={d} strokeWidth={2} vectorEffect="non-scaling-stroke" pathLength={1} />
        ))}
      </svg>
    </span>
  )
}

/* ── Círculo a mano alzada ────────────────────────────────────── */

export function ChalkCircle({
  children,
  tone = 'pink',
  animated,
  className,
}: { children: ReactNode; tone?: DoodleTone; className?: string } & Animated) {
  return (
    <span className={cx('doodle-circle', className)}>
      {children}
      <svg
        {...svgBase}
        className={cx('doodle-circle-svg', toneClass(tone), animated && 'doodle-animated')}
        viewBox="0 0 120 50"
        preserveAspectRatio="none"
      >
        {/* Un solo trazo que no cierra: arranca arriba a la derecha y se pasa de largo. */}
        <path
          d="M93 7.5C72 2.2 30 3.4 13.5 12.2C1.6 18.6 3.1 33.6 18 40.3C38 49.2 88 47.6 106 37.2C119.4 29.4 116.8 14.6 99 8.4C86 3.9 64 3.4 49 5.1"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          pathLength={1}
        />
      </svg>
    </span>
  )
}

/* ── Flecha orgánica ──────────────────────────────────────────── */

export function DoodleArrow({
  tone = 'ink',
  size = 72,
  flip = false,
  rotate = 0,
  animated,
  className,
  style,
}: {
  tone?: DoodleTone
  /** Ancho en px; el alto es proporcional (lienzo 100×60). */
  size?: number
  /** Espeja horizontalmente: la punta queda a la izquierda. */
  flip?: boolean
  rotate?: number
  className?: string
  style?: CSSProperties
} & Animated) {
  const transform = `${flip ? 'scaleX(-1) ' : ''}rotate(${rotate}deg)`
  return (
    <svg
      {...svgBase}
      className={cx('doodle-arrow', toneClass(tone), animated && 'doodle-animated', className)}
      viewBox="0 0 100 60"
      width={size}
      height={(size * 60) / 100}
      style={{ transform, ...style }}
    >
      <path d="M4 44C18 20 42 12 62 22C74 28 80 36 92 30" strokeWidth={2.4} pathLength={1} />
      <path d="M80 23.5L93 29.5L84.5 40.5" strokeWidth={2.4} pathLength={1} />
    </svg>
  )
}

/* ── Chispa / estrella ────────────────────────────────────────── */

export function DoodleSparkle({
  tone = 'yellow',
  size = 28,
  animated,
  className,
  style,
}: { tone?: DoodleTone; size?: number; className?: string; style?: CSSProperties } & Animated) {
  return (
    <svg
      {...svgBase}
      className={cx('doodle-sparkle', toneClass(tone), animated && 'doodle-animated', className)}
      viewBox="0 0 32 32"
      width={size}
      height={size}
      style={style}
    >
      {/* Estrella de 4 puntas de curvas cóncavas, rellena, más dos destellos sueltos. */}
      <path
        d="M14 3.5C14.8 10.4 16.6 12.4 23.6 13.4C16.8 14.6 15 16.6 14.2 23.8C13.2 16.8 11.4 14.9 4.4 13.8C11.2 12.6 13.1 10.6 14 3.5Z"
        fill="currentColor"
        strokeWidth={1.6}
        pathLength={1}
      />
      <path d="M25.5 21.5V27.5M22.5 24.5H28.5" strokeWidth={2} pathLength={1} />
      <path d="M26 5.2V5.4" strokeWidth={2.6} pathLength={1} />
    </svg>
  )
}

/* ── Cinta washi ──────────────────────────────────────────────── */

// La forma rasgada es una máscara CSS (globals.css, .washi) sobre un relleno liso translúcido:
// sin <pattern> ni ids, cualquier número de cintas por página.
export function WashiTape({
  tone = 'yellow',
  size = 'md',
  rotate = -4,
  className,
  style,
}: {
  tone?: Exclude<DoodleTone, 'ink'>
  /** md ≈ 112×26 px (tarjetas); sm ≈ 34×12 px (chips). */
  size?: 'sm' | 'md'
  rotate?: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <span
      aria-hidden="true"
      className={cx('washi', `washi-${size}`, toneClass(tone), className)}
      style={{ '--washi-rotate': `${rotate}deg`, ...style } as CSSProperties}
    />
  )
}
