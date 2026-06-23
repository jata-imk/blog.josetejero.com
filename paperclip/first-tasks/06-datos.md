# Tarea 06 — Fundación de datos: seed de contenido dev + expandir `lib/data`

**Asignar a:** Engineer · **Depende de:** 02 (colecciones), 03b (ADR 0006 + `lib/data`) · **Tipo:** datos
**Paralela a:** 04 y 05 (no depende de los bloques).

> Contexto: las pantallas necesitan **contenido real** para construirse y para que QA las revise.
> Hoy `lib/seed.ts` solo siembra usuarios y `lib/data/` solo tiene `getPostBySlug`/`getPosts`. Esta
> tarea deja la BD con datos de ejemplo y la capa de acceso completa, **antes** de las tareas de
> pantalla (07/08/09). No construye UI.

## Prompt para el issue
> **1. Seed de contenido dev** (mismo patrón que `seedUsers`: idempotente, gated a no-producción vía
> el `onInit` existente en `payload.config.ts`):
> - Las **7 categorías** de `[data-cat]` (frontend, backend, bases-de-datos, ia, devops, tutoriales,
>   opinion), unos cuantos tags, **1–2 series** y **~6–8 posts** de ejemplo `published`.
> - El cuerpo de al menos 2 posts debe ser **Lexical real** con headings, listas, links, un bloque de
>   **código** y un **`Callout`** — para ejercitar las tareas 04 y 05 y el serializador (07).
> - Al menos 2 posts deben pertenecer a una serie con su `seriesOrder`, para probar la navegación
>   derivada. No siembres la posición; solo el orden.
> - Idempotente: si ya existe (por `slug`), no dupliques.
>
> **2. Expandir `lib/data/`** siguiendo ADR 0006 (server-only, funciones nombradas, sin `payload.find`
> suelto en páginas): `getSeriesWithPosts(slug)`, `getPostsByTag(slug)`, `getPostsByCategory(slug)`,
> `getSeries()`, `getCategories()`, `getTags()`. Tipos desde `@/payload-types`. La posición de un post
> en su serie se **deriva** del join ordenado por `seriesOrder`, nunca se almacena ni se duplica.
> (`searchPosts` se difiere al buscador de Fase 3.)

## Done cuando
- `pnpm dev` en limpio siembra el contenido; el admin muestra categorías, series y ~6–8 posts.
- `lib/data/` exporta las funciones nuevas con tipos correctos; `index.ts` las reexporta.
- Ningún `payload.find` directo fuera de `lib/data/` (ADR 0006). `pnpm lint` pasa.
- agent-note (Engineer): por qué el seed va gated a dev, y cómo se **derivan** las consultas de serie
  (pieza didáctica para José).
