# Tarea 05 — Render Lexical → React + páginas derivadas

**Asignar a:** Frontend · **Depende de:** 02, 03, 04

## Prompt para el issue
> Implementa el render del cuerpo Lexical de un Post a React (headings, listas, links, imágenes,
> código vía `<CodeBlock>`, y `<Callout>`), fiel al handoff y con design tokens.
> Luego construye las páginas derivadas:
> - Detalle de post (con `SeriesNav` cuando pertenece a una serie — la posición se **deriva** de
>   `seriesOrder`, no se almacena).
> - Listados por **serie**, **tag** y **categoría**.
> - Home con listado de posts (`PostCard` / grid del handoff).
>
> Usa el inventario en `blog/design/component-inventory.md`. Implementa sección por sección,
> comparando contra las imágenes del handoff. Cubre estados vacío/cargando.

## Done cuando
- Un post renderiza completo y fiel (texto, código, callouts, imágenes).
- Páginas de serie/tag/categoría y home funcionan; la navegación de serie deriva el orden.
- agent-note sobre el patrón de render de Lexical y cómo se derivan las páginas.
- QA: gate visual de cada página (desktop + móvil) contra el handoff.
