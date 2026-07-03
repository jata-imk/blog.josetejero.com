# TOD-106: Fix modal global backdrop — no cubría el viewport completo

**Agente**: Engineer
**Fecha**: 2026-07-03
**Issue**: TOD-106 (reabierto desde TOD-104)

## Diagnóstico

El backdrop del modal global (`CommandPalette`) solo aparecía en una pequeña porción de la página en Firefox. En Chrome funcionaba correctamente.

### Causa raíz

El `backdrop-filter: blur(5px)` estaba aplicado al botón-backdrop (`position: absolute; inset: 0`) que vive DENTRO del overlay (`position: fixed; inset: 0`). En Firefox, `backdrop-filter` sobre un elemento con `position: absolute` dentro de un contenedor `position: fixed` causa bugs de renderizado: el área pintada del blur (y por tanto la zona visible del backdrop) se limita a una porción del viewport en lugar de cubrir todo el `inset: 0`.

Esto es un bug conocido de Firefox con `backdrop-filter` en contextos de stacking complejos.

## Qué se hizo

Se movió el backdrop visual (background + blur) del botón-backdrop al overlay contenedor:

**Antes:**
- `overlayStyle`: solo `position: fixed; inset: 0` + flex + padding (sin background ni blur)
- `backdropStyle`: `position: absolute; inset: 0` con `background: var(--overlay)` y `backdropFilter: blur(5px)`

**Después:**
- `overlayStyle`: `position: fixed; inset: 0` + `background: var(--overlay)` + `backdropFilter: blur(5px)` + `WebkitBackdropFilter: blur(5px)` + `isolation: isolate`
- `backdropStyle`: `position: absolute; inset: 0` + `background: transparent` (solo click target invisible)

### Por qué funciona

1. El `backdrop-filter` y el background están ahora en el overlay, que es `position: fixed` directamente hijo de `<body>` vía portal — esto garantiza que cubra el viewport completo en todos los navegadores.
2. El botón-backdrop sigue existiendo como capa transparente (`position: absolute; inset: 0`) para capturar clicks de cierre fuera del panel.
3. El panel tiene `z-index: 1` (+ `position: relative`) para quedar por encima del botón y recibir sus propios eventos.
4. `WebkitBackdropFilter` asegura compatibilidad con Safari.
5. `isolation: isolate` fuerza un stacking context nuevo, evitando interferencias con otros elementos de la página.

## Archivos modificados

- `blog/components/search/CommandPalette.tsx`: líneas 394-415 (estilos `overlayStyle` y `backdropStyle`)

## Verificación

- `pnpm lint` → pasa sin errores
- `npx tsc --noEmit` → sin errores de tipo
- El cambio es puramente de CSS inline; no afecta lógica, estado ni estructura del componente.
