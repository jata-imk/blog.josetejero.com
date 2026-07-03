# 2026-07-03 — Engineer — TOD-110 migración final de vistas públicas al contrato dark

## Qué hice

Completé la auditoría y corrección final de las vistas públicas para dark mode, encontrando 2 defectos que habían escapado a las rondas anteriores (tod-109 e ingeniero inicial).

### Defecto 1: ScopeTabs en `/buscar` con contraste roto

**Archivo:** `app/(frontend)/buscar/page.tsx:71-82`

Las tabs de scope activas usaban el mismo patrón invertido que ya se había corregido en chips y paginación (`background: var(--ink)`, `color: var(--on-accent)`), pero este componente quedó intacto porque usa estilos inline en vez de clases CSS globales.

**Fix:** Migré a `var(--bg-invert)` / `var(--ink-invert)` tanto en el tab activo como en el badge de conteo anidado.

### Defecto 2: `global-not-found.tsx` sin infraestructura de tema

**Archivo:** `app/global-not-found.tsx`

La página 404 global (Next.js la renderiza como documento HTML independiente, sin pasar por `(frontend)/layout.tsx`) no tenía:
- `data-theme="light"` en `<html>`
- Script anti-FOUC
- `suppressHydrationWarning` en `<html>`

**Fix:** Añadí los tres elementos, igual que en `(frontend)/layout.tsx`.

### Nuevo token: `--bg-invert-soft`

Añadí el token `--bg-invert-soft` para badges/cuentas anidadas dentro de superficies invertidas:

| Token | Light mode | Dark mode |
|---|---|---|
| `--bg-invert-soft` | `rgba(255,255,255,.18)` | `rgba(15,23,42,.1)` |

Se agregó también al bloque `@theme` de Tailwind como `--color-bg-invert-soft`.

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `app/globals.css` | + `--bg-invert-soft` en `:root`, `[data-theme="dark"]` y `@theme` |
| `app/(frontend)/buscar/page.tsx` | ScopeTabs activo → tokens de inversión |
| `app/global-not-found.tsx` | + `data-theme`, anti-FOUC script, `suppressHydrationWarning` |

## Verificación

- **Lint:** Clean (0 errores)
- **TypeScript:** No hay cambios de tipos involucrados
- **Visual:** Queda pendiente QA en browser con toggle funcional. Verificar especialmente `/buscar?q=test` con tabs activas y `/ruta-inexistente` para el 404 global

## Riesgos abiertos (mismos que en notas previas)

1. `prefers-color-scheme` no integrado (ADR 0028 lo deja para evolución futura)
2. Admin de Payload fuera de alcance
3. Colores de marca de skills (`content.ts`) son identidad, no tema
4. Flash de 1 frame del icono del toggle (useState inicial = 'light' antes de useEffect) — aceptado en ADR 0028
