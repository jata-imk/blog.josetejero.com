# TOD-86 — /blog: filtros, tags populares, orden, destacado y badge de serie

Agente: Frontend · Fecha: 2026-06-25

## Qué se hizo

Se recompuso `app/(frontend)/blog/page.tsx` con todos los elementos de la épica TOD-84/ADR-0019:

- `searchParams { page, cat, tag, sort }` leídos server-side; URLscompartibles.
- **Tabs de categoría** (`ab-chip` + estado `active`): `getCategories()` + "Todos" como
  catch-all; la tab activa se determina comparando `cat` con el slug de cada categoría.
- **Tags populares** (`tag-pill` como `<a>`): `getPopularTags(10)`; el tag activo recibe
  `background: var(--blue-tint)` inline para resaltar sin clase extra.
- **Buscador** reutiliza `<BlogSearchForm>` (ya existía; GET a `/buscar`).
- **FeaturedCard**: solo visible sin filtros activos; el grid usa `excludeFeatured: true`
  para evitar duplicados.
- **`inSeries={Boolean(p.series)}`** en cada `PostCard` — cierra el badge de Serie.
- **`EmptyState`** con mensaje diferenciado (filtros activos vs. sin posts).
- **Paginación** con `buildHref` que preserva `cat`, `tag` y `sort` en cada página.
- **`SortSelect`**: único Client Component; recibe `cat` y `tag` como props del servidor,
  usa `useRouter` para actualizar `sort` sin perder los otros params.

## CSS añadido a `globals.css`

- `.ab-chip` / `.ab-chip:hover` / `.ab-chip.active` — chips de filtro de categoría.
- `.blog-sort` — `<select>` estilizado como píldora para el dropdown de orden.
- `a.tag-pill:hover` — hover para tags populares como enlaces.

## Nuevo componente

- `components/blog/SortSelect.tsx` (`'use client'`) — select de orden que actualiza URL.

## Por qué no hay más Client Components

Las tabs de categoría y los chips de tags son `<a>` links, no botones interactivos.
El servidor construye el `href` correcto (con `buildHref`) para cada combinación de
filtros, por lo que no necesitan estado cliente. Solo el sort necesita `useRouter`
porque actualiza un param mientras preserva los otros activos.

## ADR asociado

`docs/adr/0019-filtros-y-orden-blog-url-server-side.md`
