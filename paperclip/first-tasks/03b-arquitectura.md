# Tarea 03b — Estructura del frontend (arquitectura pragmática de Next)

**Asignar a:** Architect · **Depende de:** 01 · **Tipo:** fundación estructural + ADR
**Paralela a:** 03 (tokens). Ambas son fundación; **bloquean 04-06**.

## Objetivo
Definir y dejar documentada la **estructura de carpetas y las reglas de capas** del frontend
**antes** de construir componentes, para que Engineer y Frontend trabajen consistentes. El estilo
es **clean architecture pragmática e idiomática de Next** — NADA de capas enterprise
(repositories / use-cases / store global) que YAGNI desaconseja para un blog de un solo autor.

## Prompt para el issue
> Define la arquitectura del frontend del blog y documéntala. NO construyas componentes ni páginas
> reales; esta tarea deja la estructura, el ejemplo de referencia y el ADR.
>
> **Estructura propuesta (bajo `blog/`):**
> ```
> app/                      # rutas App Router (ya existe: (frontend) y (payload))
> components/
>   ui/                     # primitivos del DS: Btn, Cat, Tag, Chip, Badge, SearchInput, Pagination, EmptyState…
>   layout/                 # Header, Footer
>   blocks/                 # render de bloques Lexical: Callout, CodeBlock, prose
>   post/  series/  comments/   # componentes de feature: PostCard, FeaturedCard, SeriesStep, Comment, CommentForm, AuthorCard, TOC…
> lib/
>   data/                   # acceso a datos (SERVER-ONLY): getPosts, getPostBySlug, getSeriesWithPosts… envuelven payload.find/findByID
>   lexical/                # serializador Lexical → React
>   utils/                  # formatDate, readingTime… (slug.ts ya vive en lib/)
>   access.ts  seed.ts      # ya existen
> hooks/                    # client hooks SOLO donde haya interactividad: useCopyToClipboard, useActiveHeading (TOC), useMobileNav…
> ```
> Ajusta nombres si hay una convención Next más idiomática, pero respeta el espíritu. Cubre los ~28
> componentes de `blog/design/component-inventory.md`: cada uno debe tener carpeta destino clara.
>
> **Reglas de capas (documéntalas en el ADR):**
> - **Server Components por defecto.** `'use client'` solo en hojas interactivas (copiar código,
>   nav móvil, form de comentarios, TOC activo, buscador).
> - **Acceso a datos aislado en `lib/data/*`**: páginas y componentes **no** llaman `payload.find`
>   directo; usan funciones nombradas (single-responsibility, testeables). Es la "capa de servicios"
>   pragmática — sin repositories ni use-cases formales.
> - **Sin store global** (Zustand/Redux) hasta que algo lo exija de verdad. Estado UI con hooks
>   locales o Context puntual. YAGNI.
> - **Presentación separada de datos** (principio del repo): Shiki (resaltado), tema oscuro y botón
>   copiar son RENDER, no se almacenan.
> - **Tokens = única fuente visual** (cero hardcodeo). **Deriva, no dupliques** (la posición en serie
>   se calcula, no se guarda).
>
> Respeta `blog/AGENTS.md`. Mantén la decisión mínima: no inventes capas que nadie pidió.

## Entregables (Done cuando)
- `blog/docs/adr/0006-estructura-frontend.md` (sigue `blog/docs/adr/template.md`): la estructura, las
  reglas de capas y **la decisión YAGNI explícita** (por qué NO services/stores enterprise).
- Sección "Pendiente de detallar" de `blog/docs/architecture/overview.md` actualizada con el árbol de
  carpetas y las reglas.
- Directorios creados con `.gitkeep` + un **ejemplo de referencia mínimo** en `lib/data/` que marque
  el patrón, p. ej. `getPostBySlug(slug: string): Promise<Post | null>` usando la Local API de
  Payload (`getPayload` + `payload.find`). Tipado con los tipos generados (`payload-types.ts`).
- **agent-note** en `blog/docs/agent-notes/` explicando Server vs Client Components y por qué se
  aísla el acceso a datos en `lib/data` (pieza didáctica para el board).
- QA verifica que el ejemplo compila (`pnpm build` / `tsc`) y que la estructura calza con el inventario.
