# 2026-06-22 — Frontend (Design) — TOD-33: Ajustar shell visual de CodeBlock para markup de Shiki

## Qué hice

Revisé la integración visual del `CodeBlock` post-TOD-32 (Shiki server-side) y apliqué ajustes
al CSS sin tocar el schema ni el tema de resaltado.

## Archivos modificados

- **`app/globals.css`** — cuatro ajustes en la capa `.ab-code-*`
- **`components/blocks/CodeBlock.tsx`** — `tabIndex={0}` en `<pre>`

## Cambios concretos

### 1. `--ring-dark` (nuevo token)
```css
--ring-dark: 0 0 0 2px rgba(255, 255, 255, .28);
```
El anillo global `--ring` usa `rgba(37,99,235,.16)` — azul al 16% de opacidad.
Sobre el fondo oscuro `--code-bg: #0f172a` (slate-900) ese anillo es invisible en la práctica.
El nuevo token `--ring-dark` usa blanco al 28% de opacidad, visible sobre superficies oscuras.
Se usa solo en `.ab-code-copy:focus-visible`.

### 2. `transition` en `.ab-code-copy`
El botón copiar no tenía `transition`. Sin ella, el cambio de color en hover es abrupto.
Añadido: `transition: background .15s, color .15s`.

### 3. Regla `:focus-visible` para `.ab-code-copy`
```css
.ab-code-copy:focus-visible { outline: none; box-shadow: var(--ring-dark); border-color: rgba(255,255,255,.25); }
```
La regla global `:focus-visible` habría aplicado `--ring` (azul invisible). La nueva regla
local la sobrescribe con `--ring-dark` y refuerza el borde del botón.
La opacidad del `border-color` no tiene token porque es un detalle sub-px del propio botón; 
el valor coincide con la escala rgba que ya usan los estados del botón.

### 4. `overflow-x: auto` en `.ab-code pre`
`overflow: auto` crea contexto de scroll en **ambos ejes**. El eje vertical no tiene sentido
para un bloque de código: la altura crece con el contenido. `overflow-x: auto` es más preciso:
scroll horizontal si el código es más ancho que el contenedor, sin scroll vertical.

### 5. `display: block` y `tab-size: 2` en `.ab-code code`
- `display: block`: hace del `<code>` un bloque completo dentro del `<pre>`. Sin esto, algunos
  navegadores calculan mal el overflow horizontal del contenido Shiki (spans inline dentro de
  un `<code>` inline). Con `display: block`, el cálculo es determinístico.
- `tab-size: 2`: estandariza el ancho de los tabuladores en el código renderizado (Shiki puede
  preservar tabs literales).

### 6. `tabIndex={0}` en `<pre>` (CodeBlock.tsx)
Un bloque de código largo y scrollable que no es focusable por teclado es inaccesible.
Con `tabIndex={0}` el elemento entra en el orden de tabulación natural y el usuario puede
focusarlo con Tab y luego scrollarlo con las flechas del teclado.

## Por qué no se tocó el tema de Shiki

El scope de TOD-33 excluye explícitamente reabrir el debate de tema. Shiki usa `github-dark`
(ADR 0008). Los tokens de diseño `.tk-*` del handoff son alternativos que el diseño original
prototipó antes de decidir usar Shiki. No se introdujeron porque el contrato arquitectónico
ya resuelve la paleta vía Shiki inline styles.

## Verificación

- `npx tsc --noEmit` pasa limpio.
- Todos los cambios usan variables de token (`var(--ring-dark)`, `var(--on-accent)`, etc.)
  o el patrón `rgba(255,255,255,...)` que ya existía en `.ab-code-copy`.
- Sin hardcodes nuevos fuera de la capa de tokens.
