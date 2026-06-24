# TOD-68 — Cableado de páginas públicas a datos reales

## Qué se hizo

### Bugs corregidos

**`getPosts()` devuelve `PaginatedPosts`, no un array.**

El contrato de `lib/data/posts.ts` exporta `getPosts(limit, page): Promise<PaginatedPosts>`, que es un objeto
con `{ docs, totalPages, ... }` — igual que Payload. Había dos puntos que asumían erróneamente que era un array:

1. `app/(frontend)/page.tsx` (Home): `const [allPosts, ...] = await Promise.all([getPosts(7), ...])`
   luego llamaba `allPosts.slice(0, 3)`. Corregido a `const [{ docs: allPosts }, ...]`.

2. `app/(frontend)/blog/[slug]/page.tsx` (`generateStaticParams`): `const posts = await getPosts(100)`
   seguido de `posts.map(...)`. Corregido a `const { docs: posts } = await getPosts(100)`.

**`PaginatedPosts` type no coincidía con `PaginatedDocs<Post>` de Payload.**

`page`, `prevPage` y `nextPage` son opcionales en Payload pero estaban marcados como requeridos/no-nullable
en el type local. Se actualizaron a opcionales para eliminar el error TS.

### Páginas nuevas

El Header de la app tiene nav links a `/series` y `/categorias`. Ambas rutas carecían de `page.tsx`
(solo existían los `[slug]` subniveles), lo que resultaría en 404 al navegar.

- `app/(frontend)/series/page.tsx` — lista todas las series via `getSeriesList()`, grid-series,
  EmptyState si no hay ninguna, enlaza a `/series/[slug]`.
- `app/(frontend)/categorias/page.tsx` — lista todas las categorías via `getCategories()`,
  stack vertical de cards, EmptyState si vacío, enlaza a `/categorias/[slug]`.

### Páginas existentes (ya correctas)

- `/blog` — usa correctamente `const { docs, totalPages } = await getPosts(POSTS_PER_PAGE, page)` ✓
- `/categorias/[slug]` — usa `getCategoryWithPosts`, `notFound()`, `EmptyState` ✓
- `/series/[slug]` — usa `getSeriesWithPosts`, `notFound()`, `EmptyState`, progress editorial ✓
- `/tags/[slug]` — usa `getTagWithPosts`, `notFound()`, `EmptyState` ✓

## Restricciones respetadas

- Solo se consumen funciones de `lib/data` — cero acceso a Payload directo en las páginas.
- No se rediseñaron shells: `PostCard`, `Cat`, `Badge`, `EmptyState`, `Pagination` se usan tal cual.
- Tokens CSS de sistema, sin hardcodes de color o tipografía.
- El progreso de serie en `/series/[slug]` sigue siendo editorial (últimos posts publicados = `current`,
  anteriores = `done`), no progreso personal del lector.
