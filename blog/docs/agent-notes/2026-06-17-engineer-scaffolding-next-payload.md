# 2026-06-17 — Engineer — scaffolding base Next + Payload + Postgres

## Qué hice

Implementé el scaffolding ejecutable del proyecto en `blog/` siguiendo la ADR 0004:
Next.js App Router + Payload CMS v3 embebido + PostgreSQL local vía Docker.

## Por qué esta estructura

### Separación (payload) vs (frontend)

Next.js App Router usa **Route Groups** (carpetas entre paréntesis) para organizar
rutas sin afectar la URL. Dos grupos desde el día uno:

- `app/(payload)/` — admin de Payload (`/admin`), API REST (`/api`), GraphQL (`/api/graphql`)
- `app/(frontend)/` — sitio público visitable (`/`)

Esto evita que el layout de Payload (fuentes, estilos del admin) contamine el
frontend, y viceversa. Cada grupo puede tener su propio `layout.tsx`.

### Cómo Payload vive dentro de Next.js

Payload v3 está diseñado para correr **en el mismo proceso** de Next.js. No es un
servidor aparte. La integración funciona así:

1. **`next.config.mjs`** envuelve la config con `withPayload()`. Esto configura
   webpack/turbopack para los paquetes de Payload y asegura compatibilidad ESM.

2. **`payload.config.ts`** define qué base de datos usar, qué editor de rich text
   (Lexical), y qué colecciones existen. Está en la raíz de `blog/` y se referencia
   desde todo el código con el alias `@payload-config`.

3. **Archivos en `app/(payload)/`** — son ficheros generados/estándar que Payload
   necesita para servir el admin y la API. No se editan manualmente:
   - `layout.tsx` — provee el `RootLayout` de Payload con manejo de server functions
   - `admin/[[...segments]]/page.tsx` — sirve el panel de admin como catch-all
   - `admin/importMap.js` — mapea componentes RSC que Payload necesita
   - `api/[...slug]/route.ts` — endpoints de la REST API
   - `api/graphql/route.ts` — endpoint de GraphQL

4. **Flujo en desarrollo (`pnpm dev`):** Next.js arranca, Payload se inicializa
   dentro del mismo proceso, se conecta a Postgres, y sincroniza el esquema.
   `/admin` carga el panel React de Payload. La REST API responde en `/api/*`.

### Postgres con docker-compose

Se usa `postgres:17-alpine` (imagen ligera) con variables de entorno documentadas
en `.env.example`. Payload se conecta vía `DATABASE_URL` usando el adaptador
`@payloadcms/db-postgres` con pool de conexiones.

### Tailwind v4

Tailwind v4 se instaló con `@tailwindcss/postcss` como plugin de PostCSS. El
`app/globals.css` solo tiene `@import 'tailwindcss'`. Los design tokens completos
se cargarán en la tarea 03.

### `output: 'standalone'`

Configurado en `next.config.mjs` para que el build de producción genere una
carpeta autocontenida lista para desplegar en VPS sin necesidad de `node_modules`.

## Decisiones durante la implementación

1. **Versiones exactas en dependencies:** Usé versiones fijas para Payload y Next.js
   (no rangos `^`) porque Payload tiene requisitos estrictos de compatibilidad con
   versiones específicas de Next.js (ver docs de Payload: solo ciertos rangos de
   15.x y 16.2.6+ están soportados).

2. **Sin `src/`:** La ADR especificaba `app/` en la raíz, no `src/app/`. El template
   oficial de Payload usa `src/` pero la decisión del Architect fue explícita, así
   que adapté los paths del tsconfig en consecuencia (`@/*` → `./*`).

3. **Import map generado:** Corrí `payload generate:importmap` después de instalar
   para asegurar que el importMap.js esté sincronizado con las versiones exactas
   instaladas.

4. **Archivo `not-found.tsx`:** El template de GitHub usa `generateNotFoundMetadata`,
   pero la versión 3.85.1 de `@payloadcms/next` exporta `generatePageMetadata` en su
   lugar. Corregí la importación para que compile.

## Verificación

- `pnpm install` → 405 packages instalados sin errores
- `pnpm generate:types` → `payload-types.ts` generado correctamente
- `pnpm generate:importmap` → `importMap.js` generado
- `npx next build` → build de producción exitoso (Turbopack, TypeScript, páginas
  estáticas y dinámicas generadas)
- Docker: Postgres 17 corriendo en `localhost:5432`
- Rutas generadas: `/` (static), `/admin/[[...segments]]` (dynamic), `/api/[...slug]` (dynamic), `/api/graphql` (dynamic)
