'use client'

import { useEffect, useRef } from 'react'

// Linterna del hero (ADR 0039): mientras el puntero recorre la zona, la cuadrícula del cuaderno se
// marca más en un círculo alrededor del cursor. No hay brillo ni blur (idioma Zine, ADR 0037):
// es la misma pauta con más tinta, revelada por una máscara radial.
//
// El componente no pinta nada: escucha el puntero sobre su contenedor y escribe --lamp-x/--lamp-y/
// --lamp-on en `.paper-canvas`, donde vive la capa `.paper-canvas-lamp`.
// Solo con puntero fino (mouse/trackpad) y sin prefers-reduced-motion.

export function HeroLamp() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const zone = ref.current?.parentElement
    const canvas = document.querySelector<HTMLElement>('.paper-canvas')
    if (!zone || !canvas) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let x = 0
    let y = 0
    const paint = () => {
      frame = 0
      canvas.style.setProperty('--lamp-x', `${x}px`)
      canvas.style.setProperty('--lamp-y', `${y}px`)
    }
    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      canvas.style.setProperty('--lamp-on', '1')
      if (!frame) frame = requestAnimationFrame(paint)
    }
    const onLeave = () => canvas.style.setProperty('--lamp-on', '0')

    zone.addEventListener('pointermove', onMove)
    zone.addEventListener('pointerleave', onLeave)
    return () => {
      zone.removeEventListener('pointermove', onMove)
      zone.removeEventListener('pointerleave', onLeave)
      if (frame) cancelAnimationFrame(frame)
      onLeave()
    }
  }, [])

  return <span ref={ref} hidden />
}
