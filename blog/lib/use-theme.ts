'use client'

import { useState, useLayoutEffect, useCallback } from 'react'

const KEY = 'theme'

function readTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useLayoutEffect(() => {
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
