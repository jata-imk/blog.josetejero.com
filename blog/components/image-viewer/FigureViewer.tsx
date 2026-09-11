'use client'

import {
  createContext,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { flushSync } from 'react-dom'
import type { PanzoomObject } from '@panzoom/panzoom'
import { Ic } from '@/components/ui/Ic'
import { figureAccessibleLabel, type ViewerFigure } from '@/lib/figures'

type ViewerContextValue = {
  openFigure: (id: string, trigger: HTMLAnchorElement) => void
}

const ViewerContext = createContext<ViewerContextValue | null>(null)

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function visible(element: HTMLElement | null): element is HTMLElement {
  if (!element) return false
  const rect = element.getBoundingClientRect()
  return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth
}

function sourceImage(trigger: HTMLAnchorElement | null): HTMLImageElement | null {
  return trigger?.querySelector('img') ?? null
}

export function FigureTrigger({
  figure,
  children,
  className,
}: {
  figure: ViewerFigure
  children: ReactNode
  className?: string
}) {
  const viewer = useContext(ViewerContext)
  const label = figureAccessibleLabel(figure)

  return (
    <a
      id={`figura-${figure.id}`}
      href={figure.sharePath}
      className={`figure-trigger${className ? ` ${className}` : ''}`}
      aria-label={`Abrir en el visor: ${label}`}
      data-figure-trigger={figure.id}
      onClick={(event) => {
        if (
          !viewer ||
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) return
        event.preventDefault()
        viewer.openFigure(figure.id, event.currentTarget)
      }}
    >
      {children}
    </a>
  )
}

export function FigureViewerProvider({
  figures,
  basePath,
  initialFigureId,
  children,
}: {
  figures: ViewerFigure[]
  basePath: string
  initialFigureId?: string
  children: ReactNode
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const panzoomRef = useRef<PanzoomObject | null>(null)
  const invokerRef = useRef<HTMLAnchorElement | null>(null)
  const morphSourceRef = useRef<HTMLAnchorElement | null>(null)
  const closingRef = useRef(false)
  const entryModeRef = useRef<'base' | 'direct'>('direct')
  const initializedRef = useRef(false)
  const swipeRef = useRef<{ x: number; y: number; at: number; figureId: string } | null>(null)
  const lastTapRef = useRef<{ x: number; y: number; at: number; figureId: string } | null>(null)
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [displaySrc, setDisplaySrc] = useState('')
  const [displayFigureId, setDisplayFigureId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [readyFigureId, setReadyFigureId] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [copied, setCopied] = useState(false)

  const current = currentIndex === null ? null : figures[currentIndex]

  const figureIndex = useMemo(
    () => new Map(figures.map((figure, index) => [figure.id, index])),
    [figures],
  )

  const showDialog = useCallback(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      dialog.showModal()
      dialog.querySelector<HTMLElement>('[data-viewer-close]')?.focus()
    }
  }, [])

  const instantOpen = useCallback((index: number) => {
    flushSync(() => setCurrentIndex(index))
    showDialog()
  }, [showDialog])

  const openWithMorph = useCallback((index: number, trigger: HTMLAnchorElement) => {
    const source = sourceImage(trigger)
    const documentWithTransition = document as ViewTransitionDocument
    if (!documentWithTransition.startViewTransition || prefersReducedMotion() || !visible(source)) {
      instantOpen(index)
      return
    }

    source.style.viewTransitionName = 'figure-morph'
    const transition = documentWithTransition.startViewTransition(() => {
      source.style.viewTransitionName = ''
      flushSync(() => setCurrentIndex(index))
      showDialog()
    })
    void transition.finished.finally(() => {
      source.style.viewTransitionName = ''
    })
  }, [instantOpen, showDialog])

  const openFigure = useCallback((id: string, trigger: HTMLAnchorElement) => {
    const index = figureIndex.get(id)
    if (index === undefined) return
    invokerRef.current = trigger
    morphSourceRef.current = trigger
    closingRef.current = false
    entryModeRef.current = 'base'
    window.history.pushState({ figureViewer: true }, '', figures[index].sharePath)
    openWithMorph(index, trigger)
  }, [figureIndex, figures, openWithMorph])

  const finishClose = useCallback((restoreFocus: boolean) => {
    const dialog = dialogRef.current
    if (dialog?.open) dialog.close()
    flushSync(() => setCurrentIndex(null))
    closingRef.current = false
    if (restoreFocus) {
      const target = invokerRef.current ?? document.querySelector<HTMLElement>('h1')
      target?.focus({ preventScroll: true })
    }
  }, [])

  const closeVisually = useCallback((restoreFocus = true) => {
    const trigger = morphSourceRef.current
    const target = imageRef.current
    const documentWithTransition = document as ViewTransitionDocument
    const source = sourceImage(trigger)
    if (
      !documentWithTransition.startViewTransition ||
      prefersReducedMotion() ||
      !visible(source) ||
      !target
    ) {
      finishClose(restoreFocus)
      return
    }

    const transition = documentWithTransition.startViewTransition(() => {
      finishClose(false)
      source.style.viewTransitionName = 'figure-morph'
    })
    void transition.finished.finally(() => {
      source.style.viewTransitionName = ''
      if (restoreFocus) {
        const focusTarget = invokerRef.current ?? document.querySelector<HTMLElement>('h1')
        focusTarget?.focus({ preventScroll: true })
      }
    })
  }, [finishClose])

  const requestClose = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    if (entryModeRef.current === 'base') {
      window.history.back()
      window.setTimeout(() => {
        if (dialogRef.current?.open) closingRef.current = false
      }, 1000)
      return
    }
    window.history.replaceState({}, '', basePath)
    closeVisually()
  }, [basePath, closeVisually])

  const moveTo = useCallback((index: number, replaceHistory = true) => {
    if (index < 0 || index >= figures.length) return
    panzoomRef.current?.reset({ animate: false })
    setScale(1)
    setCopied(false)
    setCurrentIndex(index)
    morphSourceRef.current = document.querySelector<HTMLAnchorElement>(
      `[data-figure-trigger="${CSS.escape(figures[index].id)}"]`,
    )
    if (replaceHistory) window.history.replaceState({ figureViewer: true }, '', figures[index].sharePath)
  }, [figures])

  // Entrada directa a /figura/[id]: el fallback SSR permanece en <noscript> y
  // la mejora cliente abre el mismo contenido al hidratar.
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    if (!initialFigureId) return
    const index = figureIndex.get(initialFigureId)
    if (index === undefined) return
    entryModeRef.current = 'direct'
    invokerRef.current = null
    morphSourceRef.current = document.querySelector<HTMLAnchorElement>(
      `[data-figure-trigger="${CSS.escape(initialFigureId)}"]`,
    )
    instantOpen(index)
  }, [figureIndex, initialFigureId, instantOpen])

  useEffect(() => {
    const onPopState = () => {
      closingRef.current = false
      const path = window.location.pathname
      if (path === basePath || path === `${basePath}/`) {
        closeVisually()
        return
      }
      const prefix = `${basePath}/figura/`
      if (!path.startsWith(prefix)) return
      const id = decodeURIComponent(path.slice(prefix.length))
      const index = figureIndex.get(id)
      if (index === undefined) return
      if (dialogRef.current?.open) {
        moveTo(index, false)
      } else {
        entryModeRef.current = 'base'
        morphSourceRef.current = document.querySelector<HTMLAnchorElement>(
          `[data-figure-trigger="${CSS.escape(id)}"]`,
        )
        instantOpen(index)
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [basePath, closeVisually, figureIndex, instantOpen, moveTo])

  useEffect(() => {
    if (currentIndex === null) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [currentIndex])

  // Solo al abrir/cambiar se solicita el original. El preview se pinta de
  // inmediato; el swap sucede después de decode para evitar un flash vacío.
  useEffect(() => {
    if (!current) return
    let cancelled = false
    let original: HTMLImageElement | null = null
    setDisplaySrc(current.previewSrc)
    setDisplayFigureId(current.id)
    setLoadError(false)
    setReadyFigureId(null)
    const timer = window.setTimeout(() => {
      original = new Image()
      original.src = current.fullSrc
      const decoded = typeof original.decode === 'function'
        ? original.decode()
        : new Promise<void>((resolve, reject) => {
            if (!original) return reject(new Error('Carga cancelada'))
            original.onload = () => resolve()
            original.onerror = () => reject(new Error('No se pudo cargar la imagen'))
          })
      void decoded.then(() => {
        if (!cancelled) {
          setDisplaySrc(current.fullSrc)
          setDisplayFigureId(current.id)
        }
      }).catch(() => {
        if (!cancelled) setLoadError(true)
      })
    }, 120)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      if (original) original.src = 'data:,'
    }
  }, [current])

  useEffect(() => {
    if (!current || readyFigureId !== current.id || !imageRef.current) return
    let disposed = false
    let instance: PanzoomObject | null = null
    const image = imageRef.current
    const viewport = image.parentElement
    if (!viewport) return

    void import('@panzoom/panzoom').then(({ default: Panzoom }) => {
      if (disposed) return
      instance = Panzoom(image, {
        canvas: true,
        contain: 'outside',
        minScale: 1,
        maxScale: 8,
        step: 0.25,
        panOnlyWhenZoomed: true,
        pinchAndPan: true,
        animate: !prefersReducedMotion(),
        duration: 180,
      })
      const oneToOne = image.clientWidth > 0 ? image.naturalWidth / image.clientWidth : 1
      instance.setOptions({ maxScale: Math.min(8, Math.max(4, oneToOne)) })
      panzoomRef.current = instance
      setScale(instance.getScale())
      const onChange = (event: Event) => {
        const detail = (event as CustomEvent<{ scale: number }>).detail
        setScale(detail.scale)
      }
      const onWheel = (event: WheelEvent) => instance?.zoomWithWheel(event)
      image.addEventListener('panzoomchange', onChange)
      viewport.addEventListener('wheel', onWheel, { passive: false })

      const cleanup = () => {
        image.removeEventListener('panzoomchange', onChange)
        viewport.removeEventListener('wheel', onWheel)
      }
      ;(instance as PanzoomObject & { __cleanup?: () => void }).__cleanup = cleanup
    })

    return () => {
      disposed = true
      const active = instance as (PanzoomObject & { __cleanup?: () => void }) | null
      active?.__cleanup?.()
      active?.destroy()
      if (panzoomRef.current === instance) panzoomRef.current = null
      setScale(1)
    }
  }, [current, readyFigureId])

  const updateMaxScale = useCallback(() => {
    const image = imageRef.current
    const panzoom = panzoomRef.current
    if (!image || !panzoom || image.naturalWidth <= 0 || image.naturalHeight <= 0) return
    const oneToOne = image.clientWidth > 0 ? image.naturalWidth / image.clientWidth : 1
    panzoom.setOptions({ maxScale: Math.min(8, Math.max(4, oneToOne)) })
  }, [])

  const handleKeys = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (currentIndex === null) return
    const panzoom = panzoomRef.current
    const zoomed = scale > 1.01
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      if (zoomed) panzoom?.pan(64, 0, { relative: true })
      else moveTo(currentIndex - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      if (zoomed) panzoom?.pan(-64, 0, { relative: true })
      else moveTo(currentIndex + 1)
    } else if (zoomed && event.key === 'ArrowUp') {
      event.preventDefault()
      panzoom?.pan(0, 64, { relative: true })
    } else if (zoomed && event.key === 'ArrowDown') {
      event.preventDefault()
      panzoom?.pan(0, -64, { relative: true })
    }
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.isPrimary && scale <= 1.01 && current) {
      swipeRef.current = { x: event.clientX, y: event.clientY, at: Date.now(), figureId: current.id }
    }
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current
    swipeRef.current = null
    if (!start || !current || start.figureId !== current.id || currentIndex === null || scale > 1.01) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (event.pointerType === 'touch' && Math.abs(dx) < 12 && Math.abs(dy) < 12) {
      const now = Date.now()
      const last = lastTapRef.current
      if (
        last &&
        last.figureId === current.id &&
        now - last.at < 300 &&
        Math.hypot(event.clientX - last.x, event.clientY - last.y) < 36
      ) togglePixelZoom()
      lastTapRef.current = { x: event.clientX, y: event.clientY, at: now, figureId: current.id }
      return
    }
    if (Date.now() - start.at > 700 || Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.25) return
    moveTo(dx < 0 ? currentIndex + 1 : currentIndex - 1)
  }

  const togglePixelZoom = () => {
    const panzoom = panzoomRef.current
    const image = imageRef.current
    if (!panzoom || !image || !current) return
    if (scale > 1.01) {
      panzoom.reset({ animate: !prefersReducedMotion() })
      return
    }
    const oneToOne = image.clientWidth > 0 ? image.naturalWidth / image.clientWidth : 2
    const target = current.mimeType === 'image/svg+xml' ? 2 : Math.max(1, oneToOne)
    panzoom.zoom(Math.min(panzoom.getOptions().maxScale ?? 8, target), {
      animate: !prefersReducedMotion(),
    })
  }

  const copyLink = async () => {
    if (!current) return
    try {
      await navigator.clipboard.writeText(new URL(current.sharePath, window.location.origin).href)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <ViewerContext.Provider value={{ openFigure }}>
      {children}
      <dialog
        ref={dialogRef}
        className="figure-viewer"
        aria-label="Visor de figuras"
        onKeyDown={handleKeys}
        onCancel={(event) => {
          event.preventDefault()
          requestClose()
        }}
      >
        {current && currentIndex !== null && (
          <div className="figure-viewer-shell">
            <div className="figure-viewer-toolbar" aria-label="Controles del visor">
              <span className="figure-viewer-counter" aria-live="polite">
                Figura {currentIndex + 1} de {figures.length}
              </span>
              <div className="figure-viewer-actions">
                <button type="button" onClick={() => panzoomRef.current?.zoomOut({ animate: !prefersReducedMotion() })} aria-label="Alejar">
                  <Ic name="minus" />
                </button>
                <output aria-label="Nivel de zoom">{Math.round(scale * 100)}%</output>
                <button type="button" onClick={() => panzoomRef.current?.zoomIn({ animate: !prefersReducedMotion() })} aria-label="Acercar">
                  <Ic name="plus" />
                </button>
                <button type="button" onClick={() => panzoomRef.current?.reset({ animate: !prefersReducedMotion() })}>
                  Ajustar
                </button>
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  aria-label={copied ? 'Enlace copiado' : 'Copiar enlace de esta figura'}
                >
                  <Ic name={copied ? 'check2' : 'copy'} />
                </button>
                <a href={current.fullSrc} target="_blank" rel="noopener noreferrer" aria-label="Abrir imagen original">
                  <Ic name="externalLink" />
                </a>
                <button type="button" onClick={requestClose} aria-label="Cerrar visor" data-viewer-close>
                  <Ic name="xCircle" />
                </button>
              </div>
            </div>

            <div className="figure-viewer-stage">
              <button
                type="button"
                className="figure-viewer-nav previous"
                onClick={() => moveTo(currentIndex - 1)}
                disabled={currentIndex === 0}
                aria-label="Figura anterior"
              >
                <Ic name="chevLeft" />
              </button>
              <div
                className="figure-viewer-canvas"
                onDoubleClick={togglePixelZoom}
                onPointerDownCapture={handlePointerDown}
                onPointerUpCapture={handlePointerUp}
                onPointerCancel={() => { swipeRef.current = null }}
              >
                <img
                  key={current.id}
                  ref={imageRef}
                  src={displayFigureId === current.id && displaySrc ? displaySrc : current.previewSrc}
                  width={current.width}
                  height={current.height}
                  alt={current.alt}
                  draggable={false}
                  onLoad={(event) => {
                    if (event.currentTarget.naturalWidth <= 0 || event.currentTarget.naturalHeight <= 0) return
                    setReadyFigureId(current.id)
                    updateMaxScale()
                  }}
                  onError={() => {
                    setReadyFigureId(null)
                    setLoadError(true)
                  }}
                  style={{ viewTransitionName: 'figure-morph' }}
                />
              </div>
              <button
                type="button"
                className="figure-viewer-nav next"
                onClick={() => moveTo(currentIndex + 1)}
                disabled={currentIndex === figures.length - 1}
                aria-label="Figura siguiente"
              >
                <Ic name="chevRight" />
              </button>
            </div>

            <div className="figure-viewer-details">
              <p>{figureAccessibleLabel(current, currentIndex + 1)}</p>
              {loadError && (
                <p className="figure-viewer-error" role="status">
                  No se pudo cargar el original; se muestra la vista previa.
                </p>
              )}
            </div>

            {figures.length > 1 && <div className="figure-viewer-strip" aria-label="Figuras del contenido">
              {figures.map((figure, index) => (
                <button
                  type="button"
                  key={figure.id}
                  className={index === currentIndex ? 'active' : undefined}
                  aria-current={index === currentIndex ? 'true' : undefined}
                  aria-label={`Abrir ${figureAccessibleLabel(figure, index + 1)}`}
                  onClick={() => moveTo(index)}
                >
                  <img src={figure.thumbnailSrc} alt="" loading="lazy" />
                  <span>{index + 1}</span>
                </button>
              ))}
            </div>}
          </div>
        )}
      </dialog>
    </ViewerContext.Provider>
  )
}
