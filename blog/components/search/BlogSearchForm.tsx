'use client'

import { useRef } from 'react'
import { Ic } from '../ui/Ic'

/* Progressive enhancement: opens modal with JS, falls back to GET /buscar without JS */
export function BlogSearchForm() {
  const inputRef = useRef<HTMLInputElement>(null)

  function openModalWithQuery(e: React.MouseEvent | React.FocusEvent) {
    e.preventDefault()
    const currentQuery = inputRef.current?.value || ''
    window.dispatchEvent(new CustomEvent('openCommandPalette', {
      detail: { initialQuery: currentQuery }
    }))
  }

  return (
    <form action="/buscar" method="GET">
      <div
        className="ab-search"
        style={{ maxWidth: 480, cursor: 'pointer' }}
        onClick={openModalWithQuery}
      >
        <Ic name="search" size={18} className="lead" />
        <input
          ref={inputRef}
          type="search"
          name="q"
          placeholder="Buscar posts, series, tags o categorías…"
          aria-label="Buscar"
          autoComplete="off"
          onFocus={openModalWithQuery}
        />
      </div>
    </form>
  )
}
