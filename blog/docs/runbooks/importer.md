# Runbook: importador Astro/MD → Lexical

> Diseño cerrado (ADR [0023](../adr/0023-series-body-depth-e-imagenes-inline.md) y
> [0024](../adr/0024-contrato-del-importador-md-lexical.md)). Pendiente de implementación por el
> Engineer. Pieza más peluda del proyecto.

## Origen
Blog anterior en `C:\Users\jose.tejero\Documents\Proyectos\blog.aleliz.xyz`, Astro + Markdown
(**19 posts**):
- Posts sueltos en `src/content/blog/*.md`.
- Series como carpetas con `index.md` + sub-artículos (anidamiento de hasta 3 niveles).
- Imágenes en `public/` (jpg y svg), referenciadas desde el MD.
- Avisos como HTML `<aside class="bg-*">` con emoji (no sintaxis `:::`).

## Destino
Posts/Series en Payload con cuerpo **Lexical**; imágenes subidas a la colección `Media`. El formato
del árbol se replica de `lib/seed.ts → makeBody()` y se valida contra `Post['body']` de
`payload-types.ts`. Campos de modelo nuevos: `Series.body`, `Post.seriesDepth` (ADR 0023).

## Mapeo
| Origen (MD) | Destino (Payload/Lexical) |
|---|---|
| frontmatter `title`/`description`/`pubDate`/`heroImage` | `title` / `excerpt` (o `Series.description`) / `publishedAt` / `coverImage` (o cover de serie) |
| `index.md` de carpeta-serie | la **Serie** (incl. `body` rico = portada/directorio), no un post |
| sub-artículos e índices de subsección | **Posts** con `seriesOrder` (orden de links del index; pubDate de respaldo) y `seriesDepth` (anidamiento) |
| headings / párrafos / listas / links | nodos built-in (`link`: reescribir links inter-post al nuevo slug) |
| code fences ```` ``` ```` | bloque `Code` (`code` + `language`) |
| `![](...)` | upload a `Media` (dedupe por filename) + nodo `upload` inline |
| `<aside class="bg-*">` | bloque `Callout` (color→variant; emoji/headings internos preservados) |
| `categories`/`tags` | vacíos (asignar luego en `/admin`) |
| `includeInList` | ignorado |

**Color de aside → variant:** `bg-blue-*` → `note`; `bg-emerald-*` → `tip`; `bg-amber-*` →
`warning`; rojo → `danger`.

**Series confirmadas:**
- **Laravel**: `index.md`→serie; posts 1) Instalar herramientas base 2) Tutorial Jetstream+Inertia+Vue
  (ambos depth 0).
- **OpenClaw** (sin index; body vacío): 1) Introducción 2) VPS 3) WhatsApp/Telegram 4) API Keys
  5) API Notion (depth 0).
- **Git+Merge+Deploy**: `index.md` raíz→serie; 1) 🔀 Branching estratégico (d0) 2) Flujo Git Flow (d1)
  3) ⤴️ PR/MR (d0) 4) Merge directo vs PR/MR (d1) 5) Git nativo o invención (d1).

## Procedimiento
1. Script `blog/scripts/import-astro.ts` vía Payload Local API; **idempotente** (buscar por slug
   antes de crear, patrón de `seedDev`). Dependencias: `gray-matter`, `unified`, `remark-parse`.
2. Recorrer carpeta de origen; saltar `*.backup`. Separar carpetas-serie de posts sueltos.
3. Por archivo: `gray-matter` (frontmatter) → MD a mdast (`remark-parse`) → walk → construir árbol
   Lexical a mano según el mapeo.
4. Subir imágenes (`heroImage` + inline) a `Media` con dedupe por filename; reescribir referencias a
   nodos `upload` / `coverImage`.
5. Crear Series (con `body`) y asignar `seriesOrder` + `seriesDepth` a cada post.
6. Reescribir links relativos inter-post al nuevo slug; reportar links colgantes (ej.
   `ejemplos-creacion-pr-mr`, inexistente) degradándolos a texto u omitiéndolos.
7. Reporte final: qué se importó, qué se saltó y por qué.

## Verificación (QA)
- `pnpm generate:types` tras añadir los campos; el árbol valida contra `Post['body']`/`Series`.
- Correr dos veces → la segunda no duplica (idempotencia).
- Comparar a ojo 3 muestras contra el blog viejo: (a) post simple (`primer-post`), (b) post con
  código + `<aside>` (PR/MR), (c) serie anidada (git): orden, indentación, callouts, imágenes inline
  y portada.
- Render de `Series.body` en `/series/[slug]` e imágenes inline en `/blog/[slug]`.
