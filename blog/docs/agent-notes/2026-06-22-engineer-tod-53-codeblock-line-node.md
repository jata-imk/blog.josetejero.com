# Fix: extractCodeText no manejaba nodos `line` (TOD-53)

**2026-06-22 — Engineer (TOD-53 follow-up)**

## Problema

Tras el fix de TOD-50 (manejar `code-highlight` y líneas vacías), el QA encontró que
`CodeBlock` seguía renderizando `<code></code>` vacío en `localhost:3000`.

## Causa raíz

Lexical estructura el contenido de un nodo `code` con hijos de tipo `line`:

```json
{
  "type": "code",
  "language": "ts",
  "children": [
    {
      "type": "line",
      "children": [
        { "type": "text", "text": "const answer: number = 42" }
      ]
    }
  ]
}
```

La versión anterior de `extractCodeText()` solo manejaba nodos directos
(`linebreak`, `tab`, y nodos con `.text`), asumiendo una estructura plana.
Los nodos `line` no tienen propiedad `.text` propia — envuelven hijos
(token, tab, code-highlight). Al no coincidir con ningún caso del switch,
el texto se perdía completamente.

## Qué hice

Añadí manejo explícito de `child.type === 'line'` que extrae el texto de
los hijos de cada línea (`tab`, `code-highlight`, `text`). La función ahora
soporta ambas estructuras:

1. **Plana** (ej. nodos `text`/`linebreak`/`tab` directos) → flujo existente.
2. **Anidada** (`line` → `text`/`tab`/`code-highlight`) → nuevo flujo.

```diff
   for (const child of children) {
-    switch (child.type) {
-      case 'linebreak': ...
-      case 'tab': ...
-      default: if ('text' in child) ...
+    if (child.type === 'line') {
+      // Extraer texto de los hijos de cada línea
+      let line = ''
+      if (child.children && Array.isArray(child.children)) {
+        for (const token of child.children) {
+          if (token.type === 'tab') line += '\t'
+          else if ('text' in token && typeof token.text === 'string') line += token.text
+        }
+      }
+      lines.push(line)
+    } else if (child.type === 'linebreak') { ... }
+    else if (child.type === 'tab') { ... }
+    else if ('text' in child) { ... }
   }
```

## Por qué sin recursión genérica

Una línea de código (`type: line`) debe producir exactamente una entrada en el
array de líneas para que `\n` preserve la forma del snippet. Recorrer el árbol
cíclicamente perdería esta estructura de líneas. El walker de 2 niveles
(`code → line → token`) es suficiente y mantenible.

## Verificación

- `pnpm run lint` → OK
- `pnpm run build` → OK (typecheck + compilación + páginas estáticas)
