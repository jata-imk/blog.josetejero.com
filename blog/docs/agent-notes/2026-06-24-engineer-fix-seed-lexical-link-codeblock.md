# 2026-06-24 — Engineer — Fix definitivo del seed Lexical (`Cuerpo`, `Cuerpo > Contenido`)

Seguimiento de TOD-65, que no resolvió el `ValidationError`. TOD-65 corrigió campos escalares
(`format`, `mode`, `detail`…) pero el error persistía porque el problema era **estructural**, no de
campos sueltos.

## Causa raíz (tres piezas)

1. **El error se veía una vez y sin detalle.** `payload.config.ts` envolvía `seedDev` en try/catch
   y logueaba `String(err)`, que aplasta el `ValidationError` de Payload (cuyo `err.data.errors`
   trae ruta + mensaje por campo) en una sola línea. El seed solo corre en `onInit` (arranque del
   server), por eso aparecía una vez por reinicio. Como el post #1 es `rich` y va primero, lanzaba
   antes de crear ningún post → tabla `posts` vacía.

2. **Bloque `code` no registrado (`Cuerpo` inválido, afectaba a TODOS los posts).**
   `defaultEditorFeatures` de `@payloadcms/richtext-lexical` incluye `InlineCodeFeature` (formato
   inline) pero **ningún bloque de código**. El editor de `body` solo registraba `calloutBlock`. El
   seed emitía `type:'code'` con hijos `line`/`token` → tipo de nodo desconocido → falla.

3. **Nodos `link` con shape vanilla, no Payload (`Cuerpo` y `Cuerpo > Contenido` inválidos).**
   Payload espera `SerializedLinkNode` con `fields: { linkType, newTab, url }` y `version: 3`
   (verificado en `features/link/nodes/LinkNode.js` y `.../types.d.ts`). El seed ponía
   `url`/`rel`/`target`/`title` directos en el nodo. Había un link en el body y otro dentro del
   Callout → fallaban ambos campos.

## Cambios

- **`collections/Posts.ts`** — registrado el `CodeBlock` premade de Payload en el `BlocksFeature`
  del body: `BlocksFeature({ blocks: [calloutBlock, CodeBlock()] })`. El premade usa slug `'Code'`
  y guarda el código como string en `fields.code` (+ `language` select). `@experimental` en Payload,
  riesgo aceptado para un seed dev.
- **`lib/seed.ts`** — `makeBody`:
  - Links reescritos al shape Payload (`version: 3`, `fields: { linkType:'custom', url, newTab:true }`).
  - Nodo de código `line`/`token` sustituido por el bloque premade
    (`type:'block'`, `fields:{ blockType:'Code', language:'typescript', code:'<string>' }`).
  - `seedPosts` ahora envuelve cada `create` en try/catch que loguea `err.data` (detalle por campo)
    sin abortar el resto del seed.
- **`lib/lexical/converters.tsx`** — el handler de bloque `Code` lee `fields.code` (premade) con
  fallback a `fields.content` (legacy TOD-64).
- **`lib/code-highlight.ts`** — `collectCodeNodes` lee `fields.code ?? fields.content`.
- **`payload.config.ts`** — el catch de `onInit` loguea también `err.data`.
- **`payload-types.ts`** (regenerado) y **`app/(payload)/admin/importMap.js`** (regenerado para los
  componentes del editor del bloque `Code`).

## El "formato legacy" era ficción — colapsado a un solo formato

Tras registrar el premade investigamos de dónde salía el supuesto "legacy Code" y resultó no ser
historia real de producción:

- El `git log` de `collections/Posts.ts` prueba que **el editor nunca registró un bloque de código**
  antes de este cambio (último commit previo: TOD-36, callout). Por tanto **nunca pudo autorearse**
  un nodo `type:'code'` (line/token) por el admin.
- Toda la "saga del codeblock" (TOD-31/32/33/47/50/53) construyó el pipeline de render contra datos
  que ningún editor producía. Los posts de prueba (`qa-codeblock-copy-2026-06-22`) se insertaron por
  script directo a BD — lo delata `language:"inventedlang"`, valor que el select del `CodeBlock`
  jamás aceptaría.
- TOD-64 añadió "backward compat" para `blockType:'Code'` leyendo `fields.content`, pero el fixture
  real usa `fields.code`. Es decir, el converter legacy leía el campo equivocado y nunca renderizó.

Conclusión: no había dos formatos reales conviviendo, solo un formato canónico (premade `CodeBlock`
→ `blockType:'Code'`, `fields.code`) más shapes fantasma en código y un par de fixtures de QA. Por
decisión de José (proyecto de una semana, sin deuda legacy prematura) se **eliminó** todo el camino
fantasma:

- `converters.tsx`: borrado el converter top-level `code` (line/token); `blocks.Code` lee solo
  `fields.code`; `LegacyCodeFields` → `CodeBlockFields` sin `content`.
- `code-highlight.ts`: borrada la rama `type:'code'` y la función `extractCodeText`; `collectCodeNodes`
  reconoce solo el bloque premade. Se conserva la recursión por `fields.content` **objeto**, que sí es
  real (contenido anidado del Callout, no código).
- Los posts de QA con datos inválidos los borra José manualmente desde el admin.

Estado final: el editor produce `CodeBlock` → el seed escribe el mismo shape → el converter lee el
mismo shape. Un solo camino, sin ramas muertas.

## Segundo hueco: nodo `list` sin `tag` (falla en render, no en validación)

Tras sembrar OK, el detalle de post daba 500: `Element type is invalid` en el converter `list` de
`@payloadcms/richtext-lexical` (`<NodeTag>` con `NodeTag = node.tag === undefined`). El nodo `list`
del seed (heredado de TOD-65) tenía `listType` y `start` pero **no `tag`**. La validación de Payload
no exige `tag`, pero `ListNode.exportJSON()` siempre lo emite (`'ul'` para bullet/check, `'ol'` para
number) y el converter JSX lo necesita. Fix: añadir `tag: 'ul'` al nodo `list` en `makeBody`.
Verificados además los converters por defecto de `paragraph`/`text`/`link` — sin más huecos.

Recordatorio operativo: el seed es idempotente por slug, así que corregir `makeBody` **no** actualiza
posts ya sembrados; hay que borrarlos y re-sembrar (o BD limpia) para que tomen el body corregido.

## Tercer detalle: viñetas/números de lista no se mostraban (CSS)

El detalle de post ya renderizaba, pero las listas salían sin marcadores. Causa: en `app/globals.css`
la regla `.ab-prose ul, .ab-prose ol` usaba `display: flex; flex-direction: column; gap: 8px`, y un
flex container anula el `display: list-item` de los `<li>`, eliminando viñetas/números. Fix: volver a
layout de lista normal con `list-style: disc` (ul) / `decimal` (ol) y recuperar el espaciado con
`.ab-prose li + li { margin-top: 8px }`. Solo CSS, no requiere re-sembrar.

## Verificación

- `pnpm exec tsc --noEmit` ✅
- `pnpm lint` ✅
- `pnpm generate:types` / `pnpm generate:importmap` ✅

**Pendiente (lo corre José, el dev server es infra aparte):** con BD limpia, `pnpm dev` debe loguear
`[seed] Post: …` ×7 y `[seed] Dev seed completo.` sin `ValidationError`; `/admin/collections/posts`
con 7 posts; y un post `rich` en `/blog/<slug>` renderizando link clicable, bloque de código
resaltado (Shiki) con botón copiar, y el Callout con su link interno. Si algo aún fallara, el nuevo
logging por post mostrará el campo exacto (`err.data.errors`) — fin de la iteración ciega.
