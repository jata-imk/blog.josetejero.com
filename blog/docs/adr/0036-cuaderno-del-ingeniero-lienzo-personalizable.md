# 0036 — Cuaderno del Ingeniero: lienzo de papel personalizable por el visitante

- Estado: aceptada
- Fecha: 2026-09-14
- Decidido por: board (José) — documentado a posteriori por Claude Code tras el PR #6

## Contexto

El diseño original (handoff de Claude Design) es limpio pero plano y "corporativo". El board quiere
que el blog transmita calidez humana y personalidad: textura analógica, pauta de libreta y
anotaciones a mano, sin perder velocidad, legibilidad ni accesibilidad. Plan completo en Notion
("Rediseño Frontend: Cuaderno del Ingeniero"), dividido en 5 fases; este ADR cubre la **Fase 1:
el lienzo**.

Restricciones:

- Design tokens de `app/globals.css` siguen siendo la fuente de verdad visual (AGENTS.md).
- Cero imágenes nuevas que descargar ni dependencias: el fondo pinta en todas las páginas y no puede
  empeorar LCP.
- El sitio ya tiene tema claro/oscuro con script anti-FOUC (ADR 0028); lo nuevo debe convivir con él.
- El contenido debe seguir 100 % nítido encima del fondo.

Además, la pauta es "sobre el papel": el visitante la quiere personalizar (tipo de pauta, tinta,
textura, intensidad), y no hay usuarios con cuenta en el frontend.

## Opciones consideradas

- **Imágenes raster de papel (PNG/WebP)** — realistas / peso extra en cada página, no se adaptan al
  tema oscuro sin duplicarlas, y tintarlas exige otra imagen por color.
- **Canvas/WebGL generativo** — máximo control / JS en el hilo principal en cada página, complejidad
  desproporcionada.
- **CSS puro: gradientes para la pauta + SVG `feTurbulence` inline (data URI) para la textura, todo
  gobernado por `data-*` en `<html>`** — cero requests, se tinta con variables CSS, el tema oscuro es
  un override más / el SVG con filtros cuesta rasterizarlo (se hace una vez por tile) y la pauta con
  degradado centrado en el viewport necesita una pizca de JS para seguir el scroll.

Para las preferencias:

- **Persistir en BD (Payload)** — no hay sesiones de lector; exagerado.
- **Cookie + render en servidor** — rompe el caché ISR/estático de todas las páginas.
- **`localStorage` + script anti-FOUC en `<head>`** — mismo patrón ya probado con el tema (ADR 0028);
  la página sigue siendo estática.

## Decisión

1. **Capa de fondo `<PaperBackground />`** en el layout del frontend, `aria-hidden`, con
   `z-index: -1` y `pointer-events: none`:
   - `.paper-canvas-texture`: SVG `feTurbulence` (papel arrugado o grano) con
     `mix-blend-mode: multiply` (claro) / `screen` y opacidad × 0.42 (oscuro).
   - `.paper-canvas-grid`: `position: fixed` con máscara radial centrada en el viewport. Para que la
     pauta avance con el documento, el script de bootstrap escribe `--scroll-y` **en ese elemento**
     (no en `:root`, que invalidaría estilos de todo el árbol en cada frame), con throttle por
     `requestAnimationFrame`.
2. **Estado visual 100 % en atributos de `<html>`**: `data-grid` (`lines|dots|iso|none`),
   `data-grid-color` (`blue|neutral|violet|amber`), `data-grid-fade`, `data-paper-texture`
   (`wrinkled|grain|none`) y la variable `--paper-texture-opacity`. El CSS resuelve cada combinación;
   los defaults de CSS coinciden con `DEFAULT_CUADERNO_SETTINGS`, así que sin JS el look es el mismo.
3. **`CUADERNO_BOOTSTRAP_SCRIPT`** (`lib/cuaderno-bootstrap.ts`) en `<head>`, justo después del de
   tema: aplica lo guardado en `localStorage["cuaderno_settings"]` antes del primer paint.
4. **Panel "Taller del Cuaderno"** (`components/ui/CuadernoConfigModal.tsx`), botón engrane en la
   cabecera. `<dialog>` nativo con `showModal()` (foco atrapado, fondo inerte, `Esc`), grupos con
   `<fieldset>/<legend>`, opciones con `aria-pressed`, interruptor con `role="switch"`. Estilos en
   clases `.nb-*` sobre tokens.
5. **Tipografía de boceto**: `Caveat` vía `next/font` → token `--font-sketch` / clase `.font-sketch`,
   solo para anotaciones decorativas (nunca texto de lectura).
6. Tokens `--chalk-*` reservados para los doodles de la Fase 2.

## Consecuencias

- Más fácil: añadir pautas, tintas o texturas es un bloque CSS más y una opción en el panel; los
  doodles de fases siguientes heredan tintas y tokens.
- Coste: dos filtros SVG rasterizados por tile y un listener de scroll pasivo global. Si en
  artículos largos se nota en móviles modestos, la salida es `data-paper-texture="none"` por defecto
  en `pointer: coarse` o pre-renderizar la textura a WebP.
- Las preferencias son por navegador; no viajan entre dispositivos (aceptado).
- Tres fuentes deben mantenerse alineadas a mano: defaults en CSS, `DEFAULT_CUADERNO_SETTINGS` y el
  bootstrap. También el factor 0.42 del modo oscuro (CSS ↔ `DARK_TEXTURE_FACTOR`). Hay comentarios
  cruzados en cada sitio.
- Anotaciones con `Caveat` son decorativas (`aria-hidden` cuando solo son adorno) y se ocultan en
  móvil cuando su posición deja de tener sentido.
