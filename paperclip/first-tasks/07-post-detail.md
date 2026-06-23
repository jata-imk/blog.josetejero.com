# Tarea 07 — Serializador Lexical → React + página de post (keystone)

**Asignar a:** Frontend · **Depende de:** 04 (Callout), 05 (CodeBlock), 06 (datos) · **Tipo:** render + ruta

> Pieza clave de la Fase 2: convierte el cuerpo Lexical de un post en React y arma la pantalla de
> **post individual**. Reutiliza los shells ya construidos (`Prose`, `CodeBlock`, `Callout`,
> `TableOfContents`, `AuthorCard`, `Breadcrumb`, `PrevNext`); **no los re-maquetes**.

## Prompt para el issue
> **1. Serializador Lexical → React** en `blog/lib/lexical/` (hoy vacío). Convierte los nodos del
> cuerpo del post: headings, párrafos, listas, links, `strong`/`em`, imágenes (colección `Media`,
> SVG como `<img>`), bloques de **código** (vía `<CodeBlock>`, tarea 05) y el bloque **`Callout`**
> (tarea 04). Salida fiel al `.ab-prose` del handoff, con tokens. Es **render, no dato**.
> **2. Página de post** en `app/(frontend)/posts/[slug]/page.tsx`: obtiene el post con
> `getPostBySlug` (`lib/data`, nunca `payload.find` directo), `generateStaticParams` opcional,
> y compone: `Breadcrumb`, título/meta, `<TableOfContents>`, cuerpo serializado, `<AuthorCard>`,
> `<PrevNext>` y `SeriesNav` cuando el post pertenece a una serie (**la posición se deriva** de
> `getSeriesWithPosts`, no se almacena). `notFound()` si no existe.
> Pieza didáctica: la agent-note debe explicar el **patrón de serialización Lexical→React** y qué se
> resuelve en Server vs Client Component (José aprende de esa nota).

## Done cuando
- Un post sembrado renderiza completo y fiel (texto, código resaltado, callouts, imágenes, TOC).
- La navegación de serie aparece solo en posts de serie y deriva el orden de `seriesOrder`.
- Datos solo vía `lib/data`; cero hardcodeo; `pnpm lint` pasa.
- agent-note clara sobre el render de Lexical. QA: gate visual (desktop + móvil) contra el handoff.
