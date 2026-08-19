# 0023 — Descripción de serie, nivel de anidamiento y nodo de imagen inline

- Estado: aceptada
- Fecha: 2026-06-29
- Decidido por: board (José)

## Contexto
El importador de Fase 3 (ver [`0002`](0002-lexical-para-el-cuerpo.md) y
`docs/runbooks/importer.md`) trae contenido del blog Astro viejo cuyo modelo no encaja del todo
con el actual:

1. Las carpetas-serie tienen un `index.md` que es a la vez **portada y directorio** de la serie
   (intro + enlaces a sus partes). Hoy `Series` solo tiene `title/slug/description/coverImage`
   (`collections/Series.ts`); no hay dónde poner ese cuerpo rico.
2. Algunas series anidan hasta **3 niveles** (ej. `git-merge-deploy/`). El modelo de serie es
   plano (`series` + `seriesOrder` en `collections/Posts.ts`). Aplanar pierde la jerarquía visual,
   pero modelar sub-series es desproporcionado: el tercer nivel es contenido "plus" opcional.
3. Los posts viejos usan **imágenes inline** (`![](...)`). El editor de `Posts.body` no tiene
   nodo de imagen; solo existe `coverImage`. Sin un nodo de upload inline esas imágenes no tienen
   destino en el árbol Lexical.

`includeInList` del blog viejo (ocultar un post de los listados) **se descarta**: no se reintroduce.

## Opciones consideradas
- **Serie: nuevo campo `body` richText** vs. reutilizar `description` (textarea). El textarea no
  soporta el contenido rico ni los enlaces del directorio. → `body` richText.
- **Anidamiento: sub-series reales** vs. **campo de nivel + aplanado**. Sub-series implica relación
  recursiva, queries y UI nuevas. → un solo nivel lógico de serie + campo `seriesDepth` que solo
  afecta la indentación de render.
- **Imágenes: `UploadFeature` built-in** vs. bloque custom de imagen. El built-in de Payload ya
  resuelve relación a `media`, subida y serialización. → `UploadFeature`.

## Decisión
1. **`Series.body`** — campo `richText` opcional con el mismo `lexicalEditor({ features… })` que
   `Posts.body` (incluye `BlocksFeature` con `calloutBlock` y `CodeBlock`). Vacío por defecto.
2. **`Post.seriesDepth`** — `number`, default `0`, en sidebar. Nivel de indentación dentro de la
   serie (0 = raíz, 1 = sub-artículo). **No** altera `seriesOrder`, que sigue siendo el orden
   lineal global de lectura.
3. **Nodo de imagen inline** — se añade `UploadFeature` (relación a `media`) al arreglo `features`
   del editor de `Posts.body` y un converter del nodo `upload` → imagen (`next/image`) en
   `lib/lexical/converters.tsx`, junto a `heading/callout/Code`.

Render asociado:
- `Series.body` se renderiza en `app/(frontend)/series/[slug]/page.tsx` con `<RichText>` +
  `makeBodyConverters`, bajo `series.description`. Si está vacío, la página queda igual que hoy.
- `seriesDepth` se pasa a `components/series/SeriesStep.tsx` para indentar visualmente. La query de
  `getSeriesWithPosts` (`lib/data/series.ts`) ya propaga el post completo ordenado por `seriesOrder`,
  así que no cambia.

## Ajuste en implementación (2026-06-29)

**Punto #3 (UploadFeature + converter upload) resultó no-op:** `defaultEditorFeatures` de
Payload ya incluye `UploadFeature`, `BlockquoteFeature` y `HorizontalRuleFeature`. Como
`Posts.body` hace `...defaultFeatures`, los nodos `upload`, `blockquote` y `horizontalrule`
ya validan y ya renderizan vía `defaultConverters`. No se añadió UploadFeature ni converter
custom. Ver `docs/agent-notes/2026-06-29-engineer-import-md-ui.md` §1.

**`Series.body` coexiste con `description`** (la decisión de "reemplazar" se revirtió).
`description` (textarea) sigue siendo el blurb corto para las cards; `body` (richText) es la
portada rich en el detalle de la serie.

## Ajuste — imágenes portrait recortadas en el cuerpo (2026-08-04)

El "no se añadió converter custom" de arriba asumía implícitamente que cualquier imagen inline
tendría un aspect ratio compatible con los tamaños de `collections/Media.ts` — que son **los tres
16:9 de portada** (`thumbnail`, `card`, `hero`; ver ADR 0029). Un caso real lo rompió: una imagen
*portrait* (1122×1402) subida al cuerpo de un post se veía recortada al aspect de `hero` en
cualquier viewport de escritorio (961–1920px), aunque nunca se pidió que fuera 16:9.

Causa: el `UploadJSXConverter` default arma un `<picture>` con un `<source media="(max-width:
Npx)">` por cada tamaño generado — la condición usa el **ancho del tamaño**, no su aspect ratio.
El navegador toma la primera fuente cuyo viewport encaje, sin saber que esa fuente está recortada.
Para un original más angosto que `hero` (1920) pero más alto que `hero` (1080), Payload igual
genera el crop (solo omite un tamaño si el original es más chico **en los dos ejes**).

**Se revierte el no-op:** se añade un cuarto tamaño solo-ancho **sin crop** en
`collections/Media.ts` (`{ name: 'content', width: 1000 }`, sin `height` → sharp reescala
preservando aspect ratio, sin `fit: cover`) y un converter custom para el nodo `upload` en
`lib/lexical/converters.tsx`, que ignora el `<picture>` responsive y sirve siempre `sizes.content`
(o el original si no se generó) en un único `<img>`.

**Trade-off aceptado:** se pierde el `<picture>` responsive (servir un archivo más chico en
móvil) para las imágenes de cuerpo. Correcto para este blog: son diagramas técnicos, no fotos
pesadas, y nunca recortar pesa más que ahorrar unos KB en móvil.

Los SVG (Payload no les genera `sizes`) y los uploads no-imagen (siguen como link) no cambian de
comportamiento. El pipeline de `coverImage`/`hero` (portada, `Thumb` + `next/image` + `object-fit:
cover`) tampoco cambia — ese recorte 16:9 es intencional (ADR 0029).

## Consecuencias
- Más fácil: las series tienen una portada/directorio rico; la jerarquía de 3 niveles se ve como
  indentación sin complejidad de sub-series; las imágenes inline del contenido viejo migran con
  fidelidad.
- Más difícil: tres columnas nuevas → migración Payload y `pnpm generate:types`. El converter del
  nodo `upload` y la indentación de `SeriesStep` son trabajo de frontend adicional.
- Deuda: el aplanado a un solo `seriesDepth` no representa anidamientos más profundos que 2 niveles;
  si en el futuro hiciera falta, se revisaría hacia sub-series reales.
