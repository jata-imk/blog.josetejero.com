'use client'

import { useState, useEffect, useLayoutEffect, useCallback } from 'react'

const KEY = 'theme'

// En el server, useLayoutEffect emite un warning ("does nothing on the server").
// Usamos useEffect ahí y useLayoutEffect solo en browser, para evitar el warning
// sin reintroducir el flicker del icono que useLayoutEffect evita en cliente.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function readTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useIsomorphicLayoutEffect(() => {
    setTheme(readTheme())
  }, [])

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.dataset.theme = next
      try { localStorage.setItem(KEY, next) } catch { /* noop */ }
      return next
    })
  }, [])

  return { theme, toggle } as const
}
