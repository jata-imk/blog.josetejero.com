/**
 * Utilidades del bloque `audioPlayer` (ADR 0042), sin React. Port del motor del
 * diseño («Reproductor de audio», `ap-engine.jsx`) sin la síntesis de pistas.
 */

export type AudioTrack = {
  id: string
  label: string
  provider?: string
  status: 'ready' | 'pending'
  src?: string
  mimeType?: string
  prompt?: string
  referenceImage?: { src: string; alt: string; width?: number; height?: number }
  peaks?: number[]
}

export type PlayStatus = 'ready' | 'loading' | 'playing' | 'paused' | 'ended' | 'error' | 'pending'

/** Nombre corto de la fila: lo que va tras el último «–» del título. */
export function shortName(label: string): string {
  return label.split('–').pop()?.trim() || label
}

/** Segundos → «m:ss». */
export function fmt(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds || 0))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Reduce (o estira) una lista de picos a `m` barras tomando el máximo de cada tramo. */
export function resample(peaks: number[], m: number): number[] {
  const out: number[] = []
  const r = peaks.length / m
  for (let j = 0; j < m; j++) {
    const from = Math.floor(j * r)
    const to = Math.max(from + 1, Math.floor((j + 1) * r))
    let max = 0
    for (let i = from; i < to; i++) max = Math.max(max, peaks[i] ?? 0)
    out.push(max)
  }
  return out
}

/** Onda neutra y estable (misma semilla → misma forma) mientras no hay picos reales. */
export function fakePeaks(seed: string, n = 200): number[] {
  let s = 0
  for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    const x = i / n
    out.push(0.25 + 0.35 * Math.abs(Math.sin(x * 9 + s)) + 0.2 * Math.abs(Math.sin(x * 37 + s * 0.3)))
  }
  return out
}

/**
 * Forma de onda (0–1) de un buffer decodificado. Usa la energía RMS de cada
 * tramo y no el pico: en una pista masterizada casi todos los tramos tocan el
 * máximo y la onda saldría plana.
 */
export function peaksOf(buffer: AudioBuffer, n = 200): number[] {
  const data = buffer.getChannelData(0)
  const seg = Math.max(1, Math.floor(data.length / n))
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    let sum = 0
    let count = 0
    for (let j = i * seg; j < (i + 1) * seg && j < data.length; j += 4) {
      sum += data[j] * data[j]
      count++
    }
    out.push(Math.sqrt(sum / (count || 1)))
  }
  // Normaliza contra el percentil 98: un clic aislado no aplasta el resto de la onda.
  const top = [...out].sort((a, b) => a - b)[Math.floor(n * 0.98)] || 1
  return out.map((x) => Math.round(Math.pow(Math.min(1, x / top), 1.2) * 1000) / 1000)
}

/** Descarga y decodifica el audio para obtener su forma de onda real. */
export async function peaksFromUrl(url: string, n = 200): Promise<number[]> {
  const bytes = await (await fetch(url)).arrayBuffer()
  const ctx = new OfflineAudioContext(1, 1, 44100)
  return peaksOf(await ctx.decodeAudioData(bytes), n)
}

/** Bins de frecuencia (0–255) → `n` barras 0–1 con escala casi logarítmica. */
export function binsToBars(bins: Uint8Array, n: number): number[] {
  const use = Math.floor(bins.length * 0.72)
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    const a = Math.floor(Math.pow(i / n, 1.6) * use)
    const b = Math.max(a + 1, Math.floor(Math.pow((i + 1) / n, 1.6) * use))
    let max = 0
    for (let k = a; k < b; k++) max = Math.max(max, bins[k])
    out.push(max / 255)
  }
  return out
}

/* ---------- Web Audio: un AudioContext para toda la página ---------- */

let audioCtx: AudioContext | null = null
const analysers = new WeakMap<HTMLMediaElement, AnalyserNode>()

/**
 * Conecta el `<audio>` a un AnalyserNode (una sola vez por elemento: un
 * MediaElementSource no se puede crear dos veces). Si Web Audio falla, el
 * audio sigue sonando por la ruta normal, solo sin espectro.
 */
export function connectAnalyser(el: HTMLMediaElement): void {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    audioCtx ??= new Ctor()
    if (audioCtx.state === 'suspended') void audioCtx.resume()
    if (analysers.has(el)) return
    const source = audioCtx.createMediaElementSource(el)
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.78
    source.connect(analyser)
    analyser.connect(audioCtx.destination)
    analysers.set(el, analyser)
  } catch {
    /* sin Web Audio: suena igual, sin espectro */
  }
}

export function analyserFor(el: HTMLMediaElement | null): AnalyserNode | null {
  return (el && analysers.get(el)) || null
}

/* ---------- Una pista a la vez ---------- */

let singlePlayback = false

/** Al empezar un `audio[data-ap]`, pausa los demás de la página. Idempotente. */
export function ensureSinglePlayback(): void {
  if (singlePlayback || typeof document === 'undefined') return
  singlePlayback = true
  document.addEventListener(
    'play',
    (e) => {
      document.querySelectorAll<HTMLAudioElement>('audio[data-ap]').forEach((a) => {
        if (a !== e.target && !a.paused) a.pause()
      })
    },
    true,
  )
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}
