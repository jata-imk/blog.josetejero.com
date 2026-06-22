# 2026-06-19 — Engineer — TOD-35: Definir bloque Callout en Lexical y Payload

## Qué hice (verificación)

El bloque Callout ya estaba implementado al llegar a esta tarea. El Frontend lo
adelantó durante TOD-36 como parte del cableado renderer ↔ editor. Verifiqué que:

- `tsc --noEmit` compila sin errores
- `eslint` pasa limpio en los tres archivos del bloque
- La implementación sigue el contrato de ADR 0007

## Estado actual del bloque

### Archivos del bloque (todos en `blog/`)

| Archivo | Rol |
|---|---|
| `lib/lexical/calloutBlock.ts` | Definición Payload `Block`: slug `callout`, 4 variantes (`note\|tip\|warning\|danger`), `title` opcional, `content` richText anidado |
| `lib/lexical/converters.tsx` | `bodyConverters`: JSXConverter que traduce el nodo Lexical → `<Callout>` + `<RichText>` anidado |
| `collections/Posts.ts` (L73-78) | `BlocksFeature({ blocks: [calloutBlock] })` cableado en el `lexicalEditor()` del campo `body` |
| `components/blocks/Callout.tsx` | Componente presentacional React puro (4 variantes con íconos) |
| `app/globals.css` (L419-434) | Clases `.ab-callout`, `.ab-callout-note`, `.ab-callout-tip`, `.ab-callout-warning`, `.ab-callout-danger` |

### Pipeline de render

```
JSON Lexical (de Payload)
  → <RichText data={post.body} converters={bodyConverters}>
    → defaultConverters: headings, párrafos, listas, links, código, imágenes...
    → blocks.callout: <Callout kind={variant}>
        → <RichText data={content} converters={converters} />  (recursivo)
```

### Contrato verificado (ADR 0007)

- `variant` acepta solo `note | tip | warning | danger` (no hay alias `warn`)
- `title` es opcional; si falta, el componente usa la etiqueta semántica (`Nota`, `Consejo`, etc.)
- `content` es rich text anidado, no HTML plano
- El componente `Callout` no conoce Payload ni Lexical

## Por qué no tuve que escribir nada

El Frontend, durante TOD-36, creó `calloutBlock.ts`, `converters.tsx`, y cableó
`BlocksFeature` en `Posts.ts` — que es exactamente la parte "Definir bloque en
Lexical/Payload" que el Architect asignó a Engineer en el plan de TOD-30. Al ser
un solo bloque y tan acotado, el Frontend lo implementó de una vez para no dejar
el renderer sin datos reales contra los que probar.

## Próximos pasos

- QA: probar las 4 variantes insertando callouts desde el admin y verificando
  render en desktop (1440px) y móvil (390px)
- La página de detalle `/blog/[slug]` aún no existe — `bodyConverters` está listo
  para cuando se cree esa ruta
