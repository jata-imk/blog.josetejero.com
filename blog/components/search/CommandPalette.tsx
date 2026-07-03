'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { SearchResults } from '../../lib/data/search'
import { Ic } from '../ui/Ic'

type HitEntry = {
  kind: 'post' | 'series' | 'category' | 'tag'
  href: string
  label: string
  sub?: string
}

type CommandPaletteProps = {
  open: boolean
  initialQuery?: string
  onClose: () => void
}

function flattenSearchResults(data: SearchResults): HitEntry[] {
  return [
    ...data.groups.posts.map((post) => ({
      kind: 'post' as const,
      href: `/blog/${post.slug}`,
      label: post.title,
      sub: post.excerpt ?? undefined,
    })),
    ...data.groups.series.map((series) => ({
      kind: 'series' as const,
      href: `/series/${series.slug}`,
      label: series.title,
      sub: 'Serie',
    })),
    ...data.groups.categories.map((category) => ({
      kind: 'category' as const,
      href: `/categorias/${category.slug}`,
      label: category.name,
      sub: 'Categoría',
    })),
    ...data.groups.tags.map((tag) => ({
      kind: 'tag' as const,
      href: `/tags/${tag.slug}`,
      label: tag.name,
      sub: 'Tag',
    })),
  ]
}

function kindIcon(kind: HitEntry['kind']) {
  if (kind === 'post') return 'fileText'
  if (kind === 'series') return 'layers'
  if (kind === 'category') return 'briefcase'
  return 'sparkles'
}

function useDebouncedValue<T>(value: T, ms: number) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebounced(value), ms)
    return () => window.clearTimeout(timeoutId)
  }, [ms, value])

  return debounced
}

export function CommandPalette({ open, initialQuery = '', onClose }: CommandPaletteProps) {
  const titleId = useId()
  const statusId = useId()
  const [q, setQ] = useState('')
  const [data, setData] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState(-1)
  const [inputFocused, setInputFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const debouncedQ = useDebouncedValue(q, 220)
  const trimmedQ = q.trim()

  const hits = useMemo(() => (data ? flattenSearchResults(data) : []), [data])

  const close = useCallback(() => {
    setQ('')
    setData(null)
    setError(null)
    setLoading(false)
    setCursor(-1)
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return

    setQ(initialQuery)
    setData(null)
    setError(null)
    setLoading(false)
    setCursor(-1)
    window.setTimeout(() => inputRef.current?.focus(), 30)
  }, [initialQuery, open])

  useEffect(() => {
    if (!open) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [close, open])

  useEffect(() => {
    if (!open) return

    function trapFocus(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !panelRef.current) return

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null)

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', trapFocus)
    return () => window.removeEventListener('keydown', trapFocus)
  }, [open])

  useEffect(() => {
    if (!open) return

    const term = debouncedQ.trim()
    if (term.length < 2) {
      setData(null)
      setError(null)
      setLoading(false)
      setCursor(-1)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Search request failed')
        return response.json() as Promise<SearchResults>
      })
      .then((results) => {
        setData(results)
        setCursor(-1)
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setData(null)
        setError('No se pudo cargar la búsqueda. Intenta de nuevo o abre la página completa.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [debouncedQ, open])

  useEffect(() => {
    if (cursor < 0 || !listRef.current) return
    const item = listRef.current.children[cursor] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  function navigateToSearch() {
    if (!trimmedQ) return
    window.location.href = `/buscar?q=${encodeURIComponent(trimmedQ)}`
    close()
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      if (!hits.length) return
      e.preventDefault()
      setCursor((current) => Math.min(current + 1, hits.length - 1))
      return
    }

    if (e.key === 'ArrowUp') {
      if (!hits.length) return
      e.preventDefault()
      setCursor((current) => Math.max(current - 1, -1))
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      const selected = cursor >= 0 ? hits[cursor] : undefined
      if (selected) {
        window.location.href = selected.href
        close()
        return
      }
      navigateToSearch()
    }
  }

  function renderStatus() {
    if (!trimmedQ) {
      return (
        <StatusMessage icon="search" title="Busca en el blog" tone="muted">
          Escribe para encontrar posts, series, tags o categorías.
        </StatusMessage>
      )
    }

    if (trimmedQ.length < 2) {
      return (
        <StatusMessage icon="info" title="Escribe al menos 2 caracteres" tone="muted">
          La búsqueda se activa cuando hay suficiente texto.
        </StatusMessage>
      )
    }

    if (loading) {
      return (
        <StatusMessage icon="sparkles" title="Buscando..." tone="muted">
          Consultando posts, series, tags y categorías.
        </StatusMessage>
      )
    }

    if (error) {
      return (
        <StatusMessage icon="alertTri" title="No se pudo buscar" tone="danger">
          {error}
        </StatusMessage>
      )
    }

    if (data && hits.length === 0) {
      return (
        <StatusMessage icon="frown" title={`Sin resultados para "${trimmedQ}"`} tone="muted">
          Prueba con otros términos o abre la búsqueda completa.
        </StatusMessage>
      )
    }

    return null
  }

  if (!open) return null

  const status = renderStatus()

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={status ? statusId : undefined}
      style={overlayStyle}
    >
      <button
        aria-label="Cerrar búsqueda"
        onClick={close}
        style={backdropStyle}
        type="button"
      />

      <div ref={panelRef} style={panelStyle}>
        <div style={headerStyle}>
          <div
            style={{
              ...searchBoxStyle,
              borderColor: inputFocused ? 'var(--blue)' : 'var(--line-2)',
              boxShadow: inputFocused ? 'var(--ring)' : 'var(--sh-1)',
            }}
          >
            <span style={searchIconStyle}>
              <Ic name={loading ? 'sparkles' : 'search'} size={18} />
            </span>
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              onKeyDown={onInputKeyDown}
              placeholder="Buscar artículos, series, tags..."
              aria-label="Buscar"
              aria-controls={hits.length ? 'command-search-results' : undefined}
              autoComplete="off"
              style={inputStyle}
            />
            <button type="button" onClick={close} aria-label="Cerrar búsqueda" style={closeButtonStyle}>
              Esc
            </button>
          </div>

          <h2 id={titleId} style={titleStyle}>Búsqueda rápida</h2>
        </div>

        <div id={statusId} aria-live="polite">
          {status}
        </div>

        {hits.length > 0 && (
          <ul id="command-search-results" ref={listRef} aria-label="Resultados" style={resultsStyle}>
            {hits.map((hit, index) => (
              <li key={`${hit.kind}-${hit.href}`} id={`command-result-${index}`} style={resultItemStyle}>
                <a
                  href={hit.href}
                  onClick={close}
                  onMouseEnter={() => setCursor(index)}
                  style={{
                    ...resultLinkStyle,
                    background: cursor === index ? 'var(--bg-soft)' : 'transparent',
                  }}
                >
                  <span style={resultIconStyle}>
                    <Ic name={kindIcon(hit.kind)} size={15} />
                  </span>
                  <span style={resultTextStyle}>
                    <span style={resultLabelStyle}>{hit.label}</span>
                    {hit.sub && <span style={resultSubStyle}>{hit.sub}</span>}
                  </span>
                  <span style={resultArrowStyle}>
                    <Ic name="chevRight" size={14} />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}

        {trimmedQ.length > 0 && (
          <div style={footerStyle}>
            <button type="button" onClick={navigateToSearch} style={fullSearchButtonStyle}>
              Ver todos los resultados para "{trimmedQ}"
              <Ic name="arrowRight" size={13} />
            </button>
            <div style={shortcutRowStyle} aria-hidden>
              <kbd style={kbdStyle}>↑↓</kbd>
              <span>navegar</span>
              <kbd style={kbdStyle}>Enter</kbd>
              <span>abrir</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusMessage({
  icon,
  title,
  tone,
  children,
}: {
  icon: string
  title: string
  tone: 'muted' | 'danger'
  children: React.ReactNode
}) {
  const color = tone === 'danger' ? 'var(--rose-700)' : 'var(--ink-3)'
  const background = tone === 'danger' ? 'var(--rose-tint)' : 'var(--bg-soft)'

  return (
    <div style={statusMessageStyle}>
      <span style={{ ...statusIconStyle, color, background }}>
        <Ic name={icon} size={18} />
      </span>
      <strong style={statusTitleStyle}>{title}</strong>
      <span style={statusCopyStyle}>{children}</span>
    </div>
  )
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 9000,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: 'clamp(52px, 9vh, 104px) 18px 28px',
  background: 'var(--overlay)',
  WebkitBackdropFilter: 'blur(5px)',
  backdropFilter: 'blur(5px)',
  isolation: 'isolate',
}

const backdropStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  border: 0,
  padding: 0,
  cursor: 'default',
  background: 'transparent',
}

const panelStyle: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  width: 'min(100%, 640px)',
  maxHeight: 'min(720px, calc(100vh - 72px))',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--bg)',
  border: '1px solid var(--line-2)',
  borderRadius: 'var(--r-xl)',
  boxShadow: 'var(--sh-panel)',
}

const headerStyle: CSSProperties = {
  padding: 16,
  borderBottom: '1px solid var(--line)',
}

const titleStyle: CSSProperties = {
  marginTop: 12,
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--ink-3)',
  letterSpacing: '.06em',
  textTransform: 'uppercase',
}

const searchBoxStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  minHeight: 52,
  padding: '8px 10px 8px 14px',
  border: '1px solid var(--line-2)',
  borderRadius: 'var(--r-lg)',
  background: 'var(--bg)',
  transition: 'border-color .15s, box-shadow .15s',
}

const searchIconStyle: CSSProperties = {
  display: 'flex',
  color: 'var(--ink-3)',
  flexShrink: 0,
}

const inputStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  border: 0,
  outline: 'none',
  boxShadow: 'none',
  borderRadius: 0,
  background: 'transparent',
  color: 'var(--ink)',
  fontFamily: 'inherit',
  fontSize: 16,
  lineHeight: 1.4,
}

const closeButtonStyle: CSSProperties = {
  flexShrink: 0,
  border: '1px solid var(--line-2)',
  borderRadius: 7,
  background: 'var(--bg-soft-2)',
  color: 'var(--muted)',
  cursor: 'pointer',
  padding: '3px 7px',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
}

const resultsStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: '8px 0',
  maxHeight: 390,
  overflowY: 'auto',
}

const resultItemStyle: CSSProperties = {
  margin: 0,
}

const resultLinkStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 18px',
  textDecoration: 'none',
  transition: 'background .1s',
}

const resultIconStyle: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  background: 'var(--bg-soft-2)',
  border: '1px solid var(--line)',
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  color: 'var(--ink-3)',
}

const resultTextStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
}

const resultLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 650,
  color: 'var(--ink)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const resultSubStyle: CSSProperties = {
  display: 'block',
  marginTop: 2,
  fontSize: 12.5,
  color: 'var(--ink-3)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const resultArrowStyle: CSSProperties = {
  color: 'var(--muted)',
  flexShrink: 0,
  display: 'flex',
}

const statusMessageStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  padding: '34px 24px 36px',
  textAlign: 'center',
}

const statusIconStyle: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 12,
  display: 'grid',
  placeItems: 'center',
  border: '1px solid var(--line)',
}

const statusTitleStyle: CSSProperties = {
  fontSize: 15,
  color: 'var(--ink)',
}

const statusCopyStyle: CSSProperties = {
  maxWidth: 340,
  fontSize: 13.5,
  color: 'var(--ink-3)',
}

const footerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '11px 16px',
  borderTop: '1px solid var(--line)',
}

const fullSearchButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  minWidth: 0,
  border: 0,
  background: 'transparent',
  color: 'var(--blue)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 13,
  fontWeight: 600,
  textAlign: 'left',
}

const shortcutRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  flexShrink: 0,
  fontSize: 11,
  color: 'var(--muted)',
}

const kbdStyle: CSSProperties = {
  color: 'var(--ink-3)',
  background: 'var(--bg-soft-2)',
  border: '1px solid var(--line-2)',
  borderRadius: 4,
  padding: '1px 5px',
  fontFamily: 'var(--font-mono)',
  fontSize: 10.5,
}
