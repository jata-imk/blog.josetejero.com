'use client'

import { useEffect, useState } from 'react'
import { Btn } from '../ui/Btn'
import { GA_ID, CONSENT_STORAGE_KEY } from '../../lib/analytics'

/**
 * Banner de consentimiento de cookies (ADR 0030). Solo tiene sentido
 * si hay analytics que consentir: sin `NEXT_PUBLIC_GA_ID` no se
 * renderiza nada (dev queda limpio).
 *
 * Al montarse, revisa `localStorage`:
 * - 'granted' de una visita anterior → no vuelve a preguntar, pero
 *   SÍ repite `gtag('consent','update', …)`, porque el bootstrap del
 *   <head> (`CONSENT_BOOTSTRAP_SCRIPT`) fija 'denied' en cada carga de
 *   página — el consentimiento no "se recuerda" solo, hay que
 *   reafirmarlo cada vez con el valor guardado.
 * - 'denied' → tampoco pregunta de nuevo (el default ya es denegado).
 * - nada guardado (primera visita) → muestra el banner.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!GA_ID) return

    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (stored === 'granted') {
      window.gtag?.('consent', 'update', { analytics_storage: 'granted' })
    } else if (stored !== 'denied') {
      setVisible(true)
    }
  }, [])

  if (!GA_ID || !visible) return null

  function decide(granted: boolean) {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, granted ? 'granted' : 'denied')
    if (granted) {
      window.gtag?.('consent', 'update', { analytics_storage: 'granted' })
    }
    setVisible(false)
  }

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Consentimiento de cookies">
      <p>
        Este sitio usa cookies de Google Analytics para mejorar la experiencia de lectura. Solo
        se activan si aceptas — puedes revisar los detalles en{' '}
        <a href="/privacidad">la política de privacidad</a>.
      </p>
      <div className="cookie-banner-actions">
        <Btn variant="secondary" onClick={() => decide(false)}>Rechazar</Btn>
        <Btn variant="grad" onClick={() => decide(true)}>Aceptar</Btn>
      </div>
    </div>
  )
}
