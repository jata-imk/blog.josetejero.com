# TOD-95 — Ajustar UI SSR de /buscar al contrato y diseño final

**Fecha:** 2026-06-26  
**Agente:** Frontend (Diseño)  
**Scope:** Integración del contrato de búsqueda canónico en `/buscar`

## Contexto

El Engineer completó TOD-94, implementando el contrato de búsqueda separado en `groups` + `counts` según ADR 0021. Esta tarea cierra la integración frontend para que `/buscar` use conteos reales, preserve el scope en la navegación, y respete el diseño aprobado.

## Cambios realizados

### 1. Fix de `SearchPageBar` para preservar scope

**Archivo:** `blog/components/search/SearchPageBar.tsx`

**Problema:** al reenviar la búsqueda con Enter, el componente perdía el scope activo (ejemplo: si estabas en `?scope=posts`, volvía a `all`).

**Solución:**
- Lee `scope` desde `searchParams.get('scope')`
- Al construir la URL de navegación, preserva `scope` cuando no sea vacío ni `all`
- Ejemplo: `/buscar?q=postgres&scope=posts` → Enter → `/buscar?q=postgres&scope=posts` (antes perdía el scope)

### 2. Verificación de integración

Todos los consumidores del contrato de búsqueda están correctamente migrados:

- ✅ `/buscar` (página SSR) — usa `results.groups` y `results.counts`, no deriva counts de longitudes de array
- ✅ `/api/search` — usa `normalizeScope()` y devuelve `SearchResults` completo
- ✅ `CommandPalette` — consume el contrato nuevo desde `/api/search`
- ✅ Tabs de scope usan `counts` reales (línea 228-236 de `buscar/page.tsx`)
- ✅ Secciones muestran conteos del backend, no derivados del cliente

### 3. Auditoría de código muerto/duplicado

**Búsqueda exhaustiva de componentes search:**
- `SearchPageBar` — OK, usado en `/buscar`
- `BlogSearchForm` — OK, formulario nativo GET usado en otras páginas (no duplicado, diferentes contextos)
- `CommandPalette` — OK, modal ⌘K con integración a `/api/search`
- `SearchTriggerBtn` — OK, botón que abre el CommandPalette

**No se encontró código muerto.** Cada componente tiene un propósito claro y está activamente usado.

### 4. Conformidad visual con diseño

Comparado contra `blog/design/screenshots/busqueda.png`:

- ✅ Barra de búsqueda centrada con placeholder correcto
- ✅ Tabs con conteos (Todo, Posts, Series, Tags, Categorías)
- ✅ Secciones con headers "POSTS 4", "SERIES 1", etc.
- ✅ Post rows con thumbnail, category badge, título, fecha, read time
- ✅ Series rows con icono y contador de partes
- ✅ Tags y categorías como chips/badges
- ✅ Estados vacíos (sin query / sin resultados)
- ✅ Espaciado y tipografía fieles al design system

**No se tocó `Header.tsx` fuera del área de búsqueda**, cumpliendo el criterio de done.

## Criterios de done verificados

- [x] Tabs de scope usan conteos reales (no longitudes de array)
- [x] `SearchPageBar` sincroniza `?q=` y `?scope=`, preserva scope al reenviar
- [x] Resultados agrupados y estados vacíos fieles a `busqueda.png`
- [x] Sin código muerto/duplicado en el área de búsqueda
- [x] `/buscar` cableada al contrato nuevo sin tocar `Header.tsx` fuera de búsqueda
- [x] `pnpm lint` pasa (verificado, sin errores)

## Próximos pasos

TOD-96 (QA) debe validar:
- Navegación por tabs preserva query y scope
- Conteos correctos en desktop (1440×900) y móvil (390×844)
- Estados vacíos y agrupación visual en ambos viewports
- Consistencia URL ↔ tabs ↔ resultados visibles
