# TOD-19 — Design tokens: globals.css + Tailwind @theme + next/font

## Qué se hizo

Fusionados los tokens de diseño de `design/globals.css` en `app/globals.css`, con mapeo `@theme`
para Tailwind v4 y fuentes via `next/font`.

### Archivos modificados / creados

| Archivo | Cambio |
|---|---|
| `app/globals.css` | Token layer completo + `@theme` + base reset |
| `app/fonts.ts` | **Nuevo** — Inter y JetBrains Mono via `next/font/google` |
| `app/(frontend)/layout.tsx` | Aplica variables CSS de fuentes en `<html>` |

## decisiónes técnicas

### Estructura del @theme

Tailwind v4 usa `@theme` para registrar tokens como utilidades. El bloque define:
- `--color-*` → genera `bg-*`, `text-*`, `border-*`
- `--font-sans` / `--font-mono` → genera `font-sans`, `font-mono`
- `--radius-*` → genera `rounded-*`

Los colores en `@theme` referencian las vars cortas con `var(--bg)` etc. Esto funciona porque
CSS resuelve `var()` en runtime, y el bloque `:root` sin layer tiene mayor precedencia que
`@layer theme` (donde va la salida de `@theme`).

### Cascada font-sans / next/font

El truco clave para integrar `next/font` sin romper el `@theme`:

1. `@theme { --font-sans: system-ui, ... }` → fallback estático en `@layer theme` (baja precedencia)
2. `:root { --font-sans: var(--font-inter, system-ui, ...) }` → unlayered, gana en la cascada
3. `next/font` inyecta `--font-inter` en `<html>` via `className={inter.variable}`

Resultado: `font-family: var(--font-sans)` en body → resuelve a Inter con fallback correcto.
Sin esta estructura, habría circular reference si `@theme` referenciara `var(--font-sans)`.

### Google Fonts eliminado

El `@import url('https://fonts.googleapis.com')` de `design/globals.css` NO se incluyó en la
versión de producción. Se reemplaza completamente por `next/font` (self-hosted, sin round-trip
externo, con size-adjust y font-display automáticos).

### Peso 450 de Inter

`next/font/google` no acepta el peso 450 (no es un peso estándar de la API de Google Fonts).
Se omite; el diseño usa 450 solo en contados sitios, y 400/500 cubren los casos reales.

## Invariante de uso

- **Componentes nunca hardcodean valores**: siempre `var(--blue)`, `bg-ink`, `font-mono`, etc.
- **next/font** solo en Server Components (layout); nunca `'use client'`.
- Agregar tokens nuevos: primero en `:root`, luego mapearlo en `@theme`.
