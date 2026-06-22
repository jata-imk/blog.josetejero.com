# TOD-53: CodeBlock hydration fix

**Date:** 2026-06-22  
**Agent:** Engineer  
**Issue:** [TOD-53](/TOD/issues/TOD-53)

## Problema

QA reportó que el botón "Copiar código" no funcionaba en `http://localhost:3000/blog/qa-codeblock-shiki-1782145178799`:
- El `onClick` del `CopyButton` nunca se ejecutaba.
- `navigator.clipboard.readText()` devolvía string vacío.
- El render visual funcionaba (Shiki mostraba el código), pero la interactividad estaba rota.

## Diagnóstico: problema de hidratación de React

El converter de `RichText` (en `blog/lib/lexical/converters.tsx`) devolvía `<CodeBlock>`, que es un **async Server Component**:

```tsx
// ANTES (no funciona)
code: ({ node }) => {
  const text = extractCodeText(node.children ?? [])
  return <CodeBlock lang={node.language} code={text} />
}
```

`CodeBlock` hacía `await highlightCode()` en el servidor para generar HTML de Shiki.

### ¿Por qué esto rompe la hidratación?

En Next.js App Router:
1. `RichText` de Payload es un Client Component que se ejecuta tanto en servidor (SSR) como en cliente (hidratación).
2. Los **converters** se ejecutan durante el renderizado de `RichText`, incluyendo durante la hidratación del cliente.
3. **Next.js no puede hidratar async Server Components que se devuelven desde código de cliente.**
4. Cuando el converter devuelve `<CodeBlock>` (async SC), React no puede reconciliar el árbol en el cliente.
5. Resultado: el árbol de `CodeBlockClient` → `CopyButton` nunca se hidrata, así que `onClick` nunca se conecta.

## Solución: highlighting progresivo del lado del cliente

Cambié la arquitectura para que el converter devuelva **solo Client Components**:

1. **Nuevo archivo:** `blog/lib/code-highlight-client.ts`  
   - Versión cliente de `highlightCode()` usando import dinámico de Shiki.
   - Fallback a HTML escapado si Shiki falla.

2. **Modificación:** `blog/lib/lexical/converters.tsx`  
   - El converter ahora devuelve `<CodeBlockClient>` directamente con HTML escapado como fallback:
     ```tsx
     code: ({ node }) => {
       const text = extractCodeText(node.children ?? [])
       return <CodeBlockClient lang={node.language} code={text} html={escapeHtml(text)} />
     }
     ```

3. **Modificación:** `blog/components/blocks/CodeBlockClient.tsx`  
   - Agregué `useState` y `useEffect` para hacer highlighting progresivo:
     ```tsx
     const [html, setHtml] = useState(initialHtml) // Empieza con fallback escapado
     
     useEffect(() => {
       highlightCodeClient(code, lang)
         .then(setHtml)
         .catch(() => { /* keep fallback */ })
     }, [code, lang, initialHtml])
     ```

4. **Sin cambios:** `blog/components/blocks/CodeBlock.tsx`  
   - Todavía existe como Server Component para uso directo desde páginas (fuera del converter).
   - El converter simplemente ya no lo usa.

## Trade-offs

### ✅ Beneficios
- **Hidratación correcta:** `CopyButton` ahora funciona porque todo el árbol es Client Component.
- **Progressive enhancement:** el código escapado se muestra de inmediato, luego Shiki lo mejora visualmente.
- **Bundle size:** Shiki se carga dinámicamente solo si se necesita.

### ⚠️ Trade-offs
- **Bundle size aumenta:** Shiki ahora se bundlea del lado del cliente (~500KB comprimido aprox).
- **Flash of unstyled code:** el usuario puede ver brevemente el código sin highlight antes de que Shiki procese.
- **Duplicación de lógica:** ahora tenemos `code-highlight.ts` (server-only) y `code-highlight-client.ts`.

## Alternativas consideradas y descartadas

1. **Pre-renderizar en la página antes de `<RichText>`**  
   - Requeriría recorrer el árbol de Lexical manualmente, hacer `await highlightCode()` para cada bloque, y pasar un mapa de resultados al converter.
   - Complejo y propenso a bugs. Payload no expone una forma fácil de inyectar contexto al converter.

2. **Guardar HTML pre-renderizado en la base de datos**  
   - Requeriría cambios en el schema de Payload y hooks para procesar bloques de código al guardar.
   - Overhead de migración y lógica adicional en Payload.

3. **Usar un highlighting más ligero del lado del cliente (highlight.js, Prism)**  
   - Cambiaría el look visual del código (actualmente usamos `github-dark` de Shiki).
   - QA ya validó que Shiki funciona visualmente, así que mantener consistencia.

## Verificación

- `pnpm lint`: ✅ pasa
- `pnpm build`: ✅ pasa (compiled successfully in 23.0s)
- QA debe verificar manualmente en `http://localhost:3000/blog/qa-codeblock-shiki-1782145178799`:
  1. El bloque `ts` muestra Shiki (puede haber un flash breve de texto plano).
  2. El bloque `foo-lang` muestra texto plano escapado.
  3. Hacer click en "Copiar código" → el botón cambia a "Copiado" y `navigator.clipboard.readText()` contiene el código.

## Relación con arquitectura Next.js

Este fix es didáctico para entender **Server vs Client Components en Next.js App Router**:

- **Server Components** pueden renderizar Client Components.
- **Client Components** NO pueden renderizar async Server Components.
- Los converters de `RichText` se ejecutan del lado del cliente, así que deben devolver solo Client Components o elementos simples.

Si en el futuro necesitamos pre-renderizar contenido pesado (imágenes, embeds, etc.) desde converters, la estrategia correcta es:
1. Pre-procesar en la página (Server Component) antes de pasar a `<RichText>`.
2. Pasar datos pre-procesados al converter vía props o context.
3. El converter simplemente usa los datos pre-procesados.
