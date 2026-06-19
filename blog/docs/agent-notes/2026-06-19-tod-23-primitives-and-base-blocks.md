# TOD-23 — Primitives y bloques base según la nueva distribución

**Fecha:** 2026-06-19  
**Agente:** Frontend Design  
**Issue:** [TOD-23](/TOD/issues/TOD-23)  
**Referencia:** [TOD-18 plan](/TOD/issues/TOD-18#document-plan), ADR `0006-estructura-frontend.md`

---

## Qué se hizo

Creada la estructura `components/` completa, traduciendo el inventario del handoff a la distribución definida en [TOD-18](/TOD/issues/TOD-18). Todos los primitives compartidos, shell (Header/Footer) y bloques de render de contenido implementados.

### Archivos creados

| Carpeta | Componentes |
|---|---|
| `components/ui/` | `Ic`, `Cat`, `Tag`, `Badge`, `Status`, `Thumb`, `Meta`, `Breadcrumb`, `SearchInput`, `EmptyState`, `Pagination`, `Btn`, `Skill` |
| `components/layout/` | `Header`, `Footer` |
| `components/blocks/` | `Callout`, `CodeBlock`, `Prose`, `TableOfContents` |
| `components/post/` | `PostCard`, `FeaturedCard`, `ListRow`, `PrevNext`, `AuthorCard` |
| `components/series/` | `SeriesStep`, `SeriesProgress` |
| `components/comments/` | `Comment`, `CommentForm` |
| `components/search/` | placeholder (`.gitkeep`) |
| `components/about/` | placeholder (`.gitkeep`) |

`page.tsx` refactorizado para importar de la capa de componentes.

### Reglas respetadas

- **Server Component por defecto** en todos los componentes salvo los que tienen interactividad real.
- **`'use client'` solo en:** `SearchInput` (input reactivo), `CommentForm` (formulario con estado), `TableOfContents` (IntersectionObserver activo), `CodeBlock` (botón Copiar).
- **Sin store global** ni abstracciones enterprise.
- **Sin hardcodes**: todos los colores/radios/sombras usan variables CSS de `app/globals.css`.

### CSS portado desde el handoff

Las clases `ab-*` del prototipo (`aleliz.css`) se portaron a `app/globals.css` como capa de componentes. Esto incluye: status badges, featured card, prose, code block, callouts, TOC, breadcrumb, search, form fields, comments, series steps, empty state, pagination, prev/next, author card, skill chips, 404.

## Por qué `ab-*` en producción

El handoff usa `ab-` como namespace de scope en el prototipo HTML. Al implementar en React, se optó por mantener el naming como referencia directa al diseño (facilita el diff handoff↔código) en lugar de renombrar a clases semánticas genéricas. Esta decisión es reversible — si se adopta un sistema de scoping diferente (CSS Modules, Tailwind utilities completas), los componentes ya están aislados en sus archivos.

## Verificación

- `tsc --noEmit`: sin errores.
- Render visual: el dev server lo gestiona el equipo de infra (no se levanta en el heartbeat por política de recursos).

## Pendiente (próximas issues)

- Implementar rutas de página reales: `/blog`, `/blog/[slug]`, `/series`, `/categorias`, `/sobre-mi`, `/search`, `/404`.
- Conectar `lib/data/*` a los componentes cuando el Engineer entregue los data accessors.
- TOD-24 QA puede validar la estructura contra el inventario.
