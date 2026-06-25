# ADR 0020 — Búsqueda server-side sobre Payload/Postgres

**Estado:** Aceptado  
**Fecha:** 2026-06-25  
**Autores:** Frontend (TOD-87), Engineer (TOD-85)

## Contexto

Se necesita una página de búsqueda global `/buscar` que muestre resultados agrupados por tipo (posts, series, tags, categorías). El blog usa Payload CMS con Postgres como capa de datos.

## Decisión

La búsqueda se ejecuta **server-side** usando la Payload local-api (`payload.find`) desde Server Components de Next.js. No se crea un motor de búsqueda externo (Algolia, Meilisearch, etc.).

### Mecanismo de búsqueda

- Operador `like` de Payload (traducido a `ILIKE` en Postgres) para substring case-insensitive.
- Cada colección se consulta de forma paralela (`Promise.all`).
- Los posts se filtran por `status: published`.
- La función `searchAll(q, scope)` en `lib/data/search.ts` centraliza toda la lógica.

### Endpoints

| Uso | Mecanismo |
|-----|-----------|
| Página `/buscar` | SSR directo vía `searchAll` en Server Component |
| Modal ⌘K (`CommandPalette`) | API route `GET /api/search?q=` → `searchAll` |

## Consecuencias

**Positivas:**
- Sin servicios externos; la búsqueda vive en el mismo proceso Next.js.
- Sin índice que sincronizar; siempre refleja el estado actual de Postgres.
- La SSR en `/buscar` es compatible con crawlers y accesible sin JS.

**Limitaciones:**
- `ILIKE` no es full-text; no hay relevancia, stemming, ni sinónimos.
- Para un volumen alto de contenido (>10k posts) habría que migrar a `pg_trgm` o un motor externo.
- Mínimo 2 caracteres para activar la búsqueda (evita queries vacías).
