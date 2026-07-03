# 2026-07-03 — Frontend — infraestructura de tema oscuro (TOD-109)

## Qué hice

Revisé y completé la infraestructura de tema oscuro en el frontend público. La implementación base ya existía (trabajo previo del Engineer), pero detecté y corregí dos defectos que impedían considerarla terminada.

### Lo que ya estaba implementado (Engineer)

1. **Capa de tokens dual** en `app/globals.css` — `:root` (tema claro, líneas 51-173) + `[data-theme="dark"]` (tema oscuro, líneas 175-264), con 70+ variables de color/espaciado/tipografía redefinidas para dark.

2. **Script anti-FOUC** en `app/(frontend)/layout.tsx:16-20` — inline `<script>` que lee `localStorage('theme')` y setea `data-theme="dark"` antes del primer render, evitando flash blanco.

3. **Hook `useTheme`** en `lib/use-theme.ts` (27 líneas) — sin dependencias externas. Lee el `data-theme` del DOM, persiste en `localStorage`, expone `{ theme, toggle }`. SSR-safe.

4. **Toggle en Header** en `components/layout/Header.tsx:67-74` — botón icon-btn con sol/luna, colocado fuera de `.header-social` para visibilidad en móvil.

### Lo que corregí (defectos que impedían dar por terminado)

#### Defecto 1: Hardcodeo `#fff` en timeline de Sobre mí

**Archivo:** `app/(frontend)/sobre-mi/page.tsx:37`  
**Antes:** `background: active ? 'var(--grad)' : '#fff'`  
**Después:** `background: active ? 'var(--grad)' : 'var(--bg)'`

El dot inactivo de la línea de tiempo usaba `#fff` fijo. En dark mode, un círculo blanco puro sobre fondo oscuro rompía el diseño. Con `var(--bg)` toma el color de superficie según el tema activo.

#### Defecto 2: Contraste roto en estados "invertidos" (chip.active, pager.active, step.done)

**Problema detectado por Engineer:** Los elementos con el patrón `background: var(--ink); color: var(--on-accent)` asumían que `--ink` es oscuro y `--on-accent` es blanco. En dark mode, `--ink` se vuelve `#f1f5f9` (claro) pero `--on-accent` sigue siendo `#ffffff`, resultando en texto invisible sobre fondo claro.

**Solución:** Creé dos tokens nuevos de inversión que siempre contrastan correctamente:

| Token | Light mode | Dark mode |
|---|---|---|
| `--bg-invert` | `#0f172a` (oscuro) | `#f1f5f9` (claro) |
| `--ink-invert` | `#ffffff` (blanco) | `#0f172a` (oscuro) |

**Clases corregidas en `globals.css`:**

- `.ab-chip.active` (línea ~931) — chips de filtro activos en /blog
- `.ab-pager button.active` (línea ~898) — paginación activa
- `.ab-step.done .ab-step-num` (línea ~882) — pasos completados de serie

**Tokens añadidos al `@theme` block** para acceso via Tailwind: `bg-bg-invert`, `text-ink-invert`.

## Por qué `--bg-invert` / `--ink-invert`

El sistema de temas por tokens asume que las variables CSS se redefinen en `[data-theme="dark"]` y los componentes responden automáticamente. Pero el patrón "invertido" (oscuro sobre claro → claro sobre oscuro) no puede resolverse solo con redefinir valores: necesita que el fondo siempre sea visiblemente distinto.

En light mode: chip activo = oscuro con texto blanco = destaca sobre fondo blanco.  
En dark mode: si el chip activo también fuera oscuro, se fundiría con el fondo del body.

Los tokens `--bg-invert` y `--ink-invert` permiten definir el contraste correcto en cada tema sin repetir reglas CSS.

## Verificación

- **Build:** Clean (Next.js 16.2.9, 0 errores TypeScript, 6 warnings preexistentes de NFT trace)
- **Lint:** Clean (0 errores)
- **Visual:** Pendiente QA en viewport real 1440x900 + 390x844 con toggle funcional.
  - Verificar especialmente: chips de filtro en /blog, paginación en /categorias, pasos completados en /series/[slug]
  - El tema oscuro es determinista: las variables CSS se redefinen bajo `[data-theme="dark"]` y todos los componentes usan tokens.
- **Config:** `data-theme="light"` default, `data-theme="dark"` via toggle + localStorage

### Mejoras añadidas en esta sesión (2026-07-03, segunda pasada)

- **`color-scheme`:** Añadido `color-scheme: light` a `:root` y `color-scheme: dark` a `[data-theme="dark"]` para que navegador renderice controles nativos (scrollbars, selects) en el tono correcto.
- **`useTheme`:** Corregido flicker inicial del icono del toggle usando `useLayoutEffect` en vez de `useEffect`, y estabilizada la referencia de `toggle` con actualización funcional `setTheme(prev => ...)` sin dependencias.
- **Documentación:** Actualizados `design/globals.css` y `design/tokens.md` para reflejar que el sistema ahora soporta light + dark.

## Riesgos abiertos

- **`prefers-color-scheme`:** No integrado por decisión del ADR 0028. Queda como evolución futura sobre el mismo contrato.
- **Admin de Payload:** Fuera de alcance. El admin usa su propio sistema visual.
- **Colores de marca de skills** (`content.ts`): Usan hex de identidad de marca (React, Vue, etc.), no tokens de tema. No es un defecto de dark mode pero merece revisión de contraste si se muestran sobre fondos oscuros.
- **Visual QA:** No ejecutada — se requiere servidor de desarrollo con PostgreSQL para renderizar las páginas a viewport real. Sin BD disponible en esta máquina, pero el build completo es limpio y los tokens son deterministas.
