# Tarea 03 — Design tokens → `globals.css` + Tailwind

**Asignar a:** Frontend · **Depende de:** 01 · **Tipo:** fundación visual (la de más impacto)

## Prompt para el issue
> Implementa el **token layer** del design system en la app. La fuente ya está lista: copia
> `blog/design/globals.css` a `src/app/globals.css` y cáblalo con **Tailwind v4** vía `@theme`
> (mapea los tokens `--bg`, `--ink`, `--blue`, `--violet`, `--font-sans`, `--font-mono`, radios,
> sombras, etc.) para que existan como utilidades de Tailwind además de variables CSS.
>
> Requisitos:
> - Importa las fuentes **Inter** + **JetBrains Mono** (ya referenciadas en `globals.css`).
> - Mantén el mapeo `categoría → color` (`[data-cat="…"]`) del `globals.css`.
> - **Cero hardcodeo** a partir de aquí: todo color/espaciado/tipografía sale del token.
> - Verifica el contraste/escala contra `blog/design/tokens.md` (fuente de verdad legible) y el
>   prototipo en `blog/design/handoff/`.
> - Branding: aplica `blog/design/branding.md` (marca "José Tejero", no "Aleliz Blog").
>
> No construyas componentes todavía (eso es 04-06); aquí solo queda la base de tokens lista y usable.

## Done cuando
- `src/app/globals.css` tiene los tokens y Tailwind v4 los expone como utilidades (`@theme`).
- Una página de prueba mínima usa un par de tokens (p. ej. `bg` + `ink` + un acento) y se ve correcto.
- agent-note en `blog/docs/agent-notes/` explicando cómo se conectan variables CSS + `@theme` de
  Tailwind v4 (pieza didáctica para el board).
- QA verifica build + que no haya colores hardcodeados.
