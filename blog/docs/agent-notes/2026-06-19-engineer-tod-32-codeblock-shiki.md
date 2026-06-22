# 2026-06-19 — Engineer — TOD-32: Integrar Shiki server-side y split server/client en CodeBlock

## Qué hice

Instalé Shiki 4.2.0 e implementé el split server/client del `CodeBlock` siguiendo el ADR 0008 y el plan del Architect.

### Archivos creados/modificados

1. **`lib/code-highlight.ts`** (nuevo) — helper server-only que envuelve Shiki
2. **`components/blocks/CopyButton.tsx`** (nuevo) — Client Component mínimo para el botón copiar
3. **`components/blocks/CodeBlock.tsx`** (reescrito) — ahora Server Component asíncrono con Shiki
4. **`lib/lexical/converters.tsx`** (modificado) — registra el converter custom para bloques `Code`

### Por qué se partió así

El ADR 0008 ya definía el contrato. La implementación lo sigue al pie:

- **Server (`CodeBlock.tsx`)**: recibe `code` y `lang`, llama a `highlightCode()` (que usa Shiki `codeToHtml`), y renderiza el chrome completo (`.ab-code` + barra con dots/lang/botón). Es asíncrono porque Shiki necesita `await` para cargar WASM y gramáticas.

- **Client (`CopyButton.tsx`)**: un solo hook `useState` para `idle`/`copiado`. No importa Shiki ni nada pesado. Solo `navigator.clipboard.writeText()`.

### Concepto didáctico: Server vs Client Components

Este caso es el ejemplo canónico de **Server Components por defecto, Client Components solo para interactividad**:

1. El resaltado de sintaxis es **transformación pura de datos** (`code+lang → HTML`). No necesita navegador. Shiki corre en el servidor y genera HTML con estilos inline. El cliente recibe HTML ya listo, sin JS de resaltado.

2. Copiar al portapapeles **sí necesita navegador** porque usa `navigator.clipboard` y estado visual. Por eso vive en un Client Component minúsculo (13 líneas de lógica).

Si todo estuviera en un Client Component, el navegador descargaría Shiki (~2MB de gramáticas) para cada página con código. Con este split, ni un byte de Shiki llega al cliente.

**Cómo funciona**: `CodeBlock` es `async function`, devuelve una Promise. React 19 en Server Components resuelve la promise automáticamente. El converter de Payload Lexical devuelve `<CodeBlock ... />` que es una Promise, y React la maneja.

### Fallback

- Si `code` está vacío → string vacío.
- Si Shiki falla (lenguaje desconocido, error de WASM) → `escapeHtml(code)`, código plano sin romper la página.
- Alias comunes mapeados (`js→javascript`, `ts→typescript`, `sh→shell`, etc.).

### Verificación

- `npx tsc --noEmit` pasa limpio.
- `pnpm run lint` pasa limpio.

## Pendiente para QA

- Probar que un bloque de código en un post se resalta con Shiki (tema oscuro `github-dark`, fondo `--code-bg: #0f172a`).
- Verificar el botón copiar (estados idle/copiado, timeout 2s).
- Verificar en móvil que el bloque no se rompe.
- Probar con un lenguaje no soportado (debe caer a código plano).
