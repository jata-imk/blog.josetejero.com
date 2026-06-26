# TOD-104: Alinear localhost:3000 con la integración real del modal global

**Agente**: Engineer  
**Fecha**: 2026-06-26  
**Issue**: TOD-104

## Contexto

Tras TOD-100 (auditoría del Architect) y TOD-101 (puente cliente del modal), el modal global de búsqueda (CommandPalette) estaba funcional pero desalineado con el contrato arquitectónico del ADR 0022. Cada página del frontend repetía manualmente `<Header />` + contenido + `<Footer />`, y el Header recibía `activePath` como prop desde cada página.

El ADR 0022 establece: "CommandPalette se monta una sola vez en el shell compartido del frontend."

## Qué se hizo

### 1. Header auto-consciente del path

Se eliminó la prop `activePath` y se reemplazó por `usePathname()` de `next/navigation`. La función `matchActive` determina el enlace activo:
- `/` solo activa si el pathname es exactamente `/`
- El resto de rutas activan con `startsWith` (ej. `/blog/...` activa "Blog")

### 2. Layout compartido con Header + Footer

`app/(frontend)/layout.tsx` ahora monta `<Header />` + `<main>{children}</main>` + `<Footer />` dentro de un contenedor flex con `minHeight: 100vh`. Esto asegura:

- **Una sola instancia global** de `Header` (y por tanto de `CommandPalette`) para todo el frontend
- **Footer siempre al fondo**: el `<main>` tiene `flex: 1` empujando el footer hacia abajo
- **Layout persistente**: en navegaciones cliente, el shell no remonta

### 3. Limpieza de páginas

Se eliminaron los imports y usos de `<Header />` y `<Footer />` de los 11 archivos de página:

| Archivo | Cambio |
|---|---|
| `page.tsx` (home) | Eliminados Header + Footer |
| `blog/page.tsx` | Eliminados Header + Footer |
| `blog/[slug]/page.tsx` | Eliminados Header + Footer |
| `buscar/page.tsx` | Eliminados Header + Footer |
| `series/page.tsx` | Eliminados Header + Footer |
| `series/[slug]/page.tsx` | Eliminados Header + Footer |
| `tags/page.tsx` | Eliminados Header + Footer |
| `tags/[slug]/page.tsx` | Eliminados Header + Footer |
| `categorias/page.tsx` | Eliminados Header + Footer |
| `categorias/[slug]/page.tsx` | Eliminados Header + Footer |
| `sobre-mi/page.tsx` | Eliminados Header + Footer |
| `not-found.tsx` | Eliminado el wrapper flex manual (lo da el layout) |

`global-not-found.tsx` **no se tocó**: está fuera del route group `(frontend)`, debe proveer su propio `<html>/<body>` y mantiene su `<Header />` + `<Footer />`.

## Verificación

- `pnpm lint` → pasa sin errores
- `pnpm build` → compila, TypeScript OK, todas las rutas generadas correctamente
- Los imports de Header/Footer solo existen en `layout.tsx` y `global-not-found.tsx`

## Por qué importa

- **DRY**: 12 páginas ya no repiten el shell. Añadir una nueva ruta solo necesita el contenido.
- **Fuente única de verdad**: el layout es el dueño canónico del shell visual.
- **Alineación con ADR 0022**: el `CommandPalette` es ahora una instancia única montada desde el layout, cumpliendo el contrato de "una sola instancia global del modal".
