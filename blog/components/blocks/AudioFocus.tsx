'use client'

import { useEffect, useRef, type ComponentProps, type RefObject } from 'react'
import { ApIcon, AudioWave, PlayButton } from './AudioParts'
import { analyserFor, binsToBars, fmt, prefersReducedMotion, type AudioTrack, type PlayStatus } from './audioPlayerShared'

const SPECTRUM_BARS = 72

/**
 * Espectro en canvas (barras espejo, color plano `--audio-spec`). Lee el
 * AnalyserNode conectado al `<audio>` del reproductor; en pausa queda congelado
 * con opacidad baja. Con reduced motion no se monta.
 */
function AudioSpectrum({ audioRef, active }: { audioRef: RefObject<HTMLAudioElement | null>; active: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const last = useRef<number[]>(new Array(SPECTRUM_BARS).fill(0.05))

  const paint = (values: number[]) => {
    const c = canvas.current
    if (!c) return
    const w = c.clientWidth
    const h = c.clientHeight
    if (!w) return
    const dpr = window.devicePixelRatio || 1
    if (c.width !== Math.round(w * dpr)) {
      c.width = Math.round(w * dpr)
      c.height = Math.round(h * dpr)
    }
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = getComputedStyle(c).color
    const pitch = w / values.length
    const bw = Math.max(1.5, pitch * 0.62)
    values.forEach((v, i) => {
      const bh = Math.max(2, v * h)
      const x = i * pitch + (pitch - bw) / 2
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(x, (h - bh) / 2, bw, bh, Math.min(bw / 2, 3))
      else ctx.rect(x, (h - bh) / 2, bw, bh)
      ctx.fill()
    })
  }

  useEffect(() => {
    paint(last.current)
    const analyser = active ? analyserFor(audioRef.current) : null
    if (!analyser) return
    const bins = new Uint8Array(analyser.frequencyBinCount)
    let id = 0
    const tick = () => {
      analyser.getByteFrequencyData(bins)
      last.current = binsToBars(bins, SPECTRUM_BARS)
      paint(last.current)
      id = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(id)
  }, [active, audioRef])

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const ro = new ResizeObserver(() => paint(last.current))
    ro.observe(c)
    return () => ro.disconnect()
  }, [])

  return <canvas ref={canvas} className={`ab-ap-spec${active ? '' : ' is-idle'}`} aria-hidden="true" />
}

type FocusProps = {
  open: boolean
  onClose: () => void
  track: AudioTrack
  name: string
  status: PlayStatus
  time: number
  duration: number
  audioRef: RefObject<HTMLAudioElement | null>
  waveProps: ComponentProps<typeof AudioWave>
  onToggle: () => void
  onSeek: (seconds: number) => void
}

/**
 * Modo foco (ADR 0042). `<dialog>` + `showModal()`: Esc, foco atrapado y fondo
 * inerte nativos, igual que el lightbox de video. Controla el mismo `<audio>`
 * del reproductor: no hay un segundo elemento ni otra descarga.
 */
export function AudioFocus({ open, onClose, track, name, status, time, duration, audioRef, waveProps, onToggle, onSeek }: FocusProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      dialog.querySelector<HTMLElement>('[data-ap-close]')?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog ref={dialogRef} className="ab-ap-focus" aria-label={`Modo foco: ${track.label}`} onClose={onClose}>
      {open ? (
        <div className="ab-ap-f-shell">
          <div className="ab-ap-f-top">
            <span className="ab-ap-kick">Modo foco</span>
            <button type="button" className="ab-ap-tbtn" data-ap-close onClick={onClose}>
              <ApIcon n="x" s={15} />Salir <kbd>Esc</kbd>
            </button>
          </div>
          <div className="ab-ap-f-main">
            <div className="ab-ap-f-title">
              <h2>{track.label}</h2>
              {track.provider ? <div className="m">{track.provider}</div> : null}
            </div>
            <div className="ab-ap-f-card">
              {prefersReducedMotion() ? null : <AudioSpectrum audioRef={audioRef} active={status === 'playing'} />}
              <AudioWave {...waveProps} height={64} pitch={5} />
              <div className="ab-ap-f-times"><span>{fmt(time)}</span><span>{fmt(duration)}</span></div>
              <div className="ab-ap-f-ctrl">
                <button type="button" className="ab-ap-cbtn" aria-label="Retroceder 5 segundos" onClick={() => onSeek(time - 5)}>−5</button>
                <PlayButton status={status} onClick={onToggle} big name={name} />
                <button type="button" className="ab-ap-cbtn" aria-label="Avanzar 5 segundos" onClick={() => onSeek(time + 5)}>+5</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </dialog>
  )
}
