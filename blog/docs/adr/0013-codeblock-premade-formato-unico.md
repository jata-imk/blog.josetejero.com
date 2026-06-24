# 0013 — El bloque de código del cuerpo es el `CodeBlock` premade de Payload (formato único)

- Estado: aceptada
- Fecha: 2026-06-24
- Decidido por: José (revisión) + Engineer (sesión de fix del seed Lexical)
- Reemplaza parcialmente a: [0008](0008-render-de-codeblock-con-shiki.md) (premisa "el código usa el
  nodo built-in de Lexical, no un bloque custom")

## Contexto

El seed dev de posts (`lib/seed.ts`) fallaba al arrancar con
`ValidationError: The following fields are invalid: Cuerpo, Cuerpo > Contenido`, y ningún post se
creaba. Al investigarlo salió a la luz un problema de fondo en cómo el proyecto representaba el código
en el cuerpo Lexical:

- El ADR 0008 fijó que "el código usa el **nodo built-in de Lexical**, no un bloque custom" — es decir,
  un nodo `type: 'code'` (con hijos `line`/`token`, estilo `@lexical/code`).
- Pero el `git log` de `collections/Posts.ts` prueba que **el editor del body nunca registró un feature
  de código**. `defaultEditorFeatures` de `@payloadcms/richtext-lexical` solo trae `InlineCodeFeature`
  (formato inline), **ningún bloque de código**. El único bloque registrado era `calloutBlock`.
- Consecuencia: ese nodo `type:'code'` **no se podía autorear desde el admin** ni validaba cuando se
  escribía a mano en el seed. Todo el pipeline de render (Shiki + `CodeBlockClient`, TOD-31/32/53/58)
  se construyó contra un shape que ninguna pieza de escritura producía. Varios agentes iteraron a
  ciegas sobre el shape (line/token vs `fields.content` vs `fields.code`) generando "soporte legacy"
  para formatos que nunca existieron en producción.

Restricciones que se mantienen:

- El cuerpo sigue siendo rich text Lexical (ADR 0002) y Payload v3 la única capa de datos (ADR 0001).
- El resaltado vive en servidor con Shiki y solo el botón copiar es cliente (ADR 0008 — esa parte
  sigue vigente).
- El string plano del snippet es la fuente de verdad; la presentación no se persiste.

## Opciones consideradas

- **A — Registrar el feature `@lexical/code` que emite `type:'code'` (line/token)** para alinear el
  editor con el shape que el converter ya asumía.
  Pro: cero cambios en la capa de lectura existente.
  Contra: shape más frágil y verboso de autorear/serializar; no es el camino que Payload recomienda
  para bloques de código; mantiene tokens de sintaxis en el dato (que Shiki recalcula igualmente).
- **B — Adoptar el `CodeBlock` premade de `@payloadcms/richtext-lexical`** (un bloque de
  `BlocksFeature`, slug `Code`, campos `language` select + `code` string).
  Pro: autorable desde el admin con validación real; el código queda como string plano (encaja con el
  contrato de ADR 0008: un solo `code` alimenta Shiki y el portapapeles); Shiki resalta en servidor sin
  cambios; `CodeBlockClient` se reutiliza igual.
  Contra: la API del premade está marcada `@experimental` por Payload; obliga a alinear converter y
  highlighter al campo `code`.

## Decisión

Se adopta la **Opción B**. El bloque de código del cuerpo es el `CodeBlock` premade de Payload,
registrado junto al Callout: `BlocksFeature({ blocks: [calloutBlock, CodeBlock()] })`
(`collections/Posts.ts`).

Contrato del formato (único, sin variantes legacy):

- Shape serializado: `{ type: 'block', fields: { blockType: 'Code', language: <key de select>, code: <string> } }`.
- La capa de lectura lee **solo** `fields.code`: converter `blocks.Code` en `lib/lexical/converters.tsx`
  y `collectCodeNodes` en `lib/code-highlight.ts`.
- El seed (`makeBody`) escribe ese mismo shape, con `language` ∈ las claves del select del premade
  (p. ej. `typescript`); un valor fuera del select **no valida**.
- Se elimina todo camino fantasma: el converter `type:'code'` (line/token), la función
  `extractCodeText`, y el fallback a `fields.content` (string) introducido como "legacy" en TOD-64.
  No había datos reales de producción en esos formatos (solo fixtures de QA insertados por script);
  no se mantiene compatibilidad hacia atrás.

## Consecuencias

- Más fácil: un solo formato canónico de extremo a extremo — el editor produce `CodeBlock`, el seed
  escribe el mismo shape, el converter lee el mismo shape. Sin ramas muertas ni "dos maneras".
- Más fácil: el código de un post es autorable y validable desde el admin como cualquier bloque.
- Más fácil para la IA futura: deja de existir la contradicción entre el dato real y lo que las notas
  asumían; este ADR es la fuente de verdad del shape.
- Más difícil / deuda asumida: dependemos de una API `@experimental` de Payload; si cambia en una
  minor, hay que reajustar el shape en seed + lectura. Riesgo aceptado para un blog personal.
- La parte de ADR 0008 sobre **resaltar en servidor y copiar en cliente sigue vigente**; lo único que
  este ADR reemplaza es la premisa de "nodo built-in de Lexical".

## Evidencia / seguimiento

Detalle de la sesión de fix (causas raíz del `ValidationError`, shape de link/code/list, por qué el
"legacy" era ficción) en
`docs/agent-notes/2026-06-24-engineer-fix-seed-lexical-link-codeblock.md`.
