import { useEffect, useState, type RefObject } from 'react'
import type { VideoAccent, VideoAspect, VideoMode } from '@/lib/lexical/videoCompareBlock'

/** Un resultado ya resuelto desde `Media` por el converter (props planas). */
export type VideoClip = {
  label?: string
  accent: VideoAccent
  src: string
  mimeType?: string
  poster?: string
  aspect: VideoAspect
  note?: string
}

export type VideoInput = {
  kind: 'image' | 'video'
  src: string
  mimeType?: string
  alt: string
  width?: number
  height?: number
}

export const MODE_LABELS: Record<VideoMode, string> = {
  texto: 'Texto → video',
  imagen: 'Imagen → video',
  video: 'Video → video',
}

/**
 * Forma del escenario (ADR 0041). Es la misma para todos los resultados, así la
 * altura no salta al cambiar de pestaña: si los formatos se mezclan, el
 * escenario pasa a 4:3 y cada video se encaja con pillarbox.
 */
export function stageShape(results: Pick<VideoClip, 'aspect'>[]): VideoAspect | 'mixed' {
  const first = results[0]?.aspect ?? 'horizontal'
  return results.every((r) => r.aspect === first) ? first : 'mixed'
}

export function clipName(clip: VideoClip, index: number): string {
  return clip.label?.trim() || `Resultado ${index + 1}`
}

/**
 * En pantalla completa los overlays del marco desaparecen. Una pista de
 * subtítulos con el nombre del modelo mantiene la etiqueta visible ahí. Se crea
 * en cliente (Blob URL) para no depender de un archivo .vtt por video.
 */
export function useCaptionTrack(label: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!label) return
    const vtt = `WEBVTT\n\n00:00:00.000 --> 99:59:59.000\n${label}\n`
    const next = URL.createObjectURL(new Blob([vtt], { type: 'text/vtt' }))
    setUrl(next)
    return () => {
      URL.revokeObjectURL(next)
      setUrl(null)
    }
  }, [label])
  return url
}

/**
 * La pista anterior solo se muestra en pantalla completa: en la página el
 * sticker ya nombra al modelo y un subtítulo fijo taparía el video.
 * iOS usa sus propios eventos `webkit*fullscreen` sobre el <video>.
 */
export function useFullscreenCaptions(ref: RefObject<HTMLVideoElement | null>, enabled: boolean) {
  useEffect(() => {
    const video = ref.current
    if (!video || !enabled) return
    const setMode = (showing: boolean) => {
      for (const track of Array.from(video.textTracks)) track.mode = showing ? 'showing' : 'hidden'
    }
    const sync = () => setMode(document.fullscreenElement === video)
    const show = () => setMode(true)
    const hide = () => setMode(false)
    sync()
    video.textTracks.addEventListener('addtrack', sync)
    document.addEventListener('fullscreenchange', sync)
    video.addEventListener('webkitbeginfullscreen', show)
    video.addEventListener('webkitendfullscreen', hide)
    return () => {
      video.textTracks.removeEventListener('addtrack', sync)
      document.removeEventListener('fullscreenchange', sync)
      video.removeEventListener('webkitbeginfullscreen', show)
      video.removeEventListener('webkitendfullscreen', hide)
    }
  }, [ref, enabled])
}
