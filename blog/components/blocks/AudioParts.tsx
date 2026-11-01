'use client'

import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { fmt, resample, type PlayStatus } from './audioPlayerShared'

/** Piezas visuales que comparten la fila del reproductor y el modo foco (ADR 0042). */

/* ---------- iconos ---------- */

const PATHS: Record<string, string> = {
  replay: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
  chevron: 'M6 9l6 6 6-6',
  copy: 'M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  check: 'M20 6L9 17l-5-5',
  focus: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
  x: 'M18 6L6 18M6 6l12 12',
  pencil: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  alert: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01',
}

export function ApIcon({ n, s = 16, sw = 2.2 }: { n: string; s?: number; sw?: number }) {
  if (n === 'play') {
    return (
      <svg width={s + 2} height={s + 2} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 4.8v14.4a1 1 0 0 0 1.5.86l11.2-7.2a1 1 0 0 0 0-1.72L9.5 3.94A1 1 0 0 0 8 4.8z" fill="currentColor" />
      </svg>
    )
  }
  if (n === 'pause') {
    return (
      <svg width={s + 2} height={s + 2} viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5.5" y="4" width="4.5" height="16" rx="1.2" fill="currentColor" />
        <rect x="14" y="4" width="4.5" height="16" rx="1.2" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[n].split('M').filter(Boolean).map((d, i) => <path key={i} d={`M${d}`} />)}
    </svg>
  )
}

/* ---------- botón de reproducir ---------- */

const PLAY_ICON: Partial<Record<PlayStatus, string>> = { playing: 'pause', ended: 'replay', pending: 'pencil', error: 'alert' }
const PLAY_VERB: Partial<Record<PlayStatus, string>> = {
  playing: 'Pausar', ended: 'Repetir', pending: 'Audio pendiente:', error: 'Error al cargar', loading: 'Cargando',
}

export function PlayButton({ status, onClick, big, name }: { status: PlayStatus; onClick: () => void; big?: boolean; name: string }) {
  const icon = PLAY_ICON[status] ?? 'play'
  return (
    <button type="button" className={`ab-ap-play${big ? ' is-big' : ''}`} onClick={onClick}
      disabled={status === 'pending'} aria-label={`${PLAY_VERB[status] ?? 'Reproducir'} ${name}`}>
      {status === 'loading' ? <span className="ab-ap-spin" /> : <ApIcon key={icon} n={icon} s={big ? 30 : 18} sw={2.4} />}
    </button>
  )
}

/* ---------- forma de onda ---------- */

type WaveProps = {
  peaks: number[]
  progress: number
  status: PlayStatus
  duration: number
  interactive: boolean
  label: string
  valueText: string
  onSeek: (seconds: number) => void
  height?: number
  pitch?: number
}

export function AudioWave({ peaks, progress, status, duration, interactive, label, valueText, onSeek, height = 40, pitch = 4 }: WaveProps) {
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const [width, setWidth] = useState(0)
  const [hover, setHover] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.clientWidth)
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const w = width || 320
  const n = Math.max(12, Math.floor(w / pitch))
  const bars = useMemo(() => resample(peaks, n), [peaks, n])
  const pending = status === 'pending'
  const barH = (v: number) => `${(Math.max(0.1, v) * 100).toFixed(2)}%`
  const frac = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect()
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width))
  }

  const a11y = interactive
    ? {
        role: 'slider', tabIndex: 0, 'aria-label': `Posición en ${label}`, 'aria-valuemin': 0,
        'aria-valuemax': Math.round(duration), 'aria-valuenow': Math.round(progress * duration), 'aria-valuetext': valueText,
      }
    : { role: 'img', 'aria-label': pending ? 'Forma de onda pendiente' : `Forma de onda de ${label}` }

  return (
    <div ref={ref} className={`ab-ap-wave is-${status}${interactive ? '' : ' is-static'}`}
      style={{ ['--h' as string]: `${height}px`, ['--gap' as string]: pitch >= 5 ? '2px' : '1.5px' }}
      {...a11y}
      onPointerDown={(e) => {
        if (!interactive) return
        dragging.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
        onSeek(frac(e.clientX) * duration)
      }}
      onPointerMove={(e) => {
        if (!interactive) return
        if (e.pointerType === 'mouse') setHover(frac(e.clientX))
        if (dragging.current) onSeek(frac(e.clientX) * duration)
      }}
      onPointerUp={() => { dragging.current = false }}
      onPointerLeave={() => setHover(null)}>
      <div className="ab-ap-bars">{bars.map((v, i) => <i key={i} style={{ height: barH(v) }} />)}</div>
      {!pending && (
        <div className="ab-ap-bars played" style={{ clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)` }}>
          {bars.map((v, i) => (
            <i key={i} style={{ height: barH(v), backgroundSize: `${w}px 100%`, backgroundPosition: `${((-i * w) / n).toFixed(2)}px 0` }} />
          ))}
        </div>
      )}
      {hover != null && (
        <>
          <span className="ab-ap-hover" style={{ left: `${hover * 100}%` }} />
          <span className="ab-ap-tip" style={{ left: `${hover * 100}%` }}>{fmt(hover * duration)}</span>
        </>
      )}
    </div>
  )
}
