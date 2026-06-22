# TOD-47: Fix de hidratación del botón Copiar en CodeBlock

## Problema

El botón "Copiar" en `CodeBlock` se renderizaba correctamente (HTML visible) pero
no recibía evento handlers de React. Click nativo funcionaba; `navigator.clipboard.writeText()`
nunca se invocaba. Síntoma clásico de componente no hidratado.

## Root cause

`CodeBlock` era un **async Server Component** que importaba y renderizaba directamente
`CopyButton` (`'use client'`). En teoría esto es válido en Next.js App Router — pero la
ruta de renderizado pasa por el pipeline de convertidores de `@payloadcms/richtext-lexical`:

```
PostPage (async server)
  → <RichText converters={bodyConverters} />  (sync server, from Payload npm)
    → convertLexicalToJSX() → converter Code() → <CodeBlock />
      → React.cloneElement(<CodeBlock />, { key: i })
        → [Next.js bundler no trace el límite 'use client' dentro del paquete externo]
```

El bundler de Next.js analiza estáticamente las importaciones para detectar límites
`'use client'`. Cuando `CodeBlock` (paquete local) se devuelve desde un converter de
un paquete npm externo, el tracing estático falla: Next.js no incluye `CopyButton` en
el RSC payload como "client boundary", y por tanto no se hidrata en el cliente.

## Fix

Patrón "Server wrapper + Client shell" (canónico en App Router):

- `CodeBlock.tsx` — sigue siendo async Server Component, solo hace el trabajo de Shiki
- `CodeBlockClient.tsx` — `'use client'`, contiene todo el HTML y el `CopyButton`
- `CopyButton.tsx` — sin cambios

```tsx
// CodeBlock.tsx (server)
export async function CodeBlock({ lang, code }) {
  const html = await highlightCode(code ?? '', lang)
  return <CodeBlockClient lang={lang} code={code ?? ''} html={html} />
}
```

```tsx
// CodeBlockClient.tsx (client)
'use client'
export function CodeBlockClient({ lang, code, html }) {
  return (
    <div className="ab-code">
      <div className="ab-code-bar">
        ...
        <CopyButton code={code} />
      </div>
      <pre><code dangerouslySetInnerHTML={{ __html: html }} /></pre>
    </div>
  )
}
```

La `dangerouslySetInnerHTML` en un componente cliente con prop de servidor es válida:
el mismo string se renderiza en servidor y cliente → no hay mismatch de hidratación.

## Lesson

Cuando un componente contiene lógica interactiva y es invocado desde el pipeline de
un paquete npm externo (ej. Payload Lexical converters), es más seguro usar el patrón
"Server wrapper → Client shell" en lugar de mezclar async server + client en el mismo
componente. El bundler puede perder el trace del límite `'use client'` cuando la cadena
de importación pasa por código npm.
