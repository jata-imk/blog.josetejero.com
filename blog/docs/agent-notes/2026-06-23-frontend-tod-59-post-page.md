# TOD-59 — Composición página final de post `/blog/[slug]`

**Agente:** Frontend (Diseño)  
**Fecha:** 2026-06-23

## Qué se hizo

Composición completa de la pantalla de post individual contra el handoff de `ab-pages-1.jsx` + `ab-mobile.jsx`.

### Piezas nuevas

**`lib/lexical/toc.ts`** — Extrae `TocItem[]` del árbol Lexical (h2/h3) en servidor sin persistir datos. La misma función `slugifyHeading` se usa aquí y en el converter de headings, garantizando que los IDs del DOM coincidan con los hrefs del TOC.

**`lib/lexical/converters.tsx`** — Heading converter añadido: renderiza `<h2 id="slug">` / `<h3 id="slug">` usando `nodesToJSX` para preservar inline formatting. El slug es idéntico al de `extractToc`.

**`lib/lexical/index.ts`** — Barrel de exportación del pipeline Lexical (makeBodyConverters + extractToc + calloutBlock).

**`components/series/SeriesNav.tsx`** — Bloque visual de serie: badge "Serie", título, lista de `SeriesStep` (done/current/soon), barra de progreso. Derivado del handoff. Recibe la lista ordenada de posts de la serie y el ID del post actual para calcular el estado de cada paso.

**`app/globals.css`** — Clase `.post-body`: grid `1fr 232px` en desktop (≥769px), colapsa a 1 columna en móvil ocultando el aside. Coherente con el layout del handoff (maxWidth 1120, gap 56px, padding 44px 40px).

### Página `blog/[slug]/page.tsx` — cambios

| Antes | Ahora |
|---|---|
| Header + artículo plano + Footer | Cabecera con Breadcrumb, Cat, excerpt, meta row, tags |
| TOC sidebar básico | `.post-body` grid responsive + `TableOfContents` sticky |
| Series nav ad-hoc con `getSeriesNavigationContext` | `SeriesNav` con todos los posts de la serie vía `getPostsInSeries` |
| — | `PrevNext` entre posts de la misma serie |
| — | `AuthorCard` cuando author tiene nombre |
| — | Sección de comentarios: `CommentForm` + lista `Comment[]` |

## Decisiones tomadas

**PrevNext solo en series:** La ruta no tiene función de datos para navegación cronológica general, y el handoff muestra la navegación dentro de la serie. Se usa solo cuando el post pertenece a una serie.

**SeriesNav recibe lista completa via `getPostsInSeries`:** En lugar de `getSeriesNavigationContext` (que solo da prev/next), la página llama directamente a `getPostsInSeries(series.id)` para mostrar todos los steps en `SeriesNav`. Hay redundancia cero: `getSeriesNavigationContext` no se llama.

**`nodesToJSX` en heading converter:** La API de `@payloadcms/richtext-lexical/react` no expone `children` en el converter context; usa `nodesToJSX({ nodes })` para renderizar inline. El wrapper es `any` para evitar fricción con los tipos internos de Payload.

**Tag en toc.ts:** `LexicalChildNode` no declara `tag` en su tipo base; se hace cast local `(node as LexicalChildNode & { tag?: string }).tag` para evitar `any` generalizado.

## Visual gap conocido

El TOC en móvil está oculto (`.post-body-aside { display: none }`). El handoff muestra un botón colapsable con disclosure. Eso requiere un componente nuevo `CollapsibleToc` (client component) — se deja como issue hermano si el board lo prioriza.
