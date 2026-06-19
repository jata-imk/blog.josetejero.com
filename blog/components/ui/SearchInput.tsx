'use client'

import { useState } from 'react'
import { Ic } from './Ic'

export function SearchInput({
  placeholder = 'Buscar artículos…',
  lg,
  onSearch,
}: {
  placeholder?: string
  lg?: boolean
  onSearch?: (q: string) => void
}) {
  const [value, setValue] = useState('')

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onSearch?.(value)
  }

  return (
    <div className={`ab-search${lg ? ' ab-search-lg' : ''}`}>
      <Ic name="search" size={18} className="lead" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{
          width: '100%',
          paddingLeft: 44,
          paddingRight: lg ? 48 : 16,
          height: lg ? 48 : 40,
          fontSize: lg ? 15 : 14,
          borderRadius: 'var(--r)',
          border: '1px solid var(--line-2)',
          background: 'var(--bg)',
          color: 'var(--ink)',
          fontFamily: 'inherit',
          outline: 'none',
        }}
      />
      {lg && (
        <kbd style={{
          position: 'absolute', right: 14,
          fontSize: 11, fontFamily: 'var(--font-mono)',
          color: 'var(--muted)', background: 'var(--bg-soft-2)',
          border: '1px solid var(--line-2)', borderRadius: 5,
          padding: '2px 6px',
        }}>
          ↵
        </kbd>
      )}
    </div>
  )
}
