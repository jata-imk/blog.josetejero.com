'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Ic } from '../ui/Ic'

type Post       = { id: number; title: string; slug: string; excerpt?: string | null; categories?: unknown[] | null }
type Series     = { id: number; title: string; slug: string }
type Category   = { id: number; name: string; slug: string }
type Tag        = { id: number; name: string; slug: string }
type SearchData = {
  groups: { posts: Post[]; series: Series[]; categories: Category[]; tags: Tag[] }
  counts: { posts: number; series: number; categories: number; tags: number }
}

type HitEntry = { kind: 'post' | 'series' | 'category' | 'tag'; href: string; label: string; sub?: string }

function flatten(data: SearchData): HitEntry[] {
  const hits: HitEntry[] = []
  for (const p of data.groups.posts) {
    hits.push({ kind: 'post', href: `/blog/${p.slug}`, label: p.title, sub: p.excerpt ?? undefined })
  }
  for (const s of data.groups.series) {
    hits.push({ kind: 'series', href: `/series/${s.slug}`, label: s.title, sub: 'Serie' })
  }
  for (const c of data.groups.categories) {
    hits.push({ kind: 'category', href: `/categorias/${c.slug}`, label: c.name, sub: 'Categoría' })
  }
  for (const t of data.groups.tags) {
    hits.push({ kind: 'tag', href: `/tags/${t.slug}`, label: t.name, sub: 'Tag' })
  }
  return hits
}

function kindIcon(kind: HitEntry['kind']): string {
  if (kind === 'post')     return 'fileText'
  if (kind === 'series')   return 'layers'
  if (kind === 'category') return 'briefcase'
  return 'sparkles'
}

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}

export function CommandPalette() {
  const [open, setOpen]     = useState(false)
  const [q, setQ]           = useState('')
  const [data, setData]     = useState<SearchData | null>(null)
  const [loading, setLoad]  = useState(false)
  const [cursor, setCursor] = useState(-1)
  const inputRef            = useRef<HTMLInputElement>(null)
  const listRef             = useRef<HTMLUListElement>(null)
  const panelRef            = useRef<HTMLDivElement>(null)
  const debouncedQ          = useDebounce(q, 220)

  const close = useCallback(() => {
    setOpen(false)
    setQ('')
    setData(null)
    setCursor(-1)
  }, [])

  /* ⌘K / Ctrl+K opens; Esc closes */
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape' && open) close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [close, open])

  /* Listen for explicit open signal from UI triggers */
  useEffect(() => {
    function handleOpenSignal(e: Event) {
      const customEvent = e as CustomEvent<{ initialQuery?: string }>
      setOpen(true)
      if (customEvent.detail?.initialQuery) {
        setQ(customEvent.detail.initialQuery)
      }
    }
    window.addEventListener('openCommandPalette', handleOpenSignal)
    return () => window.removeEventListener('openCommandPalette', handleOpenSignal)
  }, [])

  /* focus input when modal opens */
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30)
      setCursor(-1)
    }
  }, [open])

  /* focus trap: keep Tab inside panel */
  useEffect(() => {
    if (!open) return
    function trapFocus(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null)
      if (!focusable.length) return
      const first = focusable[0]
      const last  = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', trapFocus)
    return () => window.removeEventListener('keydown', trapFocus)
  }, [open])

  /* fetch results */
  useEffect(() => {
    if (!debouncedQ || debouncedQ.trim().length < 2) {
      setData(null)
      return
    }
    let cancelled = false
    setLoad(true)
    fetch(`/api/search?q=${encodeURIComponent(debouncedQ)}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) { setData(d); setLoad(false); setCursor(-1) } })
      .catch(() => { if (!cancelled) setLoad(false) })
    return () => { cancelled = true }
  }, [debouncedQ])

  const hits  = data ? flatten(data) : []
  const total = data
    ? data.groups.posts.length + data.groups.series.length + data.groups.categories.length + data.groups.tags.length
    : 0

  /* keyboard nav in list */
  function onKeyDown(e: React.KeyboardEvent) {
    if (!hits.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => Math.min(c + 1, hits.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => Math.max(c - 1, -1))
    } else if (e.key === 'Enter') {
      if (cursor >= 0 && hits[cursor]) {
        window.location.href = hits[cursor].href
        close()
      } else if (q.trim()) {
        window.location.href = `/buscar?q=${encodeURIComponent(q.trim())}`
        close()
      }
    }
  }

  /* scroll active item into view */
  useEffect(() => {
    if (cursor < 0 || !listRef.current) return
    const el = listRef.current.children[cursor] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Búsqueda rápida"
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: 'clamp(60px, 10vh, 120px)',
      }}
    >
      {/* backdrop */}
      <div
        aria-hidden
        onClick={close}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15,23,42,.45)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* panel */}
      <div
        ref={panelRef}
        style={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: 620,
          margin: '0 20px',
          background: 'var(--bg)',
          border: '1px solid var(--line-2)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--sh-3)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* input row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px',
          borderBottom: hits.length || loading ? '1px solid var(--line)' : undefined,
        }}>
          <span style={{ color: 'var(--ink-3)', flexShrink: 0, display: 'flex' }}>
            <Ic name={loading ? 'sparkles' : 'search'} size={18} className="lead" />
          </span>
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar artículos, series, tags…"
            aria-label="Buscar"
            style={{
              flex: 1, border: 0, outline: 'none',
              fontFamily: 'inherit', fontSize: 16, background: 'transparent',
              color: 'var(--ink)',
            }}
          />
          <button
            onClick={close}
            aria-label="Cerrar"
            style={{
              border: 0, background: 'transparent',
              cursor: 'pointer', padding: 4,
              color: 'var(--ink-3)',
            }}
          >
            <kbd style={{
              fontSize: 11, fontFamily: 'var(--font-mono)',
              color: 'var(--muted)', background: 'var(--bg-soft-2)',
              border: '1px solid var(--line-2)', borderRadius: 5,
              padding: '2px 6px',
            }}>Esc</kbd>
          </button>
        </div>

        {/* results */}
        {(hits.length > 0 || (data && total === 0 && q.trim().length >= 2)) && (
          <ul
            ref={listRef}
            role="listbox"
            aria-label="Resultados"
            style={{
              listStyle: 'none', margin: 0, padding: '8px 0',
              maxHeight: 380, overflowY: 'auto',
            }}
          >
            {hits.length === 0 ? (
              <li style={{
                padding: '24px 18px', textAlign: 'center',
                color: 'var(--muted)', fontSize: 14,
              }}>
                Sin resultados para «{q}»
              </li>
            ) : hits.map((hit, i) => (
              <li key={`${hit.kind}-${hit.href}`} role="option" aria-selected={cursor === i}>
                <a
                  href={hit.href}
                  onClick={close}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 18px',
                    background: cursor === i ? 'var(--bg-soft)' : undefined,
                    borderRadius: 0,
                    textDecoration: 'none',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={() => setCursor(i)}
                >
                  <span style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'var(--bg-soft-2)',
                    border: '1px solid var(--line)',
                    display: 'grid', placeItems: 'center',
                    flexShrink: 0, color: 'var(--ink-3)',
                  }}>
                    <Ic name={kindIcon(hit.kind)} size={15} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      display: 'block', fontSize: 14, fontWeight: 600,
                      color: 'var(--ink)', whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {hit.label}
                    </span>
                    {hit.sub && (
                      <span style={{
                        display: 'block', fontSize: 12.5,
                        color: 'var(--ink-3)', marginTop: 1,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {hit.sub}
                      </span>
                    )}
                  </span>
                  <span style={{ color: 'var(--muted)', flexShrink: 0, display: 'flex' }}>
                    <Ic name="chevRight" size={14} />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* footer */}
        {q.trim().length >= 2 && (
          <div style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--line)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <a
              href={`/buscar?q=${encodeURIComponent(q.trim())}`}
              onClick={close}
              style={{
                fontSize: 13, color: 'var(--blue)', fontWeight: 500,
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              Ver todos los resultados para «{q.trim()}»
              <Ic name="arrowRight" size={13} />
            </a>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <kbd style={kbdStyle}>↑↓</kbd>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>navegar</span>
              <kbd style={kbdStyle}>↵</kbd>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>abrir</span>
            </div>
          </div>
        )}

        {/* empty prompt */}
        {!q && (
          <div style={{
            padding: '28px 18px', textAlign: 'center',
            color: 'var(--muted)', fontSize: 14,
          }}>
            Escribe para buscar artículos, series, tags o categorías.
          </div>
        )}
      </div>
    </div>
  )
}

const kbdStyle: React.CSSProperties = {
  fontSize: 10.5, fontFamily: 'var(--font-mono)',
  color: 'var(--ink-3)', background: 'var(--bg-soft-2)',
  border: '1px solid var(--line-2)', borderRadius: 4,
  padding: '1px 5px',
}
