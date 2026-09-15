'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Ic } from '../ui/Ic'

export interface NavLink {
  label: string
  href: string
}

export interface SocialLink extends NavLink {
  name: string
}

// Menú de navegación para ≤768px (en desktop el botón no se muestra: ver .mobile-nav-trigger).
// <dialog> + showModal() da gratis foco atrapado, fondo inerte y Esc; el panel entra desde la
// derecha como hoja lateral. Mismo patrón que el panel del Cuaderno (ADR 0036).
export function MobileNav({
  links,
  social,
  isActive,
}: {
  links: NavLink[]
  social: SocialLink[]
  isActive: (href: string) => boolean
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  const openMenu = useCallback(() => {
    dialogRef.current?.showModal()
    setOpen(true)
  }, [])

  const closeMenu = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  const onClose = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  // Si la ventana crece a desktop con el menú abierto, se cierra (el botón deja de existir).
  useEffect(() => {
    if (!open) return
    const mq = window.matchMedia('(min-width: 769px)')
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) closeMenu()
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [open, closeMenu])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="icon-btn mobile-nav-trigger"
        aria-label="Abrir menú"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openMenu}
      >
        <Ic name="menu" size={20} sw={1.9} />
      </button>

      <dialog
        ref={dialogRef}
        className="mobile-nav"
        aria-label="Menú de navegación"
        onClose={onClose}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeMenu()
        }}
      >
        <div className="mobile-nav-panel">
          <div className="mobile-nav-head">
            <span className="mobile-nav-title font-sketch">índice del cuaderno</span>
            <button type="button" className="icon-btn" onClick={closeMenu} aria-label="Cerrar menú">
              <Ic name="xCircle" size={20} sw={1.8} />
            </button>
          </div>

          <nav aria-label="Navegación principal (móvil)">
            <ul className="mobile-nav-links">
              {links.map((link) => {
                const active = isActive(link.href)
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className={active ? 'active' : undefined}
                      aria-current={active ? 'page' : undefined}
                      onClick={closeMenu}
                    >
                      {link.label}
                      <Ic name="chevRight" size={16} sw={2} />
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="mobile-nav-social">
            {social.map((s) => (
              <a
                key={s.name}
                href={s.href}
                className="icon-btn"
                aria-label={s.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Ic name={s.name} size={18} sw={1.8} />
              </a>
            ))}
          </div>
        </div>
      </dialog>
    </>
  )
}
