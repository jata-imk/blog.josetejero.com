# Analytics (GA4) + Search Console — punto 2 del roadmap de mejoras

Fecha: 2026-07-07 · Agente: Claude Code (sesión con el board) · ADR relacionado: 0030

## Qué se hizo

Se integró Google Analytics 4 con gestión de consentimiento (Consent Mode v2) en el sitio
público, y se dejó documentado el alta manual de Google Search Console. El punto 1 del roadmap
(SEO, ADR 0029) ya había dejado vivo `/sitemap.xml`, así que Search Console ya podía darse de
alta — solo faltaba explicar el "cómo" y el "para qué" al board.

### El concepto clave: GSC y analytics miden cosas distintas

El board pidió saber "qué términos son los más buscados" y sus "páginas favoritas". Esto tiene
una única fuente de verdad por cada mitad:

- **Google Search Console** es la ÚNICA fuente de "términos de búsqueda": las *queries* que la
  gente escribe en Google son datos que solo Google tiene — ningún analytics, ni siquiera GA4,
  las ve. GSC también da páginas top *por clics desde Google* y el estado de indexación.
- **GA4** da las visitas totales (incluyendo LinkedIn, RSS, enlaces directos), páginas top por
  visitas reales, países y dispositivos.

Se necesitan ambas piezas para la pregunta completa del board.

### El concepto clave: Consent Mode v2

GA4 usa una cookie (`_ga`) para distinguir visitas — eso lo convierte en un dato personal bajo
GDPR/ePrivacy. Consent Mode v2 es el mecanismo de Google para no escribir esa cookie hasta que
el visitante decida: se fija un estado de consentimiento **denegado por defecto** antes de que
gtag.js cargue; solo tras un `gtag('consent','update', {analytics_storage:'granted'})` (que
dispara el banner al aceptar) GA4 empieza a usar cookies. El orden es crítico: si el script de
consentimiento corriera después de gtag.js, ya sería tarde.

### Piezas nuevas

- **`lib/analytics.ts`** — `GA_ID` (desde `NEXT_PUBLIC_GA_ID`; sin valor, todo el módulo de
  analytics queda inerte, dev limpio) y `CONSENT_BOOTSTRAP_SCRIPT`, el script inline que fija el
  consentimiento por defecto en 'denied' para las cuatro señales de Consent Mode v2 (`ad_storage`,
  `ad_user_data`, `ad_personalization`, `analytics_storage`). Las tres `ad_*` quedan siempre
  denegadas — el blog no tiene anuncios; solo `analytics_storage` se togglea.
- **`components/analytics/GoogleAnalytics.tsx`** — carga `gtag.js` con `next/script`
  (`afterInteractive`) y lo configura. Hecho a mano (no `@next/third-parties`) para controlar el
  orden respecto al bootstrap de consentimiento.
- **`components/analytics/CookieConsent.tsx`** — banner Aceptar/Rechazar con los tokens del
  proyecto (ADR 0028). Persiste la elección en `localStorage` y reafirma el consentimiento
  guardado en cada carga de página (el bootstrap del `<head>` fija 'denied' en cada request; el
  consentimiento no "sobrevive" solo del lado de gtag).
- **`app/(frontend)/privacidad/page.tsx`** — página nueva (`noindex, follow`) que explica qué
  mide GA4, qué hace `_ga` y cómo revertir el consentimiento. El banner y el footer enlazan ahí.
- **`docs/runbooks/analytics-search-console.md`** — guía operativa para el board: cómo dar de
  alta GA4 y obtener el Measurement ID, cómo verificar la propiedad de dominio en GSC por DNS
  TXT, cómo enviar el sitemap, y sobre todo cómo leer los informes (dónde están "los términos
  más buscados" y "las páginas favoritas").

### Dónde se inyectó y por qué

En `app/(frontend)/layout.tsx` — es el layout que renderiza `<html>/<head>/<body>` del sitio
público y NO envuelve el admin de Payload (`(payload)` es otro route group), así que GA4 cubre
solo el sitio público, nunca el CMS. Ya tenía un script inline en el `<head>`
(`THEME_BOOTSTRAP_SCRIPT`, anti-FOUC del tema); el bootstrap de consentimiento se agregó al
lado, mismo idioma (`dangerouslySetInnerHTML`), mismo orden de ejecución (antes de todo).

### Gotcha de despliegue: `NEXT_PUBLIC_*` se incrusta en build-time

Como en el ADR 0029 con `NEXT_PUBLIC_SITE_URL`, cualquier variable `NEXT_PUBLIC_*` se incrusta
al compilar el Docker standalone — no basta con ponerla en el `.env` del VPS si no viaja también
como build-arg. `NEXT_PUBLIC_GA_ID` se agregó a `Dockerfile` (ARG/ENV), `docker-compose.yml`
(`build.args` y `environment`), `.env`/`.env.example`, y los tres bloques de comandos
`docker build` del runbook de deploy que ya declaraban `NEXT_PUBLIC_SITE_URL`.

## Por qué así (decisiones, ver ADR 0030)

- **GA4 sobre Umami/Plausible**: decisión explícita del board — prioriza profundidad de
  informes y la integración nativa con Search Console (mismo ecosistema) sobre la infraestructura
  extra de Umami (backups aún no existen, punto 3 del roadmap) o el costo recurrente de Plausible.
- **Verificación GSC por DNS TXT**: decisión explícita del board — verifica el dominio completo
  de una vez (incluye `www` y subdominios futuros) y no acopla la verificación al ciclo de deploy.
- **Banner + Consent Mode v2 en vez de GA4 "a secas"**: decisión explícita del board — es la
  única de las tres opciones evaluadas que deja la integración legalmente defendible.
- **`next/script` a mano en vez de `@next/third-parties`**: el componente de esa librería no da
  un punto de control claro para garantizar que el consentimiento por defecto se fije antes de
  que gtag.js cargue, que es justo el requisito no negociable de Consent Mode v2.

## Archivos tocados

| Archivo | Cambio |
|---|---|
| `lib/analytics.ts` | Nuevo — GA_ID, bootstrap de consentimiento, tipado global de `gtag`/`dataLayer` |
| `components/analytics/GoogleAnalytics.tsx` | Nuevo — carga y configura gtag.js |
| `components/analytics/CookieConsent.tsx` | Nuevo — banner de consentimiento |
| `app/(frontend)/privacidad/page.tsx` | Nuevo — política de privacidad mínima |
| `app/(frontend)/layout.tsx` | Modificado — bootstrap de consentimiento en `<head>`, monta `GoogleAnalytics`/`CookieConsent` |
| `components/layout/Footer.tsx` | Modificado — enlace "Privacidad" en la columna Sitio |
| `app/globals.css` | Modificado — estilos `.cookie-banner` (tokens existentes, sin hardcodes) |
| `.env`, `.env.example` | Modificado — `NEXT_PUBLIC_GA_ID` |
| `Dockerfile` | Modificado — ARG/ENV `NEXT_PUBLIC_GA_ID` |
| `docker-compose.yml` | Modificado — `build.args` y `environment` del servicio `app` |
| `docs/runbooks/deploy.md` | Modificado — `--build-arg NEXT_PUBLIC_GA_ID` en los tres comandos `docker build` documentados |
| `docs/adr/0030-analytics-ga4-consent-y-search-console.md` | Nuevo |
| `docs/runbooks/analytics-search-console.md` | Nuevo — guía operativa GSC + GA4 para el board |

## Restricciones respetadas

- Cero hardcodes: el banner usa los tokens de `globals.css` (ADR 0028), no valores crudos.
- El layout `(frontend)` sigue sin tocar el admin de Payload.
- No se instaló `@next/third-parties` ni ninguna librería de analytics — solo `next/script`,
  nativo del framework.
- Verificación local: `pnpm lint` y `pnpm build` (que incluye el chequeo de tipos de Next).

## Cómo verificar (board)

Con `NEXT_PUBLIC_GA_ID` vacío (como está hoy en local), el sitio no debe mostrar el banner ni
cargar ningún script de Google — confírmalo en el código fuente de cualquier página. Una vez
tengas un Measurement ID real (ver el runbook nuevo), en el navegador (DevTools → Network/Application):

1. Antes de aceptar el banner: no debe existir la cookie `_ga` ni requests a
   `google-analytics.com/g/collect`.
2. Tras pulsar "Aceptar": aparece `_ga` y sí salen esos requests. GA4 → Informes → Tiempo real
   debe mostrar la visita.
3. Recargar la página: el banner no debe volver a aparecer (la elección persiste).
4. `/admin` no debe cargar nada de analytics (layout distinto).

## Verificación visual (Playwright, con el board)

Con el servidor dev del board ya arriba, se verificó con Playwright (no se levantó/reinició el
servidor desde el agente — infra aparte, ver `docs/runbooks/dev-server.md`):

- `/privacidad`: desktop (1440px), tablet (768px) y móvil (390px), tema claro y oscuro.
- Banner de cookies: mismos tres tamaños, ambos temas, con un `NEXT_PUBLIC_GA_ID` de prueba
  (`G-TEST12345`) puesto temporalmente en `.env` — el board reinició su propio servidor para que
  lo recogiera, y se revirtió a vacío al terminar.

**Bug encontrado y corregido**: en `/privacidad`, el texto "Esa cookie **solo se instala si
aceptas** el banner…" se renderizaba pegado (`aceptasel banner`) porque el espacio quedaba al
inicio de una línea JSX dentro de un texto que ya tenía contenido antes en la misma línea — se
corrigió con un `{' '}` explícito entre el `</strong>` y el texto siguiente (mismo patrón que ya
se usaba antes del `<strong>`).

**Ajuste de copy del banner** (feedback directo del board tras ver la captura): el texto original
("Uso Google Analytics para saber qué publico funciona y qué no…") sonaba a "yo, José, te
rastreo" en primera persona. Se cambió a tono "este sitio usa…" y la razón se generalizó a
"mejorar la experiencia de lectura" en vez de exponer la mecánica interna (medir qué contenido
funciona). Texto final: *"Este sitio usa cookies de Google Analytics para mejorar la experiencia
de lectura. Solo se activan si aceptas — puedes revisar los detalles en la política de
privacidad."*

Los errores de consola vistos durante las capturas (`400` en `/_next/image` para imágenes
placeholder) son preexistentes y no están relacionados con este cambio — se confirmó revisando
los logs de Playwright.

## Pasos manuales del board

Documentados en detalle en `docs/runbooks/analytics-search-console.md`:

1. Crear la propiedad GA4 → copiar el Measurement ID → ponerlo en `NEXT_PUBLIC_GA_ID` de
   producción (build-arg del próximo deploy).
2. Crear la propiedad de **Dominio** en Search Console para `josetejero.com` → añadir el registro
   TXT en el DNS → verificar.
3. Enviar `https://josetejero.com/sitemap.xml` en Search Console.
4. Redesplegar con el `NEXT_PUBLIC_GA_ID` correcto.
