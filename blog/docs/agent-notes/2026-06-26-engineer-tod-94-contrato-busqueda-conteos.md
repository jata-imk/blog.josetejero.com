# 2026-06-26 — Engineer: Corregir contrato backend de búsqueda y conteos (TOD-94)

## Qué se hizo

Se implementó el contrato definido en [ADR 0021](/TOD/docs/adr/0021-contrato-de-busqueda-global-y-conteos-ssr.md) para la búsqueda global, corrigiendo tres problemas:

1. **Conteos incorrectos en tabs**: los tabs de scope en `/buscar` usaban la longitud de los arrays limitados devueltos por `searchAll()` (ej. `posts.length` con `limit: 8`).
2. **Scope no canónico**: la UI usaba `scope=categorias` en la URL mientras `lib/data/search.ts` esperaba `categories`.
3. **Contrato implícito**: `searchAll` devolvía 4 arrays planos sin separar resultados visibles de conteos agregados.

## Cambios realizados

### `lib/data/search.ts` — Contrato explícito `{ groups, counts }`

- Nuevo tipo `SearchResults` con dos planos separados:
  - `groups`: resultados visibles (limitados por collection como antes: posts×8, series×4, categories×4, tags×6)
  - `counts`: totales por colección desde `totalDocs` de Payload (sin límite, refleja el total real)

- **Siempre se consultan las 4 colecciones** en paralelo (`Promise.all`), incluso cuando el scope activo es solo una. Esto da `totalDocs` preciso para cada colección sin queries extras. Los `groups` se filtran por scope.

- Nuevo helper `normalizeScope(raw)`: acepta `categorias` → `categories` (backward compat), valida contra el enum canónico `'all' | 'posts' | 'series' | 'tags' | 'categories'`. Si algo no encaja → `'all'`.

### `app/(frontend)/api/search/route.ts`

- Usa `normalizeScope` para validar el parámetro.
- Devuelve el nuevo shape `{ groups, counts }` (en lugar del antiguo `{ posts, series, ... }`).

### `app/(frontend)/buscar/page.tsx`

- Usa `normalizeScope` desde `lib/data` en vez de `resolveScope` inline.
- Consume `results.groups` para display y `results.counts` para tabs.
- Los tabs generan URLs con scope canónico (`categories`, no `categorias`). Para backward compat, `normalizeScope` acepta `categorias` en la URL y lo normaliza.
- El conteo `totalAll` ahora deriva de `counts`, no de longitudes de arrays.

### `components/search/CommandPalette.tsx`

- Adaptado al nuevo shape de respuesta de `/api/search`: usa `data.groups.posts` etc.

### `lib/data/index.ts`

- Re-exporta `normalizeScope`, `SearchResultGroup`, `SearchCounts`.

## Por qué

El contrato antiguo mezclaba datos y presentación: los mismos arrays limitados servían para pintar resultados Y para calcular conteos. Si una colección tiene 20 posts que matchean `q` pero el límite visible es 8, el tab mostraba "Posts 8" en vez de "Posts 20".

ADR 0021 exigía separar `groups` (visibles, limitados) de `counts` (totales reales, desde el backend). Con el nuevo contrato, Payload nos da `totalDocs` gratis en cada `find()`, así que simplemente exponemos ese dato.

El scope `categorias` en la URL era un leak de la capa de presentación (label en español) hacia el contrato de datos. El ADR fija los valores de URL: `all | posts | series | tags | categories`.

## Verificación

- `pnpm lint` → sin errores
- `npx tsc --noEmit` → sin errores
- Las 4 colecciones se consultan siempre en paralelo (misma latencia que antes, ~4 queries concurrentes)

## Pendiente para Frontend (TOD-95 o similar)

Per [ADR 0021](/TOD/docs/adr/0021-contrato-de-busqueda-global-y-conteos-ssr.md) y el plan de [TOD-93](/TOD/issues/TOD-93):

- `SearchPageBar` debe preservar el `scope` al reenviar con Enter (hoy solo preserva `q`).
- Revisar fidelidad visual contra `design/screenshots/busqueda.png` en desktop y móvil.
- QA gate funcional sobre tabs, estados vacíos, scope por URL y resultados agrupados.
