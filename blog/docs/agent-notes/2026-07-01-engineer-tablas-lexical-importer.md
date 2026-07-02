# 2026-07-01 — Engineer: Soporte de tablas GFM en importador MD→Lexical

## Qué se hizo

Al importar `conectar-api-notion-openclaw.md` (post real, tabla "Errores comunes") se detectó
que las tablas Markdown no funcionaban en ningún punto del pipeline: sin `remark-gfm` el parser
no las reconocía (quedaban como párrafo de texto con pipes), y aunque se reconocieran, no había
nodo Lexical destino ni feature de editor habilitada. Ver ADR [`0024`](../adr/0024-contrato-del-importador-md-lexical.md#ajuste--soporte-de-tablas-2026-07-01).

**Hallazgo clave:** no hizo falta un bloque custom. Payload 3.85.1 (`@payloadcms/richtext-lexical`)
ya trae `EXPERIMENTAL_TableFeature` (envuelve `@lexical/table` 0.41), y los converters JSX por
defecto del render ya incluyen `TableJSXConverter`. Solo faltaba conectar las piezas.

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `lib/lexical/bodyEditor.ts` | +`EXPERIMENTAL_TableFeature()` en el editor compartido (Posts + Series) |
| `lib/import/mdToLexical.ts` | +`remark-gfm` en ambos parses; tipos `LexicalTable/Row/Cell`; `case 'table'` en `walkBlock` (`walkTable()`); filtra tablas dentro de asides (callout no tiene la feature) |
| `lib/lexical/converters.tsx` | Override `table`/`tablerow`/`tablecell` con clases `.ab-table-*` en vez del CSS inline por defecto del paquete |
| `app/globals.css` | +bloque `.ab-table*` (tokens `--line`, `--bg-soft`, `--ink-2`, mismo patrón que `.ab-callout`/`.ab-code`) |
| `package.json` / `pnpm-lock.yaml` | +`remark-gfm` |
| `app/(payload)/admin/importMap.js` | Regenerado (`TableFeatureClient`) |
| `docs/adr/0024-...md` | Sección "Ajuste — soporte de tablas" |

### Detalles de mapeo

- mdast `table` → Lexical `table`; primera fila GFM → `headerState: 2` (COLUMN) en cada celda,
  resto `headerState: 0`. El converter de Payload decide `th` vs `td` solo con `headerState > 0`.
- Cada celda Lexical envuelve su contenido en un `paragraph` (las celdas de tabla contienen
  bloques, no inlines sueltos) — reutiliza `walkInline`/`makeParagraph` existentes.
- `colSpan`/`rowSpan` fijos en `1` (el importador no genera celdas combinadas; GFM tampoco las
  soporta nativamente).
- Bonus gratis de `remark-gfm`: `~~strikethrough~~` empieza a funcionar (el código en
  `walkInline` ya lo soportaba pero era dead-code sin GFM), igual que autolinks y task lists.

### Verificado

- `npx tsc --noEmit` limpio, `eslint` limpio.
- Test manual (`node --experimental-strip-types`, script descartado) contra el post real:
  6 filas (1 header + 5 datos) × 3 columnas, `headerState: 2` en la fila 0, `nodesDropped: []`.

### Limitación conocida

`calloutBlock.content` sigue usando `lexicalEditor()` bare (sin `TableFeature`) — una tabla
dentro de un `<aside>` se dropea y se reporta en `nodesDropped`, igual que ya pasaba con code
fences dentro de asides. No bloqueante: no hay tablas dentro de asides en el contenido a migrar.
