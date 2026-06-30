'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { CommandPalette } from './CommandPalette'

type GlobalSearchContextValue = {
  openSearch: (initialQuery?: string) => void
}

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null)

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [initialQuery, setInitialQuery] = useState('')
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  const openSearch = useCallback((query = '') => {
    restoreFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    setInitialQuery(query)
    setOpen(true)
  }, [])

  const closeSearch = useCallback(() => {
    setOpen(false)
    requestAnimationFrame(() => restoreFocusRef.current?.focus())
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (open) closeSearch()
        else openSearch()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeSearch, open, openSearch])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  const value = useMemo(() => ({ openSearch }), [openSearch])

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
      <CommandPalette open={open} initialQuery={initialQuery} onClose={closeSearch} />
    </GlobalSearchContext.Provider>
  )
}

export function useGlobalSearch() {
  const context = useContext(GlobalSearchContext)
  if (!context) {
    throw new Error('useGlobalSearch must be used within GlobalSearchProvider')
  }
  return context
}
