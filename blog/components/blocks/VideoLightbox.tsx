'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { VideoMode } from '@/lib/lexical/videoCompareBlock'
import { MODE_LABELS, clipName, type VideoClip } from './videoCompareShared'

/** Desfase máximo tolerado entre videos antes de corregir (segundos). */
const MAX_DRIFT = 0.15

type LightboxProps = {
  open: boolean
  onClose: () => void
  results: VideoClip[]
  title?: string
  mode?: VideoMode
  initialAudio: number
}

/**
 * «Ver los N juntos» (ADR 0041). `<dialog>` + `showModal()` da Esc, foco
 * atrapado y fondo inerte sin código propio, igual que el visor de figuras.
 * El contenido solo se monta abierto: cerrado no descarga ningún video.
 */
export function VideoLightbox({ open, onClose, results, title, mode, initialAudio }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      dialog.querySelector<HTMLElement>('[data-vc-close]')?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog ref={dialogRef} className="ab-vc-lb" aria-label="Comparación de videos" onClose={onClose}>
      {open ? (
        <LightboxBody results={results} title={title} mode={mode} initialAudio={initialAudio} onClose={onClose} />
      ) : null}
    </dialog>
  )
}

function LightboxBody({ results, title, mode, initialAudio, onClose }: Omit<LightboxProps, 'open'>) {
  const videosRef = useRef<(HTMLVideoElement | null)[]>([])
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audio, setAudio] = useState(initialAudio)
  const n = results.length

  const videos = useCallback(
    () => videosRef.current.filter((v): v is HTMLVideoElement => v !== null),
    [],
  )

  // Solo suena uno: el resto va silenciado.
  useEffect(() => {
    videosRef.current.forEach((v, i) => {
      if (v) v.muted = i !== audio
    })
  }, [audio])

  // Reloj maestro = el video con audio. En cada frame se publica su tiempo y se
  // re-alinean los demás si se desvían más de MAX_DRIFT.
  useEffect(() => {
    if (!playing) return
    let frame = 0
    const tick = () => {
      const all = videos()
      const master = videosRef.current[audio] ?? all[0]
      if (master) {
        const t = master.currentTime
        setTime(t)
        if (!master.ended) {
          for (const v of all) {
            if (v !== master && !v.ended && t < v.duration && Math.abs(v.currentTime - t) > MAX_DRIFT) {
              v.currentTime = t
            }
          }
        }
      }
      if (all.every((v) => v.paused || v.ended)) {
        setPlaying(false)
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, audio, videos])

  const play = () => {
    const start = duration && time >= duration - 0.05 ? 0 : time
    for (const v of videos()) {
      v.currentTime = Math.min(start, v.duration || start)
      void v.play().catch(() => {})
    }
    setTime(start)
    setPlaying(true)
  }

  const pause = () => {
    for (const v of videos()) v.pause()
    setPlaying(false)
  }

  const seek = (value: number) => {
    for (const v of videos()) v.currentTime = Math.min(value, v.duration || value)
    setTime(value)
  }

  const restart = () => {
    pause()
    seek(0)
  }

  const onMeta = () => {
    setDuration(Math.max(0, ...videos().map((v) => (Number.isFinite(v.duration) ? v.duration : 0))))
  }

  const pct = duration ? Math.min(100, (time / duration) * 100) : 0

  return (
    <div className="ab-vc-lb-shell">
      <div className="ab-vc-lb-top">
        {mode ? (
          <span className={`ab-vc-mode ab-vc-mode-${mode}`}>
            <i aria-hidden />
            {MODE_LABELS[mode]}
          </span>
        ) : null}
        <h3>{title || 'Comparación'}</h3>
        <button type="button" className="ab-vc-btn" data-vc-close onClick={onClose}>
          ✕ Cerrar <kbd>Esc</kbd>
        </button>
      </div>

      <div className="ab-vc-lb-grid" style={{ ['--n' as string]: n }}>
        {results.map((clip, i) => (
          <div key={i} className={`ab-vc-lb-cell ab-vc-accent-${clip.accent}`}>
            <span className="ab-vc-sticker">
              <span className="ab-vc-dot" aria-hidden />
              {clipName(clip, i)}
            </span>
            <div className="ab-vc-lb-box">
              <video
                ref={(el) => {
                  videosRef.current[i] = el
                }}
                playsInline
                preload="auto"
                muted={i !== audio}
                poster={clip.poster}
                className={`ab-vc-ar-${clip.aspect}`}
                aria-label={`Resultado de ${clipName(clip, i)}`}
                onLoadedMetadata={onMeta}
                onClick={() => (playing ? pause() : play())}
              >
                <source src={clip.src} type={clip.mimeType} />
              </video>
            </div>
            <span className="ab-vc-note">
              {i === audio ? 'audio on' : 'silenciado'}
              {clip.note ? ` · ${clip.note}` : ''}
            </span>
          </div>
        ))}
      </div>

      <div className="ab-vc-lb-bar">
        <button type="button" className="ab-vc-btn hl" onClick={playing ? pause : play}>
          {playing ? '❚❚ Pausar' : `▶ Reproducir los ${n}`}
        </button>
        <button type="button" className="ab-vc-btn" onClick={restart}>
          ↺ Reiniciar
        </button>
        <input
          type="range"
          className="ab-vc-track"
          aria-label="Posición compartida"
          min={0}
          max={duration || 0}
          step={0.01}
          value={Math.min(time, duration || 0)}
          style={{ ['--pct' as string]: `${pct}%` }}
          onChange={(e) => seek(Number(e.target.value))}
        />
        <span className="ab-vc-note ab-vc-time">{time.toFixed(1)} s</span>
        <span className="ab-vc-note">Audio de:</span>
        <div className="ab-vc-radio" role="radiogroup" aria-label="Audio">
          {results.map((clip, i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={i === audio}
              onClick={() => setAudio(i)}
            >
              {clipName(clip, i).split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
