# 0023 — Descripción de serie, nivel de anidamiento y nodo de imagen inline

- Estado: propuesta
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

## Consecuencias
- Más fácil: las series tienen una portada/directorio rico; la jerarquía de 3 niveles se ve como
  indentación sin complejidad de sub-series; las imágenes inline del contenido viejo migran con
  fidelidad.
- Más difícil: tres columnas nuevas → migración Payload y `pnpm generate:types`. El converter del
  nodo `upload` y la indentación de `SeriesStep` son trabajo de frontend adicional.
- Deuda: el aplanado a un solo `seriesDepth` no representa anidamientos más profundos que 2 niveles;
  si en el futuro hiciera falta, se revisaría hacia sub-series reales.
