'use client'

import Script from 'next/script'
import { GA_ID } from '../../lib/analytics'

/**
 * Carga gtag.js y lo configura para GA4. Se monta en
 * `app/(frontend)/layout.tsx`, después del bootstrap de consentimiento
 * (ADR 0030) — por eso, cuando este script corre, `window.gtag` ya
 * existe y el consentimiento por defecto ya está en 'denied'. GA4
 * respeta ese estado: no escribe `_ga` hasta que el banner
 * (`CookieConsent.tsx`) llame `gtag('consent','update', …)`.
 *
 * `next/script` con `strategy="afterInteractive"` (en vez de cargar en
 * el <head> con el resto del bootstrap) porque gtag.js no es crítico
 * para el primer render; cargarlo después no atrasa nada visible.
 *
 * Sin `NEXT_PUBLIC_GA_ID` (dev, o antes de dar de alta la propiedad en
 * GA4) no se renderiza nada: cero requests a Google.
 */
export function GoogleAnalytics() {
  if (!GA_ID) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-config" strategy="afterInteractive">
        {`window.gtag('js', new Date()); window.gtag('config', '${GA_ID}');`}
      </Script>
    </>
  )
}
