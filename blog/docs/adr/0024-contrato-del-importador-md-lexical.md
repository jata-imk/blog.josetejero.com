# 0024 — Contrato del importador Astro/MD → Lexical

- Estado: aceptada (con ajuste de mecanismo — ver abajo)
- Fecha: 2026-06-29
- Decidido por: board (José)

## Contexto
Hay que migrar 19 posts del blog Astro viejo (`blog.aleliz.xyz`, `src/content/blog/`) a Posts/Series
con cuerpo Lexical. El formato destino ya existe de facto en `lib/seed.ts → makeBody()`. Falta fijar
el contrato del script: cómo parsea, qué mapea y cómo se comporta al re-ejecutarse. Los campos de
modelo que habilita esta migración están en [`0023`](0023-series-body-depth-e-imagenes-inline.md).

## Opciones consideradas
- **Construir el árbol Lexical a mano** desde el AST (mdast) vs. usar `$convertFromMarkdownString`
  de `@lexical/markdown`. Lo segundo no conoce los bloques custom (`Callout`, `Code`) ni el nodo
  `upload`, y produciría un árbol que habría que post-procesar igual. → construir a mano replicando
  las formas de `makeBody()`.
- **Idempotencia por slug** (buscar antes de crear, como `seedDev`) vs. wipe-and-reimport. Lo
  segundo borraría ediciones hechas en `/admin`. → idempotente por slug.

## Decisión
Script nuevo `blog/scripts/import-astro.ts`, ejecutado vía Payload Local API. Dependencias a añadir:
`gray-matter`, `unified`, `remark-parse`. Construye el árbol a mano y valida contra `Post['body']`.

**Mapeo de frontmatter:** `title→title`, `description→excerpt` (post) / `Series.description` (serie),
`pubDate→publishedAt`, `heroImage→coverImage` (post) / cover de serie. `categories`/`tags` quedan
**vacías** (se asignan luego en `/admin`). `includeInList` se ignora.

**Mapeo de nodos (MD → Lexical):**
| Origen | Destino |
|---|---|
| headings | `heading` con `tag` h1–h6 |
| párrafos / énfasis | `paragraph` + `text` (bitmask `format` para bold/italic) |
| links | `link` (`linkType:'custom'`, `version:3`); links relativos entre posts reescritos al nuevo slug |
| listas | `list` con `tag` ul/ol **obligatorio** + `listitem` con `value` |
| code fences | bloque `Code` (`code` string + `language`) |
| `<aside class="bg-*">` | bloque `Callout` (variant por color; emoji y headings internos preservados) |
| `![](...)` | upload a `Media` (dedupe por filename) + nodo `upload` inline |
| tablas GFM (`\| a \| b \|`) | `table`/`tablerow`/`tablecell` nativos de `EXPERIMENTAL_TableFeature` |

**Color de aside → variant:** `bg-blue-*` (📖/🎯) → `note`; `bg-emerald-*` (✅) → `tip`;
`bg-amber-*` (🧠/⚠️) → `warning`; rojo → `danger`.

**Series:**
- El `index.md` de primer nivel de una carpeta-serie → la **Serie** (title/description/heroImage→cover/
  **body**), no un post.
- Sub-artículos e índices de subsección → **Posts** con `seriesDepth` según anidamiento de carpeta y
  `seriesOrder` según el **orden de enlaces internos** del index (pubDate como respaldo).
- Mapeo confirmado: **Laravel** (index→serie; 2 posts depth 0). **OpenClaw** (sin index; body vacío;
  orden lógico: Intro, VPS, WhatsApp/Telegram, API Keys, API Notion). **Git+Merge+Deploy** (index
  raíz→serie; Branching d0, Flujo Git Flow d1, PR/MR d0, Merge vs PR/MR d1, Git nativo d1).

**Comportamiento:**
- Idempotente: busca por slug antes de crear; re-ejecutable sin duplicar.
- Salta `*.backup`. Reporta links colgantes (ej. `ejemplos-creacion-pr-mr`, que no existe en origen)
  degradándolos a texto u omitiéndolos.
- Reporte final: posts/series creados, imágenes subidas, archivos saltados y por qué.

## Ajuste de mecanismo en implementación (2026-06-29)

El flujo del usuario es **recurrente** (Notion → MD → import), no una migración one-shot.
Por eso el mecanismo cambió: en lugar de un script CLI `import-astro.ts`, el converter se
expone como **botón "Importar Markdown" en el editor de Posts** (`/admin`).

- El converter MD→Lexical vive en `lib/import/mdToLexical.ts` (misma lógica del ADR).
- La subida de imágenes vive en `lib/import/uploadImage.ts`.
- Un endpoint custom `POST /api/posts/:id/import-md` llama al converter y actualiza el `body`.
- Un componente `ui` en el editor (`ImportMarkdownField.tsx`) expone el modal.
- Los 19 posts del blog viejo se migran uno a uno con esta UI.

El mapeo de nodos y el contrato de idempotencia (por slug) siguen vigentes; solo cambia el
punto de entrada (UI vs script). Ver `docs/agent-notes/2026-06-29-engineer-import-md-ui.md`.

## Ajuste — soporte de tablas (2026-07-01)

Al importar un post real (`conectar-api-notion-openclaw.md`) se detectó que las tablas GFM
no se parseaban (`remark-parse` sin `remark-gfm` las trata como texto plano) ni había nodo
Lexical destino. Payload ya trae la pieza faltante: `EXPERIMENTAL_TableFeature` (envuelve
`@lexical/table`), habilitada en `lib/lexical/bodyEditor.ts`. No se construyó un bloque
custom — se usa el nodo nativo `table`/`tablerow`/`tablecell`, editable en `/admin` y
renderizado en el front vía `TableJSXConverter` (parte de `defaultJSXConverters`), con
override de estilos en `lib/lexical/converters.tsx` (clases `.ab-table-*`, tokens en
`app/globals.css`) para no depender del CSS inline por defecto del paquete.

Se añadió `remark-gfm` al parse (`mdToLexicalBody` y `asideToCallout`), lo que también
activa `~~strikethrough~~` (el código en `walkInline` ya lo soportaba pero estaba muerto
sin GFM). La primera fila de toda tabla GFM se mapea a `headerState: COLUMN(2)`.

**Limitación conocida:** el `calloutBlock.content` usa `lexicalEditor()` bare (sin
`EXPERIMENTAL_TableFeature`), así que una tabla dentro de un `<aside>` se dropea (reportada
en `nodesDropped`), igual que ya pasaba con code fences dentro de asides.

## Consecuencias
- Más fácil: contenido real en el blog con fidelidad; re-correr la migración es seguro.
- Más difícil: el parseo de `<aside>` con contenido rico anidado y la reescritura de links inter-post
  son las partes delicadas. Construir el árbol a mano implica mantener las formas alineadas con
  `makeBody()`/`payload-types.ts`.
- Deuda: si el blog viejo gana posts nuevos después de migrar, hay que re-correr (idempotente) o
  crear a mano en `/admin`.
