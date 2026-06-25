'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Ic } from '../ui/Ic'

// Worker served from public/ — version-matched to pdfjs-dist bundled in react-pdf 10.x
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

const ZOOM_MIN = 0.5
const ZOOM_MAX = 2.5
const ZOOM_STEP = 0.25
const ZOOM_DEFAULT = 1.0

interface PdfViewerProps {
  url: string
  fileName?: string
}

function LoadingState() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      minHeight: 320,
      color: 'var(--ink-3)',
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid var(--line-2)',
        borderTopColor: 'var(--blue)',
        borderRadius: '50%',
        animation: 'pdf-spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: 14 }}>Cargando documento…</span>
      <style>{`@keyframes pdf-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function ErrorState({ url, fileName }: { url: string; fileName: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      minHeight: 280,
      padding: '32px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        background: 'var(--rose-tint)',
        display: 'grid',
        placeItems: 'center',
        color: 'var(--rose)',
      }}>
        <Ic name="alertTri" size={24} sw={1.8} />
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
          No se pudo cargar el documento
        </div>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.55 }}>
          El visor no pudo renderizar el PDF. Puedes abrirlo o descargarlo directamente.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ fontSize: 14 }}
        >
          <Ic name="externalLink" size={15} sw={2} />Abrir en pestaña
        </a>
        <a href={url} download={fileName} className="btn btn-secondary" style={{ fontSize: 14 }}>
          <Ic name="download" size={15} sw={2} />Descargar PDF
        </a>
      </div>
    </div>
  )
}

function ToolbarDivider() {
  return (
    <div style={{
      width: 1,
      height: 20,
      background: 'var(--line-2)',
      margin: '0 4px',
      flexShrink: 0,
    }} />
  )
}

export function PdfViewer({ url, fileName = 'document.pdf' }: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(ZOOM_DEFAULT)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [pageWidth, setPageWidth] = useState(640)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setPageWidth(Math.max(200, entry.contentRect.width - 32))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const onLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n)
    setLoading(false)
  }, [])

  const onLoadError = useCallback(() => {
    setError(true)
    setLoading(false)
  }, [])

  const prevPage = () => setCurrentPage(p => Math.max(1, p - 1))
  const nextPage = () => setCurrentPage(p => Math.min(numPages, p + 1))
  const zoomIn  = () => setZoom(z => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))
  const zoomOut = () => setZoom(z => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))
  const resetZoom = () => setZoom(ZOOM_DEFAULT)

  const canPrev   = currentPage > 1
  const canNext   = currentPage < numPages
  const canZoomIn  = zoom < ZOOM_MAX
  const canZoomOut = zoom > ZOOM_MIN

  return (
    <div style={{
      borderRadius: 'var(--r-lg)',
      overflow: 'hidden',
      border: '1px solid var(--line-2)',
      background: 'var(--bg-soft)',
    }}>
      {/* ── Toolbar ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '6px 10px',
        borderBottom: '1px solid var(--line-2)',
        background: 'var(--bg)',
        flexWrap: 'wrap',
        minHeight: 48,
      }}>
        {/* Navigation */}
        <button
          onClick={prevPage}
          disabled={!canPrev}
          className="icon-btn"
          aria-label="Página anterior"
          style={{ opacity: canPrev ? 1 : 0.38 }}
        >
          <Ic name="chevLeft" size={16} sw={2} />
        </button>

        <span style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--ink-3)',
          minWidth: 68,
          textAlign: 'center',
          letterSpacing: '-.01em',
        }}>
          {numPages > 0 ? `${currentPage} / ${numPages}` : '—'}
        </span>

        <button
          onClick={nextPage}
          disabled={!canNext}
          className="icon-btn"
          aria-label="Página siguiente"
          style={{ opacity: canNext ? 1 : 0.38 }}
        >
          <Ic name="chevRight" size={16} sw={2} />
        </button>

        <ToolbarDivider />

        {/* Zoom */}
        <button
          onClick={zoomOut}
          disabled={!canZoomOut}
          className="icon-btn"
          aria-label="Alejar"
          style={{ opacity: canZoomOut ? 1 : 0.38 }}
        >
          <Ic name="minus" size={16} sw={2.2} />
        </button>

        <button
          onClick={resetZoom}
          aria-label="Restablecer zoom"
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: 'var(--ink-3)',
            background: 'var(--bg-soft)',
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--r-sm)',
            padding: '3px 8px',
            cursor: 'pointer',
            minWidth: 52,
            lineHeight: 1,
            height: 28,
            fontFamily: 'inherit',
            letterSpacing: '-.01em',
          }}
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          onClick={zoomIn}
          disabled={!canZoomIn}
          className="icon-btn"
          aria-label="Acercar"
          style={{ opacity: canZoomIn ? 1 : 0.38 }}
        >
          <Ic name="plus" size={16} sw={2.2} />
        </button>

        {/* spacer */}
        <div style={{ flex: 1, minWidth: 8 }} />

        {/* Actions */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="icon-btn"
          aria-label="Abrir en pestaña nueva"
        >
          <Ic name="externalLink" size={16} sw={2} />
        </a>

        <a
          href={url}
          download={fileName}
          className="icon-btn"
          aria-label="Descargar PDF"
        >
          <Ic name="download" size={16} sw={2} />
        </a>
      </div>

      {/* ── Document area ──────────────────────────────────────── */}
      <div
        ref={scrollRef}
        style={{
          overflow: 'auto',
          maxHeight: 700,
          display: 'flex',
          justifyContent: 'center',
          padding: '16px',
          background: 'var(--bg-soft-2)',
        }}
      >
        {error ? (
          <ErrorState url={url} fileName={fileName} />
        ) : (
          <Document
            file={url}
            onLoadSuccess={onLoadSuccess}
            onLoadError={onLoadError}
            loading={<LoadingState />}
          >
            {loading ? null : (
              <Page
                pageNumber={currentPage}
                width={Math.max(100, Math.round(pageWidth * zoom))}
                renderTextLayer
                renderAnnotationLayer
              />
            )}
          </Document>
        )}
      </div>
    </div>
  )
}
