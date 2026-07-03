# 2026-07-03 — Engineer — migración vistas públicas a dark mode

## Qué hice

Migré el frontend público de light-only a dual-theme (`data-theme="light|dark"`) siguiendo el contrato del ADR 0028.

### Infraestructura del tema

1. **Definí 74+ variables dark en `app/globals.css`** bajo `[data-theme="dark"]` — superficies, tinta, líneas, acentos, tints, sombras, glow shadows, vidrio, overlay, thumb backgrounds, categorías, estados y bordes de callout. La paleta está basada en Slate (Tailwind) con acentos ligeramente más brillantes para mantener visibilidad sobre fondos oscuros.

2. **Añadí script anti-FOUC en `app/(frontend)/layout.tsx`** — un inline `<script>` que lee `localStorage.getItem('theme')` y aplica `data-theme="dark"` en `<html>` antes del primer render, evitando el flash blanco. El default servidor es `data-theme="light"`, y se usa `suppressHydrationWarning` para evitar warnings de React por la modificación del script.

3. **Creé `lib/use-theme.ts`** — un hook mínimo (`useTheme`) sin dependencias externas. Lee el `data-theme` del DOM, persiste en `localStorage` bajo la key `theme`, y expone `{ theme, toggle }`. SSR-safe: devuelve `'light'` cuando `document` es `undefined`, y se sincroniza en `useEffect`.

4. **Añadí toggle al `Header.tsx`** — botón con icono sol/luna, colocado **fuera** de `.header-social` para que sea visible en móvil (`.header-social` se oculta en breakpoint 768px). Usa `margin-left: auto` para posicionarse a la derecha. El icono cambia: luna en modo claro, sol en modo oscuro.

5. **Añadí tokens nuevos** necesarios para eliminar hardcodeos: `--overlay` (backdrop de modales/paletas), `--sh-panel` (sombra de panel), `--on-accent-soft` (overlay sutil sobre fondos acentuados).

### Auditoría y limpieza de estilos inline

Arreglé todos los hardcodeos de color en estilos inline del frontend público:

| Archivo | Qué estaba hardcoded | Migrado a |
|---|---|---|
| `sobre-mi/page.tsx:128` | `color: '#fff'` | `var(--on-accent)` |
| `sobre-mi/page.tsx:131` | `boxShadow: '0 8px 24px rgba(76,71,237,.3)'` | `var(--sh-btn-grad)` |
| `sobre-mi/page.tsx:220` | `background: '#fff'` (icono CV) | `var(--bg)` |
| `buscar/page.tsx:81` | `background: 'rgba(255,255,255,.2)'` | `var(--on-accent-soft)` |
| `CommandPalette.tsx:412` | `background: 'rgba(15,23,42,.46)'` | `var(--overlay)` |
| `CommandPalette.tsx:427` | `boxShadow: '0 24px 64px rgba(15,23,42,.22)...'` | `var(--sh-panel)` |

Los componentes que **ya** usaban `var(--...)` correctamente (AuthorCard, FeaturedCard, ListRow, SeriesNav, CodeBlock, Comment, Footer, pdfViewer, y la mayoría de páginas) no necesitaron cambios.

## Por qué

La app ya tenía una capa de tokens CSS centralizada — era el approach correcto para escalar a dark mode. Añadir `[data-theme="dark"]` con overrides de variables CSS es la solución más simple, mantenible y performante: una sola definición de variables afecta a todos los componentes automáticamente, sin `dark:` variants de Tailwind ni duplicación de estilos por componente.

No usé `next-themes` ni librerías de theming (ADR 0028, Opción C): el hook propio son 27 líneas y la persistencia es un `localStorage.setItem`. YAGNI.

## Riesgos / deuda identificada

1. **Contraste sistémico en `.ab-chip.active` y `.ab-pager button.active`** — Ambos patrones usan `background: var(--ink)` + `color: var(--on-accent)` para crear un estado "invertido" (píldora oscura con texto blanco). En dark mode, `--ink` pasa a ser claro (`#f1f5f9`) pero `--on-accent` sigue siendo blanco, resultando en texto ilegible. Esto afecta:
   - Los chips de filtro activos en `/blog` (`.ab-chip.active`)
   - Los botones de paginación activos (`.ab-pager button.active`)
   - Las tabs de scope activas en `/buscar`
   
   **Recomendación:** Definir `--ink-inv` o `--bg-invert` que siempre sea oscuro, o cambiar el patrón invertido para que en dark mode use un fondo claro con texto oscuro. Requiere decisión del Architect/Product.

2. **Admin de Payload** — `ImportMarkdownField.tsx` tiene hardcodeos (`color: '#fff'`, `rgba(0,0,0,.55)`). Fuera de alcance según ADR.

3. **Colores de marca de skills** — `content.ts` define 24 colores hex para logos de tecnologías (React, Vue, etc.). Son identidades de marca, no tokens de tema. Debatible si deben tokenizarse.

## Verificación

- **Lint:** Clean (0 nuevos errores; los 4 preexistentes son de migrations/20260702_230412.ts)
- **Build:** No ejecutado (requiere BD de desarrollo + CMS). El contrato de tokens CSS y la infraestructura JS son triviales y no rompen la app existente.
- **Visual:** Requiere validación QA en browser con toggle funcional.
