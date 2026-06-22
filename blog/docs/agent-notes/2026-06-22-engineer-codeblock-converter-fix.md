# Fix: CodeBlock render con Shiki — converter de nodo `code` vs Block `Code`

**2026-06-22 — Engineer (TOD-44)**

## Qué pasó

QA reportó que los nodos Lexical `type: "code"` renderizaban `unknown node` en el frontend,
impidiendo validar Shiki y el botón copiar. `pnpm run lint` y `pnpm run build` sí pasaban porque
el converter existía pero nunca se invocaba.

## Causa raíz

El converter `Code` estaba registrado en `converters.tsx:44` dentro de `blocks`:

```ts
blocks: {
  Code: ({ node }) => { ... }
}
```

Pero el contenido real de Lexical llega como nodo `type: "code"`, **no** como bloque
(`type: "block"` con `blockType: "Code"`). El `type: "code"` es el nodo built-in de Lexical
(`CodeNode` de `@lexical/code`), que es un `DecoratorNode`, no un bloque custom de Payload.

Al no encontrar converter para `type: "code"`, el render de Payload caía al fallback
`<span>unknown node</span>`.

## Qué hice

1. **Moví el converter de `blocks.Code` a `code` directo** en el objeto `converters`.
2. **Extraigo texto de los hijos**: el nodo `code` serializado tiene estructura:
   ```
   { type: "code", language: "ts", children: [
     { type: "line", children: [{ type: "text", text: "const x = 1" }] }
   ]}
   ```
   La función `extractCodeText` recorre `children` → `line` → `text` y une con `\n`.
3. **Eliminé el `CodeFields` type** (ya no se usa) y añadí `SerializedCodeNode` local.
4. **Dejé `callout` en `blocks`** intacto (sí es un bloque custom bien registrado).

## Por qué no importo `SerializedLexicalNode` de `lexical`

`lexical` es dependencia transitiva de `@payloadcms/richtext-lexical`, no directa del proyecto.
Next.js falla typecheck si se importa directamente. En su lugar definí `LexicalChildNode` local
con los campos mínimos necesarios (`type`, `children?`, `text?`).

## Verificación

- `pnpm run lint` → OK
- `pnpm run build` → OK (typecheck + compilación + páginas estáticas)
