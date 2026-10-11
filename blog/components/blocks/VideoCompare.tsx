'use client'

import { useRef, useState, type KeyboardEvent, type RefObject } from 'react'
import type { VideoAspect, VideoMode } from '@/lib/lexical/videoCompareBlock'
import { VideoLightbox } from './VideoLightbox'
import {
  MODE_LABELS,
  clipName,
  stageShape,
  useCaptionTrack,
  useFullscreenCaptions,
  type VideoClip,
  type VideoInput,
} from './videoCompareShared'

export type VideoCompareProps = {
  title?: string
  mode?: VideoMode
  prompt?: string
  input?: VideoInput
  doodle?: string
  results: VideoClip[]
  caption?: string
}

function Stage({
  clip,
  index,
  shape,
  videoRef,
}: {
  clip: VideoClip
  index: number
  shape: VideoAspect | 'mixed'
  videoRef: RefObject<HTMLVideoElement | null>
}) {
  const [started, setStarted] = useState(false)
  const name = clipName(clip, index)
  const track = useCaptionTrack(clip.label)
  useFullscreenCaptions(videoRef, Boolean(track))
  // Sin poster, iOS no pinta el primer frame con preload="metadata": el fragmento
  // #t lo obliga a decodificar el instante 0.1 s.
  const src = clip.poster ? clip.src : `${clip.src}#t=0.1`

  return (
    <div className={`ab-vc-frame ab-vc-shape-${shape} ab-vc-accent-${clip.accent}`}>
      {clip.label ? (
        <span className="ab-vc-sticker">
          <span className="ab-vc-dot" aria-hidden />
          {clip.label}
        </span>
      ) : null}
      <div className="ab-vc-media">
        <span className="ab-vc-fallback" aria-hidden>
          {clip.label ? <span className="nm">{clip.label}</span> : null}
          {clip.note ? <span className="nt">{clip.note}</span> : null}
        </span>
        <video
          ref={videoRef}
          controls
          playsInline
          preload="metadata"
          poster={clip.poster}
          aria-label={clip.label ? `Resultado de ${name}` : 'Video'}
          onPlay={() => setStarted(true)}
        >
          <source src={src} type={clip.mimeType} />
          {track ? <track kind="captions" srcLang="es" label="Modelo" src={track} /> : null}
        </video>
        {!started ? (
          <button
            type="button"
            className="ab-vc-play"
            aria-label={`Reproducir ${name}`}
            onClick={() => void videoRef.current?.play().catch(() => {})}
          />
        ) : null}
      </div>
    </div>
  )
}

function InputBox({ mode, prompt, input }: { mode?: VideoMode; prompt: string; input?: VideoInput }) {
  const media = mode && mode !== 'texto' ? input : undefined
  const ratio = media?.width && media?.height ? `${media.width} / ${media.height}` : undefined
  return (
    <div>
      <div className="ab-vc-lbl">
        <b>Antes</b>Entrada
      </div>
      <div className={`ab-vc-input${media ? ' has-media' : ''}`}>
        {media ? (
          <div className="ab-vc-in-media" style={ratio ? { aspectRatio: ratio } : undefined}>
            <span className="ab-vc-tagmini">{media.kind === 'image' ? 'Imagen' : 'Video'} · origen</span>
            {media.kind === 'image' ? (
              <img src={media.src} alt={media.alt} width={media.width} height={media.height} loading="lazy" />
            ) : (
              <video controls muted playsInline preload="metadata" aria-label={media.alt || 'Video de entrada'}>
                <source src={`${media.src}#t=0.1`} type={media.mimeType} />
              </video>
            )}
          </div>
        ) : null}
        <p className="ab-vc-prompt">
          <span className="pl">Prompt</span>
          {prompt}
        </p>
      </div>
    </div>
  )
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  )
}

/**
 * Bloque `videoCompare` (ADR 0041), variante B del diseño: un escenario a ancho
 * de columna + selector de modelos + lightbox para verlos juntos. Con un solo
 * resultado se reduce a marco + pie (reproductor genérico).
 */
export function VideoCompare({ title, mode, prompt, input, doodle, results, caption }: VideoCompareProps) {
  const [sel, setSel] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const tabsRef = useRef<HTMLDivElement>(null)
  const stageVideoRef = useRef<HTMLVideoElement>(null)
  const n = results.length
  if (n === 0) return null

  const shape = stageShape(results)
  const current = results[Math.min(sel, n - 1)]
  const promptText = prompt?.trim()

  const onTabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const next = (sel + (event.key === 'ArrowRight' ? 1 : n - 1)) % n
    setSel(next)
    tabsRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus()
  }

  const openLightbox = () => {
    stageVideoRef.current?.pause()
    setLightbox(true)
  }

  return (
    <figure className="ab-vc">
      {promptText ? (
        <>
          {title || mode ? (
            <div className="ab-vc-head">
              {title ? <h4 className="ab-vc-title">{title}</h4> : null}
              {mode ? (
                <span className={`ab-vc-mode ab-vc-mode-${mode}`}>
                  <i aria-hidden />
                  {MODE_LABELS[mode]}
                </span>
              ) : null}
            </div>
          ) : null}
          <InputBox mode={mode} prompt={promptText} input={input} />
          <div className="ab-vc-then">
            <span className="arrow">
              <b>Después</b>↓ {n === 1 ? '1 modelo' : `${n} modelos`}
            </span>
            <span className="ln" aria-hidden />
            {doodle ? <span className="ab-vc-doodle">{doodle}</span> : null}
          </div>
        </>
      ) : null}

      {/* key: cambiar de pestaña desmonta el <video> anterior, que así deja de sonar. */}
      <Stage key={sel} clip={current} index={sel} shape={shape} videoRef={stageVideoRef} />

      {n > 1 ? (
        <>
          <div
            className="ab-vc-tabs"
            role="tablist"
            aria-label="Resultados por modelo"
            style={{ ['--n' as string]: n }}
            ref={tabsRef}
            onKeyDown={onTabKey}
          >
            {results.map((clip, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                className={`ab-vc-tab ab-vc-accent-${clip.accent}`}
                aria-selected={i === sel}
                tabIndex={i === sel ? 0 : -1}
                onClick={() => setSel(i)}
              >
                <span className={`th ab-vc-th-${clip.aspect}`} aria-hidden>
                  {clip.poster ? <img src={clip.poster} alt="" loading="lazy" /> : null}
                </span>
                <span className="tx">
                  <span className="nm">
                    <span className="ab-vc-dot" aria-hidden />
                    {clipName(clip, i)}
                  </span>
                  {clip.note ? <span className="nt">{clip.note}</span> : null}
                </span>
              </button>
            ))}
          </div>
          <div className="ab-vc-meta">
            <span className="ab-vc-note">
              {clipName(current, sel)}
              {current.note ? ` · ${current.note}` : ''}
            </span>
            <button type="button" className="ab-vc-btn" onClick={openLightbox}>
              <ExpandIcon />
              Ver los {n} juntos
            </button>
          </div>
          <VideoLightbox
            open={lightbox}
            onClose={() => setLightbox(false)}
            results={results}
            title={title}
            mode={mode}
            initialAudio={sel}
          />
        </>
      ) : null}

      {caption ? <figcaption className="ab-vc-cap">{caption}</figcaption> : null}
    </figure>
  )
}
