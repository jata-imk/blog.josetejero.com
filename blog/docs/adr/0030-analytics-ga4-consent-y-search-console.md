# 0030 — Analytics (GA4 + Consent Mode v2) y Google Search Console

- Estado: aceptada
- Fecha: 2026-07-07
- Decidido por: board (José) + Claude Code, sobre el roadmap de mejoras (punto 2)

## Contexto

El blog está en producción pero es ciego a sus propias métricas: no hay forma de saber cuánta
gente lo lee, qué páginas prefieren, ni por qué búsquedas de Google llega la gente. El punto 1
del roadmap (SEO + sitemap + robots, ADR 0029) ya está desplegado, así que
`https://josetejero.com/sitemap.xml` está vivo y la dependencia que bloqueaba Search Console
ya está resuelta.

Hay un matiz que gobierna todo el diseño: **Google Search Console (GSC) y un analytics son
herramientas distintas que responden preguntas distintas.** GSC es la única fuente posible de
"qué términos de búsqueda te traen tráfico" — esa data (las *queries* que la gente escribe en
Google) es propiedad exclusiva de Google; ningún analytics la ve. GSC también da páginas top
*por clics desde Google* y el estado de indexación. Un analytics da las visitas totales
(incluyendo LinkedIn, RSS, enlaces directos), páginas top por visitas reales, países y
dispositivos. El objetivo del board pide ambos datos, así que se necesitan las dos piezas.

Restricciones del proyecto: `NEXT_PUBLIC_*` se incrusta en build-time en el Docker standalone
(ADR 0021/0029) — cualquier ID público debe threadearse por `Dockerfile`/`docker-compose.yml`/
runbook o no aparecerá en el bundle servido. No existe CSP ni middleware hoy, así que cargar
scripts de Google no está bloqueado por nada. No existía gestión de cookies previa.

## Opciones consideradas

- **Analytics: Umami self-hosted vs Plausible Cloud vs Google Analytics 4.**
  - Umami — pros: gratis, un contenedor Docker más (encaja con el Compose + CloudPanel del
    proyecto), script ~2 KB, sin cookies (sin banner); contras: un servicio más que mantener y
    respaldar (los backups del punto 3 del roadmap aún no existen), dashboard menos potente.
  - Plausible Cloud — pros: cero mantenimiento, igual de ligero y sin cookies; contras: ~9
    USD/mes recurrentes para un blog personal.
  - Google Analytics 4 — pros: gratis, el más potente en informes, se integra de forma natural
    con Search Console (mismo ecosistema Google); contras: instala cookies (`_ga`), lo que en la
    práctica exige gestión de consentimiento; los datos de visitantes quedan en Google.
  - **Se eligió GA4**, decisión explícita del board pese a sus contras — prioriza profundidad de
    informes y la integración con GSC sobre la superficie operativa extra de Umami o el costo
    recurrente de Plausible. La contrapartida (cookies) se resuelve con Consent Mode v2 (ver
    Decisión), no descartando GA4.
- **Verificación de propiedad en GSC: DNS TXT (dominio) vs meta tag (prefijo de URL).**
  - DNS TXT — pros: verifica el dominio completo (`josetejero.com` + `www` + cualquier
    subdominio futuro) en un solo paso, no requiere cambios de código ni redeploy, sobrevive a
    cualquier cambio del sitio; contras: requiere acceso al panel de DNS del registrador/CloudPanel.
  - Meta tag — pros: cableado en el propio repo (`metadata.verification.google`), no toca DNS;
    contras: solo verifica ese prefijo de URL exacto, no subdominios, y exige un redeploy para
    activarse.
  - **Se eligió DNS TXT** — decisión explícita del board: es la vía más completa y no acopla la
    verificación al ciclo de deploy de la app.
- **Consentimiento de cookies: banner + Consent Mode v2 vs GA4 sin banner vs no usar cookies.**
  - Banner + Consent Mode v2 — pros: GA4 arranca en modo denegado y solo mide tras aceptación
    explícita, cumple GDPR/ePrivacy, es defendible ante lectores de la UE; contras: un componente
    nuevo (banner + persistencia de la elección) que no existía en el proyecto.
  - GA4 sin banner — pros: cero trabajo extra; contras: coloca cookies sin consentimiento previo,
    no cumple GDPR si hay lectores de la UE (riesgo bajo pero real para un blog con lectores
    internacionales).
  - Sin cookies (cambiar a Umami/Plausible) — evita el dilema entero, pero contradice la decisión
    ya tomada de usar GA4.
  - **Se eligió banner + Consent Mode v2** — decisión explícita del board: es la única opción que
    deja la integración "correcta" en vez de solo "funcionando".
- **Dónde inyectar los scripts: `app/(frontend)/layout.tsx` vs `app/layout.tsx` (root).** El root
  layout es un passthrough vacío que no renderiza `<html>/<head>`; el layout de `(frontend)` sí,
  y es el único que NO envuelve el admin de Payload (`(payload)`). **Se eligió `(frontend)/layout.tsx`**
  para que analytics cubra solo el sitio público, nunca el CMS.
- **Cómo cargar gtag.js: `@next/third-parties` vs `next/script` a mano.** El componente
  `<GoogleAnalytics>` de `@next/third-parties` simplifica el cableado, pero no expone un punto
  de control claro para fijar el `consent default` ANTES de que el script cargue (el orden es
  crítico para Consent Mode v2). **Se eligió `next/script` a mano** (`strategy="afterInteractive"`)
  para tener control explícito del orden: bootstrap de consentimiento en el `<head>` (inline,
  antes que nada) → gtag.js (después, vía `next/script`) → banner (interactivo, al final).

## Decisión

Se integra **GA4 con Consent Mode v2** en `app/(frontend)/layout.tsx`:

1. `lib/analytics.ts` — `GA_ID` (desde `NEXT_PUBLIC_GA_ID`; sin valor, todo el módulo queda
   inerte) y `CONSENT_BOOTSTRAP_SCRIPT`, un script inline que define `dataLayer`/`gtag()` y fija
   `gtag('consent','default', {...: 'denied', wait_for_update: 500})` para las cuatro señales de
   Consent Mode v2. Las señales `ad_*` quedan **siempre denegadas** (el blog no tiene anuncios);
   solo `analytics_storage` se togglea desde el banner.
2. Ese bootstrap se inyecta en el `<head>` del layout, junto al `THEME_BOOTSTRAP_SCRIPT` existente
   (mismo idioma: script inline vía `dangerouslySetInnerHTML`, corre antes que cualquier otra cosa).
3. `components/analytics/GoogleAnalytics.tsx` — carga `gtag.js` con `next/script`
   (`strategy="afterInteractive"`) y ejecuta `gtag('js', ...); gtag('config', GA_ID)`. Al montarse
   después del bootstrap, ve el consentimiento ya denegado y no escribe `_ga` hasta que se apruebe.
4. `components/analytics/CookieConsent.tsx` — banner minimalista (Aceptar/Rechazar) con los
   tokens del proyecto (ADR 0028). Persiste la decisión en `localStorage`
   (`cookie-consent: 'granted' | 'denied'`). Al aceptar, llama
   `gtag('consent','update', {analytics_storage:'granted'})`. En cada carga de página reafirma la
   decisión guardada (el bootstrap fija 'denied' en cada request; el consentimiento no persiste
   solo del lado de gtag, hay que reenviarlo).
5. Página nueva `/privacidad` (`noindex, follow`) — explica qué mide GA4, qué hace la cookie
   `_ga` y cómo revertir el consentimiento; el banner y el footer enlazan ahí.
6. `NEXT_PUBLIC_GA_ID` se threadea por `Dockerfile` (ARG/ENV), `docker-compose.yml` (build.args +
   environment) y el runbook de deploy, igual que `NEXT_PUBLIC_SITE_URL` en ADR 0029.

**Search Console** no requiere código: se documenta como procedimiento manual del board en
`docs/runbooks/analytics-search-console.md` — alta de propiedad de dominio, registro TXT en DNS,
envío de `/sitemap.xml`, y cómo leer los informes (Rendimiento → Consultas = términos de
búsqueda; páginas con más clics = páginas favoritas desde Google).

## Consecuencias

- El board obtiene ambas piezas que pidió: términos de búsqueda (GSC, exclusivo de Google) y
  visitas totales/páginas favoritas (GA4).
- GA4 no escribe ninguna cookie hasta consentimiento explícito — la integración es defendible
  ante GDPR/ePrivacy, no solo funcional.
- Deuda asumida: un componente de banner nuevo que mantener; los datos de visitantes viven en
  Google (Google Ireland Limited procesa el consentimiento vía Consent Mode); sin backups (punto
  3 del roadmap, aún pendiente) no hay forma de auditar históricos de consentimiento si algo
  falla del lado del navegador — riesgo aceptado, es solo analítica, no dato transaccional.
- `NEXT_PUBLIC_GA_ID` pasa a la misma categoría "crítica en build-time" que
  `NEXT_PUBLIC_SITE_URL` (ADR 0029): si falta en el build de producción, no hay analytics hasta
  el siguiente rebuild — no rompe el sitio, pero sí deja un hueco de medición.
- No se instaló `@next/third-parties`: menos una dependencia, pero el cableado de gtag.js es
  manual y cualquier cambio futuro de Consent Mode debe tocarse a mano en `lib/analytics.ts` y
  los dos componentes de `components/analytics/`.
- Google Search Console queda fuera del código: es indefinidamente el board quien mantiene esa
  propiedad (no hay automatización posible del lado del repo para verificación DNS).
