# 2026-06-17 — Engineer — corregir render visible del admin de Payload

## Qué hice

Corregí el bug que causaba pantalla blanca en el panel admin de Payload (`/admin`, `/admin/login`, `/admin/create-first-user`) a pesar de que el HTML devuelto por el servidor contenía el contenido esperado.

## Causa raíz

El root layout (`app/layout.tsx`) importaba `./globals.css`, que contiene `@import 'tailwindcss'`. Esto cargaba Tailwind v4 (incluyendo su CSS reset/preflight) en **todas** las rutas del proyecto, incluyendo `(payload)/admin/**`.

Esto provocaba dos problemas:
1. **Conflicto de capas CSS (cascade layers):** Payload usa `@layer payload-default` para sus estilos. Tailwind v4 define sus propias capas (`theme`, `base`, `components`, `utilities`). Al cargarse después, las capas de Tailwind tomaban precedencia y su reset (`* { margin: 0; padding: 0; border: 0 }`) rompía el layout del admin de Payload.
2. **Resets que colapsaban la UI:** El preflight de Tailwind eliminaba márgenes, padding y bordes que Payload espera para sus componentes, resultando en una superficie visualmente blanca aunque el DOM tuviera contenido.

## Por qué la pantalla se veía blanca con HTML correcto

El servidor renderizaba correctamente el shell del admin (títulos, metadatos, scripts). Pero el contenido visible del dashboard es renderizado por el **cliente** (React SPA). La combinación del CSS reset de Tailwind + las capas CSS de Payload causaba que los componentes del admin (sidebar, cards, formularios) colapsaran visualmente — el HTML existía, las dimensiones eran 0 o los colores eran `transparent`/`white` heredados del reset.

## Solución

Separar la carga de CSS entre route groups, siguiendo el patrón del template oficial de Payload:

1. **Root layout (`app/layout.tsx`):** sin `import './globals.css'`. Solo devuelve `{children}`.
2. **Frontend layout (`app/(frontend)/layout.tsx`):** ahora importa `../globals.css` → Tailwind solo se carga en rutas del frontend.
3. **Payload layout (`app/(payload)/layout.tsx`):** ya importaba `@payloadcms/next/css` (CSS propio de Payload), que ahora no compite con Tailwind.

| Ruta | CSS cargado | Resultado |
|------|-------------|-----------|
| `/` (frontend) | Tailwind (vía `globals.css`) | Tailwind disponible |
| `/admin/**` (payload) | Solo `@payloadcms/next/css` | Admin de Payload sin interferencia |

## Por qué el template oficial no tiene este problema

El template `website` de Payload en GitHub (`templates/website/src/app/`) **no tiene** `app/layout.tsx`. Solo tiene:
- `app/(frontend)/layout.tsx` → importa su propio CSS con Tailwind
- `app/(payload)/layout.tsx` → importa `@payloadcms/next/css`

Al no existir un root layout que importe CSS global, Tailwind nunca llega a las rutas del admin. Nuestro proyecto tenía un root layout "de conveniencia" que rompía esta separación. Al replicar el patrón del template, el admin funciona correctamente.

## Verificación

- `pnpm lint` → 0 errores
- `npx tsc --noEmit` → sin errores  
- `npx next build` → build exitoso, todas las rutas generadas
- `curl http://localhost:3460/admin` → HTML con contenido de Payload, CSS solo de `@payloadcms/next`
- `curl http://localhost:3460/` → HTML frontend con CSS de Tailwind
- CSS del admin confirmado: solo `@layer payload-default` (sin reglas de Tailwind)
