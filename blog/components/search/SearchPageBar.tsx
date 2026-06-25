'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Ic } from '../ui/Ic'

export function SearchPageBar() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const [value, setValue] = useState(q)
  const router = useRouter()

  useEffect(() => {
    setValue(q)
  }, [q])

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const v = value.trim()
      router.push(v ? `/buscar?q=${encodeURIComponent(v)}` : '/buscar')
    }
  }

  return (
    <div className="ab-search ab-search-lg" style={{ maxWidth: 600, width: '100%', margin: '0 auto' }}>
      <Ic name="search" size={22} className="lead" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Buscar artículos, series, tags o categorías…"
        aria-label="Buscar en el blog"
        autoComplete="off"
        autoFocus={!q}
      />
    </div>
  )
}
