'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { AudioFocus } from './AudioFocus'
import { ApIcon, AudioWave, PlayButton } from './AudioParts'
import {
  connectAnalyser,
  ensureSinglePlayback,
  fakePeaks,
  fmt,
  peaksFromUrl,
  shortName,
  type AudioTrack,
  type PlayStatus,
} from './audioPlayerShared'

/* ---------- reproductor ---------- */

/**
 * Bloque `audioPlayer` (ADR 0042): versión recortada del diseño «Reproductor de
 * audio» — fila compacta + prompt plegable + modo foco. Sin ficha técnica,
 * letra, loop, volumen ni descarga (decisión de José).
 */
export function AudioPlayer({ track }: { track: AudioTrack }) {
  const pending = track.status === 'pending' || !track.src
  const name = shortName(track.label)

  const [st, setSt] = useState<PlayStatus>(pending ? 'pending' : 'ready')
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [peaks, setPeaks] = useState<number[]>(() => track.peaks?.length ? track.peaks : fakePeaks(track.id))
  const [promptOpen, setPromptOpen] = useState(true)
  const [copied, setCopied] = useState(false)
  const [focus, setFocus] = useState(false)
  const el = useRef<HTMLAudioElement>(null)
  const pendingSeek = useRef<number | null>(null)
  const focusBtn = useRef<HTMLButtonElement>(null)
  const peaksRequested = useRef(Boolean(track.peaks?.length))

  const interactive = !pending
  const progress = duration ? Math.min(1, time / duration) : 0
  const valueText = `${fmt(time)} de ${fmt(duration)}`

  useEffect(() => ensureSinglePlayback(), [])

  // Con preload="metadata" el navegador puede leer la duración antes de que React
  // hidrate y enganche onLoadedMetadata: se recoge aquí si ya está disponible.
  useEffect(() => {
    const a = el.current
    if (a && a.readyState >= 1 && Number.isFinite(a.duration)) setDuration(a.duration)
  }, [])

  // Mientras suena, el tiempo se lee en cada frame para que el progreso sea fluido.
  useEffect(() => {
    if (st !== 'playing') return
    let id = 0
    const tick = () => {
      if (el.current) setTime(el.current.currentTime)
      id = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(id)
  }, [st])

  const toggle = () => {
    const a = el.current
    if (!interactive || !a || st === 'error') return
    if (a.paused) {
      if (st === 'ended') { a.currentTime = 0; setTime(0) }
      setSt('loading')
      connectAnalyser(a)
      a.play().catch(() => setSt('error'))
    } else {
      a.pause()
    }
  }

  const seek = (seconds: number) => {
    const a = el.current
    if (!interactive || !a) return
    const d = duration || a.duration || 0
    const s = Math.max(0, Math.min(d || seconds, seconds))
    if (a.readyState >= 1) a.currentTime = s
    else pendingSeek.current = s
    if (st === 'ended' || st === 'ready') setSt(s > 0 ? 'paused' : 'ready')
    setTime(s)
  }

  const retry = () => {
    el.current?.load()
    setSt('ready')
  }

  const copy = () => {
    if (!track.prompt) return
    navigator.clipboard?.writeText(track.prompt).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return
    const target = e.target as HTMLElement
    const tag = target.tagName
    const k = e.key
    if (tag === 'INPUT' || tag === 'TEXTAREA') return
    if (k === ' ' && (tag === 'BUTTON' || tag === 'A')) return
    if (k === ' ' || k === 'k' || k === 'K') { e.preventDefault(); toggle() }
    else if (k === 'ArrowLeft' || k === 'ArrowRight') { e.preventDefault(); seek(time + (k === 'ArrowRight' ? 5 : -5)) }
    else if (k === 'Home') { e.preventDefault(); seek(0) }
    else if (k === 'End') { e.preventDefault(); seek(duration) }
  }

  const mediaSession = () => {
    const a = el.current
    if (!a || !('mediaSession' in navigator)) return
    try {
      const ms = navigator.mediaSession
      ms.metadata = new MediaMetadata({ title: track.label, artist: track.provider ?? name, album: 'Laboratorio · josetejero.com' })
      ms.setActionHandler('play', () => void a.play())
      ms.setActionHandler('pause', () => a.pause())
      ms.setActionHandler('seekbackward', () => { a.currentTime = Math.max(0, a.currentTime - 5) })
      ms.setActionHandler('seekforward', () => { a.currentTime = Math.min(a.duration, a.currentTime + 5) })
      ms.setActionHandler('seekto', (d) => { if (d.seekTime != null) a.currentTime = d.seekTime })
    } catch {
      /* Media Session es opcional */
    }
  }

  // Sin picos precalculados: tras el primer play el archivo ya está en caché y se
  // decodifica para dibujar la onda real.
  const loadRealPeaks = () => {
    if (peaksRequested.current || !track.src) return
    peaksRequested.current = true
    peaksFromUrl(track.src).then(setPeaks).catch(() => {})
  }

  const waveProps = { peaks, progress, status: st, duration, interactive, label: track.label, valueText, onSeek: seek }
  const timeText = pending ? '—:—' : `${fmt(time)} / ${duration ? fmt(duration) : '—:—'}`

  const errorBox = (
    <div className="ab-ap-err" role="alert">
      <strong><ApIcon n="alert" s={15} />No se pudo cargar el audio.</strong>
      <a href={track.src} download>Descargar archivo</a>
      <button type="button" className="ab-ap-link" onClick={retry}>Reintentar</button>
    </div>
  )

  let center: ReactNode
  if (st === 'error') center = errorBox
  else {
    center = (
      <div className="ab-ap-wavecell">
        <AudioWave {...waveProps} />
        {pending && <span className="ab-ap-pend"><ApIcon n="pencil" s={13} />Audio pendiente</span>}
      </div>
    )
  }

  return (
    <div className={`ab-ap is-${st}`} role="group" aria-label={`Reproductor: ${track.label}`} onKeyDown={onKey}>
      {interactive && (
        <audio ref={el} data-ap="" preload="metadata" src={track.src}
          onLoadedMetadata={(e) => {
            const a = e.currentTarget
            if (Number.isFinite(a.duration)) setDuration(a.duration)
            if (pendingSeek.current != null) { a.currentTime = pendingSeek.current; pendingSeek.current = null }
          }}
          onDurationChange={(e) => { if (Number.isFinite(e.currentTarget.duration)) setDuration(e.currentTarget.duration) }}
          onPlaying={() => { setSt('playing'); mediaSession(); loadRealPeaks() }}
          onWaiting={() => setSt('loading')}
          onPause={(e) => { if (!e.currentTarget.ended) setSt('paused'); setTime(e.currentTarget.currentTime) }}
          onEnded={(e) => { setSt('ended'); setTime(e.currentTarget.duration) }}
          onError={() => setSt('error')} />
      )}

      <div className="ab-ap-row">
        <PlayButton status={st} onClick={toggle} name={name} />
        {track.referenceImage && (
          <img className="ab-ap-ref" src={track.referenceImage.src} alt={`Imagen de referencia: ${track.referenceImage.alt}`}
            width={44} height={44} loading="lazy" />
        )}
        <div className="ab-ap-id">
          <span className="ab-ap-name">{name}</span>
          {track.provider && <span className="ab-ap-prov">{track.provider}</span>}
        </div>
        {center}
        {st !== 'error' && <span className="ab-ap-time" aria-hidden="true">{timeText}</span>}
        <button type="button" ref={focusBtn} className="ab-ap-ibtn" disabled={pending}
          aria-label={`Modo foco: ${track.label}`} title="Modo foco" onClick={() => setFocus(true)}>
          <ApIcon n="focus" s={16} />
        </button>
      </div>

      {track.prompt && (
        <div className="ab-ap-acc">
          <div className="ab-ap-acc-head">
            <button type="button" aria-expanded={promptOpen} onClick={() => setPromptOpen((o) => !o)}>
              <ApIcon n="chevron" s={14} />Prompt
            </button>
            <button type="button" className="ab-ap-tbtn" onClick={copy}>
              <ApIcon n={copied ? 'check' : 'copy'} s={14} />{copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          {promptOpen && (
            <div className={`ab-ap-prompt-wrap${track.referenceImage ? ' has-ref' : ''}`}>
              <pre className="ab-ap-prompt">{track.prompt}</pre>
              {track.referenceImage && (
                <img className="ab-ap-refbig" src={track.referenceImage.src} alt={track.referenceImage.alt}
                  width={track.referenceImage.width} height={track.referenceImage.height} loading="lazy" />
              )}
            </div>
          )}
        </div>
      )}

      {interactive && (
        <AudioFocus open={focus} onClose={() => { setFocus(false); focusBtn.current?.focus() }}
          track={track} name={name} status={st} time={time} duration={duration} audioRef={el}
          waveProps={waveProps} onToggle={toggle} onSeek={seek} />
      )}
    </div>
  )
}
