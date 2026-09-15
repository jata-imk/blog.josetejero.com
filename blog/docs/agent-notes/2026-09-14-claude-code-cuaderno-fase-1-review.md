# Cuaderno del Ingeniero — Fase 1: revisión, fixes y documentación

- Fecha: 2026-09-14
- Agente: Claude Code
- Rama: `fix/cuaderno-lint-bootstrap` (sobre lo mergeado en PR #6 `design/cuaderno-creativo`)
- ADR: `docs/adr/0036-cuaderno-del-ingeniero-lienzo-personalizable.md`
- Notion: "Rediseño Frontend: Cuaderno del Ingeniero (Doodles, UI Táctil y Texturas)"

## Contexto

El PR #6 (Fase 1: lienzo de papel, pauta y panel de personalización) se hizo rápido desde otra PC
y se mergeó sin checks: el workflow solo corría en `push` a `main`. En `main` el job `lint` falló
(`no-empty` en dos `catch {}`), así que **no se desplegó**. Tampoco se dejó ADR ni nota. Este
trabajo corrige eso y lo que salió en code review.

## Qué se hizo y por qué

### 1. CI roto
- Los `catch {}` vacíos ahora explican por qué se ignora el error (storage bloqueado en modo privado
  o sin cuota). ESLint pide eso a propósito: un `catch` vacío suele esconder bugs.
- `deploy.yml` ahora también corre en `pull_request` → **solo `lint` + `tsc --noEmit`**. Así un PR
  muestra ✅/❌ antes del merge. Build, deploy y warm-up quedan limitados a `push` (ver runbook
  `docs/runbooks/ci-cd.md`, sección Disparadores).

### 2. Bug que el CI no veía: el bootstrap no parseaba
`CUADERNO_BOOTSTRAP_SCRIPT` es JS dentro de un *template string*. ESLint y TypeScript lo ven como
texto, así que no detectan errores de sintaxis ahí dentro. Faltaba cerrar un `else` → el navegador
lanzaba `SyntaxError` y el script entero no corría. El sitio "funcionaba" porque el componente del
panel aplicaba los ajustes al hidratar (con parpadeo) y tenía su propio listener de scroll.

Concepto útil: los scripts inline en `<head>` corren **antes** de que React exista. Sirven para
evitar FOUC (flash of unstyled content), pero no pasan por el compilador. Tras editar uno, valida
la sintaxis (p. ej. `new Function(script)` en Node).

### 3. Rendimiento del scroll
La pauta es `position: fixed` (para que el degradado quede centrado en la pantalla) pero debe
parecer impresa en el papel, así que se desplaza con `background-position: 0 -scrollY`.

- Antes: `--scroll-y` se escribía en `<html>` en cada evento de scroll, desde dos listeners. Cambiar
  una variable CSS en la raíz obliga al navegador a recalcular estilos de **todo** el documento.
- Ahora: un solo listener (bootstrap), limitado a un update por frame con `requestAnimationFrame`,
  y la variable se escribe en `.paper-canvas-grid`. Solo esa capa se recalcula.

### 4. Panel "Taller del Cuaderno"
- `<dialog>` nativo + `showModal()` en lugar de `div` + portal: el navegador da gratis foco atrapado,
  fondo inerte (no se puede tabular detrás), `Esc` y capa superior (*top layer*, por encima de
  cualquier `z-index`). El foco vuelve al engrane al cerrar y el scroll del body se bloquea.
- Accesibilidad: `<fieldset>/<legend>` agrupan opciones (antes eran `<label>` huérfanos),
  `aria-pressed` marca la opción activa, el toggle es `role="switch"` con `aria-checked`.
- ~450 líneas de estilos inline → clases `.nb-*` en `globals.css` usando tokens (`--blue`,
  `--overlay`, `--sp-*`, `--r-*`…). Los swatches ya no llevan hex fijos.
- `btn-primary` no existía en el CSS (el botón "Listo" salía sin estilo) → `btn btn-grad`.
- Porcentajes de intensidad en modo oscuro calculados con `DARK_TEXTURE_FACTOR` en vez de texto
  fijo (uno decía 23 % cuando era 24 %).

### 5. CSS
- Eliminados los `--paper-grid` iniciales en `:root` y en el tema oscuro: los pisaba el bloque del
  sistema de pautas (código muerto).
- Default de tinta en CSS alineado con JS (`blue`); antes CSS asumía `neutral`.
- `--chalk-*` se conservan con comentario: son para los doodles de la Fase 2.
- Quitada la regla vacía `.theme-toggle`.

### 6. Hero en móvil
"👈 ¡empieza por aquí!" quedaba debajo de los botones apuntando a la nada → se oculta bajo 640 px y
es `aria-hidden` (adorno). Las anotaciones pasaron de estilos inline a `.hero-sketch*`; el eyebrow
envuelve centrado.

## No se tocó

- El reformateo de Prettier que coló el PR #6 en `globals.css` (comillas, `grid-template-columns`
  del visor). Ya está en `main`; revertirlo solo añade ruido.

## Verificación

- `pnpm lint` y `pnpm exec tsc --noEmit`: correctos.
- Bootstrap parseado con `new Function(...)`.
- Dev server + Playwright: atributos `data-*` aplicados, `--scroll-y` en la capa y la pauta se
  desplaza; panel abre, cambia pauta/tinta/textura, `Esc` cierra y devuelve foco; hero a 390×844.
