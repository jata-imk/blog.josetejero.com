# 2026-06-19 — Frontend — TOD-36: Callout renderer Lexical → React

## Qué hice

- Corregí `components/blocks/Callout.tsx`: renombré `warn → warning`, añadí `danger`,
  tipo `Kind = 'note' | 'tip' | 'warning' | 'danger'`.
- Añadí icono `xCircle` a `components/ui/Ic.tsx` para la variante `danger`.
- En `app/globals.css`: renombré `.ab-callout-warn → .ab-callout-warning`, añadí
  `.ab-callout-danger` (tokens `--rose`, `--rose-tint`, `--rose-border`, `--rose-700`),
  añadí token `--rose-border: #fbc5cd`.
- Creé `lib/lexical/calloutBlock.ts`: definición del bloque Payload/Lexical con `variant`,
  `title` y `content` (richText anidado).
- Creé `lib/lexical/converters.tsx`: `bodyConverters` — función `JSXConvertersFunction`
  que extiende los converters por defecto con el converter de `blocks.callout`.
- Wired `calloutBlock` en `collections/Posts.ts` via `BlocksFeature`.

## Cómo un nodo custom de Lexical se convierte en React

(Nota didáctica para QA y board)

### 1. El dato: qué guarda Payload en la BD

Payload almacena el cuerpo de un post como JSON de Lexical. Un Callout insertado por el
editor queda así:

```json
{
  "type": "block",
  "fields": {
    "blockType": "callout",
    "variant": "warning",
    "title": "Atención",
    "content": { "root": { "children": [...] } }
  }
}
```

El nodo es de tipo genérico `"block"`; la variante concreta se identifica por `blockType`.

### 2. El registro: BlocksFeature en el editor

Para que Lexical sepa que `callout` es un bloque válido, hay que declararlo en la config
del editor. En `collections/Posts.ts` usamos:

```typescript
editor: lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    BlocksFeature({ blocks: [calloutBlock] }),
  ],
})
```

`calloutBlock` define el schema de campos (`variant`, `title`, `content`) y vive en
`lib/lexical/calloutBlock.ts` separado de la colección para que el renderer lo pueda
importar también sin arrastrar dependencias de Payload.

### 3. El renderer: JSXConverter en lib/lexical/converters.tsx

`@payloadcms/richtext-lexical/react` exporta `RichText`, un Server Component que recibe
el JSON serializado y un mapa de converters. Cada converter es una función
`(args: { node, nodesToJSX, ... }) => ReactNode`.

El converter de callout:

1. Recibe el nodo tipado como `SerializedBlockNode<CalloutFields>`.
2. Extrae `variant`, `title`, `content` de `node.fields`.
3. Renderiza `<Callout kind={variant}>` (componente puramente presentacional).
4. Para el contenido anidado pasa `content` de vuelta a `<RichText>` con los mismos
   `converters` — esto garantiza que listas, código inline, links, etc. se rendericen
   igual que en el body principal. **No hay una segunda pipeline de render**.

La referencia circular (converters refiriéndose a sí mismo) es safe porque JavaScript
cierra sobre la variable; para cuando el converter se llama, `converters` ya está
asignado.

### 4. Cómo lo usa una página

```tsx
import { RichText } from '@payloadcms/richtext-lexical/react'
import { bodyConverters } from '@/lib/lexical/converters'

export default async function PostPage({ params }) {
  const post = await getPostBySlug(params.slug)
  return <RichText data={post.body} converters={bodyConverters} />
}
```

`Callout` es un Server Component (no 'use client') porque solo renderiza HTML
estático; no necesita estado ni eventos.

## Límites y próximos pasos

- La página de detalle de post todavía no existe — el wiring de `bodyConverters` queda
  para cuando Engineer o CEO creen la ruta `/blog/[slug]`.
- QA debe verificar las 4 variantes en desktop (1440px) y móvil (390px) una vez el
  dev server esté levantado y haya al menos un post con callouts insertados desde el admin.
- Si se añade un segundo bloque custom (requiere ADR nueva según ADR 0003), basta con
  añadir su converter a `bodyConverters` en `lib/lexical/converters.tsx`.
