'use client'

import { Ic } from '../ui/Ic'

export function SearchTriggerBtn() {
  function openPalette() {
    window.dispatchEvent(new CustomEvent('openCommandPalette'))
  }

  return (
    <button
      onClick={openPalette}
      className="icon-btn"
      aria-label="Buscar (⌘K)"
      title="Buscar (⌘K)"
      style={{ cursor: 'pointer' }}
    >
      <Ic name="search" size={18} sw={1.8} />
    </button>
  )
}
