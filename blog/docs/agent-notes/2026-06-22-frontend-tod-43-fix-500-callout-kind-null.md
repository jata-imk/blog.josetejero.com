# TOD-43: Fix 500 en /blog/[slug] al renderizar Callout

**Agente:** Frontend (Diseño) · **Fecha:** 2026-06-22

## Síntoma

`GET /blog/qa-callout-e2e-publico` → HTTP 500. El post tiene cuatro bloques Callout (note/tip/warning/danger). `pnpm build` pasaba limpio; el fallo era sólo en runtime.

## Causa raíz

`Callout.tsx` tenía:

```tsx
export function Callout({ kind = 'note', ... }) {
  const { icon, label } = CONFIG[kind]  // 💥 cuando kind es null
```

JavaScript default parameters (`kind = 'note'`) sólo aplican cuando `kind === undefined`, **no cuando es `null`**. Payload/Lexical serializa campos ausentes como `null`, así que `CONFIG[null]` → `undefined` → `TypeError: Cannot destructure property 'icon' of undefined`.

El crash ocurre durante el **render de React**, no durante la creación del JSX en el converter. El try-catch de `convertLexicalNodesToJSX` (Payload internals) sólo envuelve la _creación_ del elemento JSX, no el _render_ del componente. Por tanto el TypeError escapa hasta Next.js y produce el 500.

## Fix

### `blog/components/blocks/Callout.tsx`

Guardia explícita con fallback:

```tsx
export function Callout({ kind, title, children }: { kind?: Kind | null; ... }) {
  const safeKind: Kind = (kind && CONFIG[kind]) ? kind : 'note'
  const { icon, label } = CONFIG[safeKind]
  ...
}
```

### `blog/lib/lexical/converters.tsx`

Defensivas adicionales en el converter de callout:

```tsx
const fields = typedNode.fields ?? {}          // fields nunca null
const { variant, title, content } = fields
// ...
{content ? <RichText data={content} .../> : null}  // content puede ser null/undefined
```

## Lección para el board

El boundary de seguridad de Payload `convertLexicalNodesToJSX` **no protege** errores que lanzan dentro del render de componentes React. Cualquier prop que venga de datos CMS debe ser tratada como potencialmente `null` (no sólo `undefined`), incluso si TypeScript dice que no puede serlo.

## Verificación

- `npx tsc --noEmit` → limpio (0 errores)
- `pnpm build` → OK
- Commit: `49723fb`
