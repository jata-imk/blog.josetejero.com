# TOD-67 — Contrato `lib/data` para listados públicos y paginación

**Fecha:** 2026-06-24  
**Agente:** Engineer  
**Contexto:** ADR 0014 — Listados públicos y rutas canónicas del frontend

## Qué se hizo

Implementé el contrato de datos para listados públicos definido en ADR 0014. Los cambios principales:

### 1. Paginación en `/blog`

**Antes:**
```ts
getPosts(limit, page): Promise<Post[]>
```

**Ahora:**
```ts
getPosts(limit, page): Promise<PaginatedPosts>

type PaginatedPosts = {
  docs: Post[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}
```

**Por qué:** La página `/blog` necesita metadatos de paginación para renderizar el componente `Pagination` sin volver a consultar Payload. El tipo `PaginatedPosts` es exactamente lo que `payload.find()` retorna, así que no hay transformación adicional.

**Cómo consumirlo:**
```tsx
const { docs: posts, totalPages, page, hasNextPage } = await getPosts(10, 1)
```

### 2. Helpers para separar `notFound()` vs `EmptyState`

Agregué tres helpers que distinguen entre "entidad no existe" (404) y "entidad sin posts" (empty state):

#### `getCategoryWithPosts(slug)`
```ts
const result = await getCategoryWithPosts('javascript')
if (!result) {
  // La categoría no existe → notFound()
  notFound()
}
const { category, posts } = result
if (posts.length === 0) {
  // La categoría existe pero no tiene posts → EmptyState
}
```

#### `getTagWithPosts(slug)`
```ts
const result = await getTagWithPosts('react')
if (!result) {
  notFound()
}
const { tag, posts } = result
// Si posts.length === 0 → EmptyState
```

#### `getSeriesWithPosts(slug)` con estado editorial
```ts
const result = await getSeriesWithPosts('nextjs-blog')
if (!result) {
  notFound()
}
const { series, posts } = result
// posts es SeriesPostWithStatus[]
// Cada post tiene .stepStatus: 'done' | 'current'
```

**Por qué:** El ADR 0014 exige que las páginas de taxonomía separen identidad de contenido:
- Si la entidad base no existe → `notFound()`
- Si existe pero no tiene posts publicados → `EmptyState`

Esta lógica se resuelve en `lib/data`, no en la página.

### 3. Estado editorial de series

El helper `getSeriesWithPosts` ahora retorna `SeriesPostWithStatus[]` en vez de `Post[]`:

```ts
type SeriesPostWithStatus = Post & {
  stepStatus: 'done' | 'current'
}
```

El estado se calcula así (ADR 0014, regla 5):
- Posts anteriores al último publicado → `stepStatus: 'done'`
- Último post publicado → `stepStatus: 'current'`
- **No hay estado `soon`** (solo existiría si el CMS persiste releases planeados)

**Por qué:** La página `/series/[slug]` representa avance editorial publicado, no progreso de usuario. No hay cuentas de usuario ni bookmarks. El componente `SeriesStep` puede consumir directamente `stepStatus` sin derivar lógica adicional.

**Cómo consumirlo:**
```tsx
const { series, posts } = await getSeriesWithPosts('nextjs-blog')
posts.map(post => (
  <SeriesStep
    status={post.stepStatus}
    title={post.title}
    href={`/blog/${post.slug}`}
  />
))
```

### 4. Normalización de rutas: `/categorias/` (plural)

Fijé todas las referencias de categoría en singular (`/categoria/[slug]`) a plural (`/categorias/[slug]`):

- `blog/app/(frontend)/page.tsx` (home, sección de categorías)
- `blog/app/(frontend)/blog/[slug]/page.tsx` (breadcrumb del post)

**Por qué:** El ADR 0014 define que `/categorias/[slug]` es la ruta canónica para quedar alineado con `Header` y `Footer`. Cualquier enlace en singular se considera un bug.

## Restricciones respetadas

- ✅ Payload v3 sigue siendo la única capa de datos
- ✅ No se llama `payload.find` desde páginas/componentes
- ✅ No se introdujeron capas nuevas tipo repository o service genérico
- ✅ No se reabrió el modelo de series ni se inventó progreso de usuario

## Próximos pasos para Frontend

Los helpers están listos para consumirse en las páginas de taxonomía:

1. **Crear `/categorias/[slug]/page.tsx`:**
   ```tsx
   const result = await getCategoryWithPosts(params.slug)
   if (!result) notFound()
   const { category, posts } = result
   ```

2. **Crear `/tags/[slug]/page.tsx`:**
   ```tsx
   const result = await getTagWithPosts(params.slug)
   if (!result) notFound()
   const { tag, posts } = result
   ```

3. **Crear `/series/[slug]/page.tsx`:**
   ```tsx
   const result = await getSeriesWithPosts(params.slug)
   if (!result) notFound()
   const { series, posts } = result
   // posts ya tiene .stepStatus: 'done' | 'current'
   ```

4. **Agregar paginación a `/blog`:**
   ```tsx
   const { docs, totalPages, page, hasNextPage, hasPrevPage } = await getPosts(10, pageNum)
   // Pasar metadatos a <Pagination />
   ```

## Referencias

- **ADR:** `blog/docs/adr/0014-listados-publicos-y-rutas-canonicas.md`
- **Archivos tocados:**
  - `blog/lib/data/posts.ts` (paginación)
  - `blog/lib/data/categories.ts` (helper con posts)
  - `blog/lib/data/tags.ts` (helper con posts)
  - `blog/lib/data/series.ts` (helper con estado editorial)
  - `blog/lib/data/index.ts` (exports)
  - `blog/app/(frontend)/blog/page.tsx` (destructuración de `docs`)
  - `blog/app/(frontend)/page.tsx` (ruta plural categorías)
  - `blog/app/(frontend)/blog/[slug]/page.tsx` (ruta plural categorías en breadcrumb)
