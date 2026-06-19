# TOD-39 — Ruta canónica `/blog/[slug]` y cierre de la validación end-to-end

**Agente:** Frontend (Diseño) · 2026-06-19

## Qué se creó

`app/(frontend)/blog/[slug]/page.tsx` — Server Component que renderiza un post real de Payload.

```
getPostBySlug(slug)       ← lib/data/posts.ts  (llama a payload.find)
    ↓
RichText + bodyConverters ← lib/lexical/converters.tsx
    ↓                        (incluye callout: → <Callout>, Code: → <CodeBlock>)
<div class="ab-prose">
    └─ párrafos, headings, listas, citas (vía defaultConverters)
    └─ <Callout kind="note|tip|warning|danger"> (bloque custom)
    └─ <CodeBlock lang="..." code="..."> (Shiki asíncrono)
```

## Por qué esta ruta cierra la validación end-to-end

Hasta ahora no existía ninguna superficie pública que:
1. leyera un `body` almacenado en Payload (Lexical JSON serializado), y
2. lo pasara por el renderer real con `Callout` y `CodeBlock` incluidos.

Los tests de storybook o mocks no cubren la cadena completa porque el dato viene de un seed/fixture,
no del CMS. Con esta ruta, QA puede:

1. Crear un post en `/admin` con un bloque `Callout` (variante `warning`, por ejemplo).
2. Publicarlo.
3. Navegar a `/blog/[slug]` y verificar que el bloque se renderiza con la variante visual correcta.

Eso cierra el ciclo **admin → dato persistido → render público**.

## Decisiones de diseño tomadas en esta página

- **Server Component por defecto** — cumple ADR 0006 regla 1. No hay interactividad en la página
  de detalle que justifique `'use client'`.
- **`getPostBySlug` como única puerta de datos** — cumple ADR 0006 regla 2. La página no llama
  a `payload.find` directamente.
- **`notFound()` ante post inexistente** — devuelve 404 semántico de Next.js en lugar de una
  página en blanco o lanzar un error.
- **`generateMetadata`** — hidrata `<title>` y `<meta name="description">` con datos reales del
  post sin JavaScript extra en cliente.
- **`ab-prose` para el body** — clase del sistema de diseño definida en `globals.css`; no se
  hardcodea tipografía ni colores dentro del componente.
- **`params` como `Promise<{slug: string}>`** — firma correcta para Next.js 15 App Router con
  `async` page components; evitar el deprecation warning de `params` síncronos.

## Restricciones respetadas

| ADR | Punto aplicado |
|-----|----------------|
| 0006 | `app/(frontend)/blog/[slug]/page.tsx`; datos solo via `lib/data` |
| 0008 | El renderer de Callout vive en `lib/lexical/converters` y usa `<Callout kind=…>` |
| 0009 | Ruta canónica `/blog/[slug]` (no temporal, no ad hoc para QA) |
