# Tarea 03 — Design tokens → `app/globals.css` + Tailwind

**Asignar a:** Frontend · **Depende de:** 01 · **Tipo:** fundación visual (la de más impacto)
**Paralela a:** 03b (arquitectura). Ambas son fundación; bloquean 04-06.

## Prompt para el issue
> Implementa el **token layer** del design system en la app. La fuente de tokens está en
> `blog/design/globals.css` (derivada del handoff). Llévala a `blog/app/globals.css` y cáblala con
> **Tailwind v4** vía `@theme` (mapea `--bg`, `--ink`, `--blue`, `--violet`, `--font-sans`,
> `--font-mono`, radios `--r*`, sombras `--sh*`, etc.) para que existan como utilidades de Tailwind
> además de variables CSS.
>
> **Fusión segura (NO rompas el admin de Payload):**
> - `blog/app/globals.css` **ya existe** y hoy solo contiene `@import 'tailwindcss';`. Está
>   importado **únicamente** desde `app/(frontend)/layout.tsx`. Esa separación por route-group es lo
>   que arregló el render del admin (ver ADR 0004 y la agent-note `fix-admin-render`).
> - **Fusiona** los tokens dentro de ese archivo; **no** crees uno nuevo y **no** añadas ningún
>   `import './globals.css'` al root `app/layout.tsx` (eso volvería a romper el admin).
> - En CSS todos los `@import` van al inicio: deja `@import 'tailwindcss';` arriba y a partir de ahí
>   `:root { … tokens … }`, el mapeo `[data-cat]`, los estilos base y el bloque `@theme`.
>
> **Fuentes (buena práctica):**
> - Usa **`next/font/google`** para **Inter** + **JetBrains Mono** (self-hosted por Next, sin layout
>   shift), exponiéndolas como CSS variables y cableándolas a `--font-sans` / `--font-mono`. Esto
>   **sustituye** la línea `@import url('https://fonts.googleapis.com/...')` del `design/globals.css`
>   (no uses el CDN). Conserva `font-feature-settings` de Inter y los pesos usados (400–800).
>
> **Requisitos restantes:**
> - Mantén el mapeo `categoría → color` (`[data-cat="…"]`) tal cual.
> - **Cero hardcodeo** a partir de aquí: todo color/espaciado/tipografía sale del token.
> - Verifica contraste/escala contra `blog/design/tokens.md` (fuente legible) y el prototipo en
>   `blog/design/handoff/`.
> - Branding: aplica `blog/design/branding.md` (marca "José Tejero", no "Aleliz Blog").
>
> No construyas componentes todavía (eso es 04-06); aquí solo queda la base de tokens lista y usable.

## Done cuando
- `blog/app/globals.css` tiene los tokens + `@theme` de Tailwind v4, con `@import 'tailwindcss';`
  intacto y **sin** tocar el root layout (admin sigue renderizando bien).
- Inter + JetBrains Mono cargadas vía `next/font` y cableadas a `--font-sans` / `--font-mono`.
- Una página de prueba mínima usa un par de tokens (`bg` + `ink` + un acento) y se ve correcto.
- agent-note en `blog/docs/agent-notes/` explicando cómo se conectan variables CSS + `@theme` de
  Tailwind v4 y cómo `next/font` alimenta las variables de fuente (pieza didáctica para el board).
- QA verifica build + que no haya colores hardcodeados + que `/admin` siga OK.
