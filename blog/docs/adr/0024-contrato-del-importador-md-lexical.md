# 0024 — Contrato del importador Astro/MD → Lexical

- Estado: propuesta
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

## Consecuencias
- Más fácil: contenido real en el blog con fidelidad; re-correr la migración es seguro.
- Más difícil: el parseo de `<aside>` con contenido rico anidado y la reescritura de links inter-post
  son las partes delicadas. Construir el árbol a mano implica mantener las formas alineadas con
  `makeBody()`/`payload-types.ts`.
- Deuda: si el blog viejo gana posts nuevos después de migrar, hay que re-correr (idempotente) o
  crear a mano en `/admin`.
