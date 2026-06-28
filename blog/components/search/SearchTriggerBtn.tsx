'use client'

import { Ic } from '../ui/Ic'
import { useGlobalSearch } from './GlobalSearchProvider'

export function SearchTriggerBtn() {
  const { openSearch } = useGlobalSearch()

  return (
    <button
      onClick={() => openSearch()}
      className="icon-btn"
      aria-label="Buscar (Ctrl+K o Cmd+K)"
      title="Buscar (Ctrl+K o Cmd+K)"
      style={{ cursor: 'pointer' }}
    >
      <Ic name="search" size={18} sw={1.8} />
    </button>
  )
}
