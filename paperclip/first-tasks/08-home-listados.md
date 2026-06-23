# Tarea 08 — Home real + blog index + listados (serie / tag / categoría)

**Asignar a:** Frontend · **Depende de:** 06 (datos), 07 (patrones de post/serializador) · **Tipo:** rutas

> Conecta a datos reales lo que hoy está hardcodeado y crea las pantallas de listado. Reutiliza los
> shells existentes (`PostCard`, `FeaturedCard`, `ListRow`, `SeriesStep`, `Pagination`, `Cat`, `Tag`,
> `EmptyState`); **no re-maquetes**.

## Prompt para el issue
> **1. Re-cablear la home** (`app/(frontend)/page.tsx`): **elimina** los arrays hardcodeados
> `FEATURED_POSTS`/`LATEST_POSTS` y los **estilos inline**; aliméntala desde `lib/data`
> (`getPosts`, `getSeriesWithPosts`/`getSeries` para el bloque de series). Mismo resultado visual.
> **2. Blog index** (`app/(frontend)/blog/page.tsx`): listado paginado de posts (`getPosts` con
> page/limit) usando `PostCard` + `Pagination`.
> **3. Listados derivados:**
> - Serie: `app/(frontend)/series/[slug]/page.tsx` con `getSeriesWithPosts` y los `SeriesStep`
>   (estados done/current/soon) + barra de progreso. Orden **derivado**.
> - Tag: `app/(frontend)/tags/[slug]/page.tsx` con `getPostsByTag`.
> - Categoría: `app/(frontend)/categorias/[slug]/page.tsx` con `getPostsByCategory` (acento por
>   `data-cat`).
> Todas: estado **vacío** (`EmptyState`) cuando no hay resultados, y `notFound()` si el slug no existe.
> Datos solo vía `lib/data` (ADR 0006), cero hardcodeo.

## Done cuando
- La home ya no tiene datos ni estilos inline; sale poblada desde la BD sembrada.
- Blog index pagina; serie/tag/categoría listan correctamente y derivan el orden de serie.
- Estados vacíos y 404 por slug cubiertos. `pnpm lint` pasa.
- agent-note: cómo se derivan las páginas de listado desde `lib/data`. QA: gate visual de cada
  pantalla (desktop + móvil) contra el handoff.
