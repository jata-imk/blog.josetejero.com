# TOD-87 — Página /buscar (SSR) + búsqueda global

**Fecha:** 2026-06-25  
**Agente:** Frontend (Diseño)

## Qué se hizo

### Archivos creados

- **`app/(frontend)/buscar/page.tsx`** — Página SSR de búsqueda. Lee `?q=` y `?scope=` de searchParams, llama `searchAll`, renderiza: título "Buscar", `SearchPageBar` (lg), tabs de alcance con conteos, y secciones agrupadas (posts como list-rows, series con icono layers + N partes, tags como chips, categorías como cat-pills). Estados: query vacía → EmptyState con sugerencia; sin resultados → EmptyState de "frown".

- **`components/search/SearchPageBar.tsx`** — Client component para la barra de búsqueda en /buscar. Usa `useSearchParams` para mantenerse sincronizado con la URL. En Enter navega a `/buscar?q=...` via `router.push`. Envuelto en `<Suspense>` desde la page (requisito de Next.js para `useSearchParams`).

- **`components/search/BlogSearchForm.tsx`** — Server component puro: form GET nativo `action="/buscar"`. Sin JS. Añadido al header de `/blog`.

- **`docs/adr/0020-busqueda-server-side-payload.md`** — ADR que documenta la decisión de búsqueda server-side sobre Payload/Postgres con operador `like`.

### Archivos modificados

- **`lib/data/posts.ts`** — Corregido bug de ESLint (`finalPage` unused → eliminado), corregido error TypeScript en `where` (`Record<string, unknown>` → `Where[]` de payload), importado tipo `Where` de `payload`.

- **`app/(frontend)/blog/page.tsx`** — Añadido `BlogSearchForm` (la barra de búsqueda que navega a /buscar).

### Archivos ya provistos por Engineer (TOD-85)

El Engineer ya había creado:
- `lib/data/search.ts` — función `searchAll(q, scope)`  
- `app/(frontend)/api/search/route.ts` — API route para CommandPalette
- `components/search/CommandPalette.tsx` — modal ⌘K  
- `components/search/SearchTriggerBtn.tsx` — botón en header  
- `components/layout/Header.tsx` — ya tenía CommandPalette + SearchTriggerBtn integrados

## Por qué

- La página /buscar SSR permite crawlers + accesibilidad sin JS.
- La CommandPalette ya existente cubre el caso de búsqueda rápida (⌘K) con resultados inline y un enlace a /buscar para ver todo.
- El scope de tabs permite filtrar por tipo; la URL es shareable y SSR-friendly.

## Diseño seguido

`blog/design/screenshots/busqueda.png` — título centrado, search input lg, tabs de alcance, secciones agrupadas con eyebrow + count, list-rows para posts, icon-row para series, chips para tags y cat-pills para categorías.
