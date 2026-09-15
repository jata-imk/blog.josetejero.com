'use client'

import { useEffect, useState } from 'react'

// Máquina de escribir del hero (ADR 0039). Rota temas escribiendo y borrando letra por letra.
// - SSR / sin JS: se ve la primera palabra completa (no hay salto al hidratar).
// - Lectores de pantalla: leen la lista completa en `srText`; la animación es aria-hidden.
// - prefers-reduced-motion: se queda fija en la primera palabra, sin cursor parpadeante.

const TYPE_MS = 70
const DELETE_MS = 38
const HOLD_MS = 1700
const GAP_MS = 350

export function HeroTypewriter({ words, srText }: { words: string[]; srText: string }) {
  const [index, setIndex] = useState(0)
  const [length, setLength] = useState(words[0]?.length ?? 0)
  const [deleting, setDeleting] = useState(false)
  const [motion, setMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setMotion(!mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (!motion || words.length < 2) return
    const word = words[index]
    let delay: number
    let next: () => void

    if (!deleting && length === word.length) {
      delay = HOLD_MS
      next = () => setDeleting(true)
    } else if (deleting && length === 0) {
      delay = GAP_MS
      next = () => {
        setDeleting(false)
        setIndex((i) => (i + 1) % words.length)
      }
    } else {
      delay = deleting ? DELETE_MS : TYPE_MS
      next = () => setLength((l) => l + (deleting ? -1 : 1))
    }

    const id = window.setTimeout(next, delay)
    return () => window.clearTimeout(id)
  }, [motion, words, index, length, deleting])

  return (
    <>
      <span className="sr-only">{srText}</span>
      <span className="typewriter" aria-hidden="true" data-motion={motion || undefined}>
        <span className="typewriter-text">{words[index].slice(0, length)}</span>
        <span className="typewriter-cursor" />
      </span>
    </>
  )
}
