# Tarea 03c — Correcciones de la capa de tokens y componentes

**Asignar a:** Frontend · **Depende de:** 03 (tokens), 03b (arquitectura) · **Tipo:** deuda / pulido

> Contexto: la 03 entregó los tokens correctamente, pero al adelantar los shells visuales de los
> componentes (home, primitives y blocks) reaparecieron hardcodes que rompen la regla "cero valores
> hardcodeados" de `blog/AGENTS.md`, y quedaron variantes muertas. Esta tarea **no añade features**:
> deja la base consistente antes de cablear Callout (04), CodeBlock/Shiki (05) y el render Lexical (06).

## Prompt para el issue
> Limpia la deuda introducida en los componentes sin cambiar el resultado visual:
>
> 1. **Hardcodes de color → tokens.** En `app/globals.css` (capa de componentes) y en componentes,
>    reemplaza los hex/rgba crudos por tokens existentes o nuevos en `:root`:
>    - `#fff` repetido → `var(--bg)` (o un token `--on-accent` si conviene semánticamente).
>    - Colores de estado de `.ab-status-*` (`#b45309`, `#d97706`, `#fdeaec`, `#be123c`, `#047857`,
>      `#bbe9d4`, `#f4ddb0`, `#c7dafd`…) → tokens nombrados (p. ej. `--amber-700`, `--green-700`,
>      `--rose-tint`, `--blue-border`). Si un valor no existe como token, **créalo en `:root`**, no
>      lo dejes suelto.
>    - Semáforos del `CodeBlock.tsx` (`#ff5f57`, `#febc2e`, `#28c840`) → tokens (`--mac-red`,
>      `--mac-amber`, `--mac-green`) o clases CSS; fuera del JSX.
>    - El tema oscuro del bloque de código (`#0f172a`, `#1e293b`, `#131c30`, `#94a3b8`, `#e2e8f0`,
>      `#cbd5e1`) es render legítimo, pero igual sácalo a tokens `--code-*` para centralizarlo.
> 2. **Estilos inline → clases/tokens.** Quita los `style={{ ... }}` con números mágicos de
>    `PostCard.tsx`, `Comment.tsx`, `CommentForm.tsx` y demás. Usa clases CSS existentes o utilidades
>    de Tailwind ligadas a tokens (`gap-*`, `flex`, etc.). El JSX no debe llevar medidas crudas.
> 3. **Variantes muertas.** `Btn.tsx` referencia `btn-ghost`, `btn-primary` y `btn-sm` que **no
>    existen** en `globals.css`. O defines esas clases (si el handoff las usa) o recortas las
>    variantes del componente para que su API no mienta.
> 4. **Acentos en docs.** El ADR 0006 y varias agent-notes se escribieron sin acentos. Corrígelos a
>    español correcto (no cambia decisiones, solo legibilidad para el board).

## Done cuando
- `grep -nE '#[0-9a-fA-F]{3,6}' blog/components blog/app/globals.css` no devuelve hex crudos fuera
  de la definición de tokens en `:root` (los `--code-*`/`--mac-*` viven ahí, no en clases ni JSX).
- No quedan `style={{ ... }}` con valores mágicos en `blog/components/**`.
- `Btn` solo expone variantes que existen en CSS.
- `pnpm lint` pasa y la home se ve **idéntica** (gate visual antes/después, desktop + móvil).
- agent-note breve: por qué centralizar en tokens y qué se movió.
