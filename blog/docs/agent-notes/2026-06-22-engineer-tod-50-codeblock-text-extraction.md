# Fix: extracción de texto en nodos `code` para CodeBlock (TOD-50)

**2026-06-22 — Engineer (TOD-50)**

## Problema

La función `extractCodeText` en `blog/lib/lexical/converters.tsx` perdía texto de los nodos
Lexical `code` en dos escenarios:

1. **Tokens `code-highlight` ignorados**: Lexical aplica resaltado de sintaxis nativo (vía
   `registerCodeHighlighting` de `@lexical/code`) transformando tokens dentro de cada línea en
   nodos `CodeHighlightNode`. Estos se serializan con `type: "code-highlight"` y tienen propiedad
   `.text` (heredan de `TextNode`). La función original solo capturaba `token.type === 'text'`,
   ignorando los tokens envueltos en `code-highlight`. Resultado: texto incompleto o vacío.

2. **Líneas vacías perdidas**: La condición `if (child.type === 'line' && child.children && ...)`
   exigía que la línea tuviera `children` para ser procesada. Una línea vacía (`children: []` o
   sin `children`) se saltaba, perdiendo los saltos de línea en blanco del snippet original.

## Qué hice

Cambio mínimo y quirúrgico en `extractCodeText` (`converters.tsx:31-47`):

- **Siempre pushear línea**: El `push` al array `lines` ahora ocurre para todo nodo `type === 'line'`,
  tenga o no children. Línea sin children → string vacío → se preserva el salto de línea.
- **Extraer por propiedad `text`, no por `type`**: En lugar de `token.type === 'text'`, ahora se
  comprueba `'text' in token && typeof token.text === 'string'`. Esto captura tanto nodos `text`
  como `code-highlight` (ambos tienen `.text`).
- Se añadió `typeof token.text === 'string'` como guarda de tipo (evita valores inesperados).

```diff
 function extractCodeText(children: LexicalChildNode[]): string {
   const lines: string[] = []
   for (const child of children) {
-    if (child.type === 'line' && child.children && Array.isArray(child.children)) {
+    if (child.type === 'line') {
       let lineText = ''
-      for (const token of child.children) {
-        if (token.type === 'text' && 'text' in token) {
-          lineText += (token as { text: string }).text
+      if (child.children && Array.isArray(child.children)) {
+        for (const token of child.children) {
+          if ('text' in token && typeof token.text === 'string') {
+            lineText += token.text
+          }
         }
       }
       lines.push(lineText)
     }
   }
   return lines.join('\n')
 }
```

## Por qué no un approach recursivo genérico

El `extractCodeText` actual es específico para la estructura de `CodeNode`: sabe que los hijos
directos son `line` y que dentro de cada `line` hay tokens de texto. Un approach recursivo
genérico (recorrer todo el árbol buscando `text`) sería incorrecto porque perdería la estructura
de líneas (cada `line` debe producir exactamente una entrada en el array, para que `\n` preserve
la forma del snippet). La estructura del nodo `code` de Lexical es predecible y plana (2 niveles:
`code → line → token`), así que un walker de 2 niveles es suficiente y más mantenible.

## Verificación

- `pnpm run lint` → OK
- `pnpm run build` → OK (typecheck + compilación + páginas estáticas)
