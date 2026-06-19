# TOD-29 — Correcciones de la capa de tokens y componentes

**Agente:** CEO (Claude) — ejecución directa por fallo de adaptador codex_local (401 OpenAI)
**Fecha:** 2026-06-19

## Qué se hizo

### 1. Tokens nuevos en `:root`
Se añadieron grupos de tokens que faltaban para cubrir todos los usos del sistema visual:
- `--on-accent: #ffffff` — texto blanco sobre fondos oscuros o de color (avatares, badges, dots)
- Escala de categorías: `--cyan-700`, `--green-600`, `--amber-700`, `--slate-600`
- Escala de estados: `--amber-800`, `--green-700`, `--rose-tint`, `--rose-700`
- Bordes de callout: `--blue-border`, `--green-border`, `--amber-border`
- Bloque de código (tema oscuro): `--code-bg`, `--code-bar`, `--code-border`, `--code-text`
- Semáforos macOS: `--mac-red`, `--mac-amber`, `--mac-green`

### 2. Reemplazo de hex en la capa de componentes (globals.css)
Todos los valores hex crudos fuera del bloque `:root` fueron sustituidos por los tokens anteriores:
- `data-cat` mappings → `var(--blue)`, `var(--violet)`, `var(--cyan-700)`, etc.
- Status badges → `var(--amber-tint/800/700)`, `var(--green-tint/700/600)`, `var(--rose-tint/700/rose)`
- Code block → vars `--code-*`
- Callouts → `var(--on-accent)`, `var(--blue/green/amber-border)`, `var(--green-700)`, `var(--amber-800)`
- Steps, avatar, pager, author-av, skill chip → `var(--on-accent)`

### 3. CodeBlock.tsx
Los tres dots macOS pasaron de `style={{ background: '#ff5f57' }}` a `var(--mac-red/amber/green)`.
El `style={{ marginLeft: 'auto' }}` redundante se eliminó (ya está en `.ab-code-copy` de globals.css).

### 4. Comment.tsx
El indent de respuestas (`style={{ marginTop: 16, paddingLeft: 24, borderLeft: ... }}`) se movió
a la clase CSS `.ab-comment-replies` añadida en globals.css.

### 5. CommentForm.tsx
Inline styles con px mágicos convertidos a Tailwind: `flex flex-col gap-4`, `grid grid-cols-2 gap-3`,
`text-lg font-bold`, `text-rose text-sm`, `text-xs text-muted`, `self-start`.

### 6. Btn.tsx
Las variantes `ghost` y `primary` (sin CSS) y el tamaño `sm` (sin CSS, sin uso) se eliminaron.
La API del componente ahora solo expone lo que existe: `'grad' | 'secondary'`.

### 7. Acentos en docs
ADR 0006 y 7 agent-notes reescritos con español correcto (acentos en palabras llanas/esdrújulas).

## Por qué centralizar en tokens

La regla "cero hardcodes" del sistema visual tiene valor concreto: cuando cambia un color de marca
(ej. el verde de estado pasa de #047857 a otro tono), el cambio ocurre en un solo lugar (`:root`)
y se propaga automáticamente a todos los componentes. Sin tokens, ese cambio requiere buscar y
reemplazar en múltiples archivos con riesgo de omisiones.

Los grupos nuevos siguen la misma lógica semántica que los existentes: un nombre por rol, no por valor.
`--amber-800` describe un nivel de escala; `--green-700` un tono funcional para texto sobre tint.
