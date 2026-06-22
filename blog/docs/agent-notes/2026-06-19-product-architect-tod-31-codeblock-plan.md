# 2026-06-19 — Product Architect — plan y ADR para TOD-31

## Que hice

Convirti `TOD-31` en un contrato de implementacion claro sin escribir el codigo:

- escribi el ADR `0007-render-de-codeblock-con-shiki.md`
- escribi el ADR `0008-render-de-codeblock-con-shiki.md`
- aclare en `docs/architecture/overview.md` que `CodeBlock` se parte entre render de servidor e
  interaccion minima de cliente
- prepare la descomposicion para Engineer, Frontend y QA en la issue

## Por que esta pieza se parte en dos

Este caso es didactico porque toca una de las ideas centrales de Next.js App Router:
**Server Components por defecto; Client Components solo donde haya interaccion real**.

Un bloque de codigo tiene dos necesidades distintas:

1. **Resaltar el codigo**.
   Eso es transformacion pura de datos: recibes `code` y `lang`, generas HTML resaltado y lo metes
   en el render. No hace falta estado local ni eventos del navegador. Por eso esta parte pertenece al
   servidor.

2. **Copiar al portapapeles**.
   Eso si necesita navegador porque usa `navigator.clipboard` y estados visuales como `Copiado`.
   Por eso debe vivir en un Client Component muy pequeno.

Si todo el `CodeBlock` se deja como cliente, el navegador recibe JavaScript de mas para una pieza
que casi siempre podria llegar ya resuelta desde el servidor. En un blog, donde la mayor parte de la
UI es contenido estatico, ese exceso va contra la arquitectura del proyecto.

## Contrato que debe respetar la implementacion

- El contenido guardado sigue siendo solo el nodo de codigo de Lexical.
- El string plano `code` es la fuente de verdad; no se derivan dos representaciones independientes.
- El shell visual existente (`.ab-code-*`) se reutiliza.
- Los tokens `--code-*` siguen controlando fondo, borde y tipografia mono.
- Si Shiki no puede resaltar un lenguaje, el componente debe caer a codigo plano sin romper el post.

## Por que no abrimos mas debates

No se reabre si el codigo deberia ser un bloque custom, si deberiamos guardar HTML resaltado en la
base, o si hace falta soportar mas features del bloque de codigo. Las decisiones cerradas del
proyecto ya marcan el limite:

- Lexical built-in para el codigo
- render, no dato
- YAGNI para extras como line numbers o highlight por linea
