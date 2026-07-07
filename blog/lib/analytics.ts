/* ============================================================
   Analytics — GA4 con Consent Mode v2 (ADR 0030)

   GA4 instala cookies (`_ga`), así que no puede cargar "a secas":
   Google exige (y la ley acompaña) que el usuario decida antes de
   que esas cookies se escriban. Consent Mode v2 es el mecanismo de
   Google para eso — un estado global de consentimiento que gtag.js
   respeta ANTES de que la librería de analytics siquiera cargue.

   El flujo tiene tres piezas, cada una en su archivo:
   1. Este bootstrap (`CONSENT_BOOTSTRAP_SCRIPT`) — fija el consentimiento
      en 'denied' antes de que nada más corra. Se inyecta inline en el
      <head> (mismo idioma que THEME_BOOTSTRAP_SCRIPT).
   2. `components/analytics/GoogleAnalytics.tsx` — carga gtag.js y lo
      configura. Ve el consentimiento ya denegado y no escribe cookies.
   3. `components/analytics/CookieConsent.tsx` — el banner; al aceptar,
      llama `gtag('consent','update', …)` y GA4 empieza a usar cookies.
   ============================================================ */

/**
 * Measurement ID de GA4 (`G-XXXXXXXXXX`). Viene de
 * `NEXT_PUBLIC_GA_ID`; si falta (dev, o mientras no se dé de alta la
 * propiedad), todo el módulo de analytics queda inerte — ni el
 * bootstrap ni el banner se renderizan. Ver runbook
 * `docs/runbooks/analytics-search-console.md` para obtenerlo.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID

/** Clave de localStorage donde se persiste la decisión del visitante. */
export const CONSENT_STORAGE_KEY = 'cookie-consent'

/**
 * Script inline que corre ANTES de que cargue gtag.js. Define
 * `dataLayer`/`gtag()` y fija el consentimiento por defecto en
 * 'denied' para las cuatro señales que Consent Mode v2 entiende.
 *
 * `ad_*` quedan denegadas siempre — el blog no tiene anuncios ni
 * remarketing, así que no hace falta un control de UI para ellas.
 * Solo `analytics_storage` se togglea, desde el banner.
 *
 * `wait_for_update: 500` le da a gtag.js medio segundo para recibir
 * un `consent update` (p. ej. si el visitante ya había aceptado antes
 * y el banner no vuelve a mostrarse) antes de enviar el primer ping
 * ya con el consentimiento inicial correcto.
 */
export const CONSENT_BOOTSTRAP_SCRIPT = `(function(){
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });
})();`

// Tipado global mínimo: `gtag` y `dataLayer` los define el bootstrap
// de arriba en tiempo de ejecución, TypeScript no los conoce por
// defecto. Ambos son opcionales porque en dev (sin GA_ID) no existen.
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}
