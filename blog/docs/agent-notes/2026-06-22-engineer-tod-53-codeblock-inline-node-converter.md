# TOD-53: Fix definitivo — converter `code` inline + extractCodeText con estructura `line`

**2026-06-22 — Engineer (TOD-53)**

## Problema

QA rerun en `localhost:3000/blog/qa-codeblock-shiki-1782145178799` reportó CodeBlock vacío (`<code></code>`) y copiar vacío. Los fixes anteriores (TOD-50, TOD-53 parte 1 y 2) no estaban presentes en el código actual — el archivo `converters.tsx` solo tenía un converter en `blocks.Code` (para el bloque custom de Payload), pero **nunca un converter para el nodo inline `type: "code"` de Lexical**.

## Causa raíz

1. El nodo `code` de Lexical es un **inline node** (tipo `"code"`), NO un bloque custom de Payload.
2. Nuestro converter estaba registrado en `converters.blocks.Code`, que es el namespace de bloques custom (Payload Blocks).
3. Los nodos inline van por `converters.code` (top-level del objeto `JSXConverters`).
4. Al no encontrar converter para `type: "code"`, `defaultConverters` de Payload lo manejaba con su renderer por defecto, que no inyecta Shiki ni CopyButton y además puede perder el texto.

## Solución

### 1. Añadí `code` converter al nivel top de `converters`

```typescript
export const bodyConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  code: ({ node }) => {
    const text = extractCodeText(node.children ?? [])
    return <CodeBlock lang={node.language} code={text} />
  },
  blocks: { ... }
})
```

El `code` a nivel top intercepta el nodo inline de Lexical **antes** de que lo maneje `defaultConverters` (porque lo sobreescribe tras el spread). Así, el inline `code` pasa por nuestro `CodeBlock` → Shiki + CopyButton.

### 2. Añadí `extractCodeText` con soporte para `line` y estructura plana

La estructura serializada real del nodo `code` en Lexical tiene hijos `type: "line"` que envuelven tokens:

```json
{
  "type": "code",
  "language": "ts",
  "children": [
    { "type": "line", "children": [
      { "type": "code-highlight", "text": "const" },
      { "type": "code-highlight", "text": " " },
      { "type": "code-highlight", "text": "x" },
      { "type": "code-highlight", "text": " " },
      { "type": "code-highlight", "text": "=" }
    ]},
    { "type": "line", "children": [
      { "type": "code-highlight", "text": " " },
      { "type": "code-highlight", "text": "42" }
    ]}
  ]
}
```

La función `extractCodeText()` maneja:

| child.type | Acción |
|---|---|
| `"line"` | Itera sus hijos: `tab` → `\t`, `text`/`code-highlight` → acumula `.text`. Pushea al array de líneas. |
| `"linebreak"` | Pushea línea vacía. |
| `"tab"` | Añade `\t` a la línea actual (estructura plana). |
| `default` (con `.text`) | Añade texto a la línea actual (estructura plana). |

Al final, `lines.join('\n')` produce el texto para el portapapeles.

### 3. Mantuve `blocks.Code` para el bloque custom

Si en el futuro se registra un bloque Payload `Code`, el converter en `blocks` sigue funcionando desde `fields.code`.

## Por qué `extractCodeText` y no otro approach

- **Recorrido de 2 niveles** (code → line → token): suficiente para la estructura real de Lexical. Una recursión genérica perdería la estructura de líneas.
- **Propiedad `.text` en vez de `type === 'code-highlight'`**: Los nodos `CodeHighlightNode` heredan de `TextNode` y tienen `.text`. Comprobar por la propiedad es más robusto que por el type.
- **Soporta ambas estructuras** (con `line` y plana): por si alguna versión de Lexical o algún edge case entrega hijos planos.

## Verificación

- `pnpm run lint` → OK
- `pnpm run build` → OK (typecheck + compilación + páginas estáticas)
- Falta QA manual en `http://localhost:3000/blog/qa-codeblock-shiki-1782145178799` para confirmar que:
  1. El bloque `ts` muestra el snippet resaltado con Shiki
  2. El bloque `foo-lang` cae a código plano visible
  3. El portapapeles recibe el texto completo (no vacío)
