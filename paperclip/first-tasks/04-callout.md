# Tarea 04 — Bloque `Callout` + renderer

**Asignar a:** Engineer (define el bloque) + Frontend (renderer) · **Depende de:** 02, 03 (tokens), 03c

> **Estado actual (re-scope):** el Frontend ya adelantó el **shell visual** en
> `blog/components/blocks/Callout.tsx` y los estilos `.ab-callout-*`. **No lo reescribas**, reúsalo.
> Pendiente real: (a) Engineer define el bloque Lexical en Payload; (b) el renderer soporta las
> **4 variantes del ADR 0003 — `note|tip|warning|danger`** (hoy solo hay `note|tip|warn`: falta
> `danger` y `warn` debe renombrarse a `warning`); (c) cablear el renderer al nodo real de Lexical.

## Prompt para el issue
> Implementa el **único bloque custom** de Lexical: `Callout` (ver ADR 0003).
> - Engineer: define el bloque en la config de Lexical/Payload con campos `variant`
>   (`note|tip|warning|danger`), `title` (texto) y `content` (richText anidado). Que aparezca como
>   opción en el editor del admin.
> - Frontend: implementa el renderer React `<Callout>` usando **design tokens** (cero hardcodeo). Las
>   4 variantes deben verse según el diseño del handoff. Compara contra la imagen de referencia.

## Done cuando
- Se puede insertar un Callout en un post desde el admin, con sus 4 variantes.
- El renderer muestra las 4 variantes fieles al diseño, usando tokens.
- agent-note (Frontend) sobre cómo se renderiza un nodo custom de Lexical a React.
- QA: gate visual de las 4 variantes (desktop + móvil).
