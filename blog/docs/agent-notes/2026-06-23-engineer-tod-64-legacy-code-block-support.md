# TOD-64 — Soporte para bloques legacy Code en el render público de Lexical

**2026-06-23 — Engineer**

## Qué pasó

QA reportó que el post `/blog/qa-codeblock-copy-2026-06-22` renderizaba `unknown node` en lugar del bloque de código. El build emitía warnings: `Lexical => JSX converter: Blocks converter: found Code block, but no converter is provided`.

## Causa raíz

El codebase tiene **dos formatos de bloques de código** coexistiendo:

1. **Formato actual** (post-TOD-44): `type: 'code'` — el nodo built-in de Lexical (`CodeNode` de `@lexical/code`)
2. **Formato legacy**: `type: 'block'` con `fields.blockType: 'Code'` — un bloque custom de Payload usado antes de migrar al nodo nativo

En TOD-44 se movió el converter de `blocks.Code` a `code` directo porque el contenido **nuevo** usa el formato nativo. Pero el contenido **publicado anterior** todavía usa el formato legacy, y al no encontrar converter para `blocks.Code`, el renderer caía al fallback `unknown node`.

## Qué hice

Añadí **backward compatibility** sin romper el soporte actual:

### 1. Añadí el tipo `LegacyCodeFields` en `lib/lexical/converters.tsx`

```tsx
type LegacyCodeFields = {
  blockType: 'Code'
  language?: string
  content?: string
}
```

### 2. Añadí el converter `blocks.Code` en `makeBodyConverters`

El converter toma el `content` (string plano) del legacy block, lo busca en el `highlightMap` pre-calculado (igual que el converter `code` actual), y devuelve `<CodeBlockClient>`:

```tsx
Code: ({ node }: { node: SerializedBlockNode<any> }) => {
  const typedNode = node as SerializedBlockNode<LegacyCodeFields>
  const fields = typedNode.fields ?? {}
  const text = fields.content ?? ''
  const html = highlightMap.get(text) ?? escapeHtml(text)
  return <CodeBlockClient lang={fields.language} code={text} html={html} />
}
```

### 3. Actualicé `collectCodeNodes` en `lib/code-highlight.ts`

La función que recorre el árbol Lexical para pre-resaltar con Shiki ahora reconoce **ambos formatos**:

```tsx
// Formato actual: type: 'code' con children estructura
if (node.type === 'code') {
  const text = extractCodeText(node.children ?? [])
  if (!out.has(text)) out.set(text, node.language)
}

// Formato legacy: type: 'block' con fields.blockType: 'Code'
if (node.type === 'block' && node.fields?.blockType === 'Code') {
  const content = node.fields.content
  if (typeof content === 'string' && content && !out.has(content)) {
    out.set(content, node.fields.language)
  }
}
```

### 4. Expandí el tipo `LexicalChildNode` para cubrir ambos formatos

```tsx
fields?: {
  content?: string | { root?: { children?: LexicalChildNode[] } }
  blockType?: string
  language?: string
}
```

Ahora `content` puede ser:
- `string` (legacy Code block)
- `{ root: { children: ... } }` (Callout y otros bloques con contenido anidado)

## Por qué este enfoque

### Alternativas descartadas

1. **Migrar el contenido legacy a formato nativo**: requeriría script de migración en Payload, riesgo de pérdida de datos, downtime.
2. **Ignorar el contenido legacy**: rompe posts publicados existentes.

### Ventajas del enfoque actual

- **Zero downtime**: el contenido legacy sigue renderizando correctamente.
- **Zero migration debt**: no requiere migración de datos en Payload.
- **Coherencia de rendering**: ambos formatos pasan por el mismo pipeline de Shiki server-side y CodeBlockClient.
- **Forward compatible**: si en el futuro se migra el contenido legacy a formato nativo, eliminar el converter `blocks.Code` es trivial (solo afectará contenido no migrado).

## Verificación

- `pnpm run lint` → OK
- `pnpm run build` → OK (sin warnings sobre `Code block`, pre-render de 6 páginas estáticas)
- El post `/blog/qa-codeblock-copy-2026-06-22` debería renderizar el bloque de código con Shiki y botón copiar (verificación manual pendiente de QA)

## Contexto para futuras migraciones

Si en algún momento se decide migrar el contenido legacy a formato nativo:

1. Escribir script de migración en Payload que transforme:
   - `type: 'block', fields: { blockType: 'Code', content: string, language: string }`
   - en `type: 'code', language: string, children: [{ type: 'line', children: [{ type: 'text', text: string }] }]`
2. Correr el script sobre los posts publicados
3. Eliminar el converter `blocks.Code` y el `LegacyCodeFields` type
4. Eliminar la lógica de `collectCodeNodes` que maneja legacy blocks

Hasta entonces, la convivencia de ambos formatos está soportada y es transparente para el usuario final.
