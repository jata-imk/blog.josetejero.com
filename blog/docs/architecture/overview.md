# Overview de arquitectura

> Borrador inicial. El Architect lo completa con diagramas cuando el scaffolding exista.

## El sistema de un vistazo

```
                 ┌─────────────────────────────────────────────┐
   navegador ──► │  Next.js (App Router)                        │
                 │  - páginas públicas (SSR/SSG)                │
                 │  - render de Lexical → React                │
                 │  - /admin (panel de Payload)                │
                 │  - Payload CMS v3 (mismo proceso)           │
                 └───────────────┬─────────────────────────────┘
                                 │
                          ┌──────▼──────┐
                          │ PostgreSQL  │  (gestionada por Payload)
                          └─────────────┘
```

- **Una sola app Next** contiene el sitio público y el admin de Payload.
- **Datos:** Postgres vía Payload. Contenido de posts = árbol Lexical (JSON).
- **Presentación separada de datos:** Shiki (resaltado de código), tema oscuro y botón copiar son
  render en el frontend, no se almacenan.
- **Deploy:** Docker Compose (`app` + `postgres`) en VPS Debian 12 detrás de CloudPanel/Nginx.
  Cloudflare queda pendiente. Ver `../runbooks/deploy.md`.

## Estructura del frontend

La app publica se organiza con una convencion pragmatica y minima, alineada con el ADR
`0006-estructura-frontend.md`.

```text
app/
  (frontend)/              # rutas publicas
  (payload)/               # admin y API de Payload
components/
  ui/                      # primitives del design system
  layout/                  # header/footer y shell compartido
  blocks/                  # render de Lexical: prose, code, callout, toc
  post/                    # cards, meta, prev/next, author
  series/                  # stepper y progreso
  comments/                # lista, item y form
  search/                  # piezas especificas del buscador
  about/                   # piezas propias de la pagina about
lib/
  data/                    # acceso a Payload via funciones nombradas server-only
  lexical/                 # serializacion Lexical -> React
  utils/                   # utilidades puras
  access.ts
  seed.ts
  slug.ts
hooks/                     # client hooks solo para interactividad real
```

Rutas publicas minimas ya fijadas:

- `/` para home
- `/blog/[slug]` como detalle canonico de post y compuerta de QA para render de `body`

## Reglas de capas

- Server Components por defecto. Solo llevan `'use client'` las hojas interactivas: copiar codigo,
  nav movil, TOC activa, buscador y formulario de comentarios.
- `lib/data/*` encapsula la Local API de Payload. Las paginas y los componentes no llaman
  `payload.find` directo.
- `lib/lexical/*` transforma el JSON de Lexical en React. `Callout` es el unico bloque custom; el
  resaltado de codigo y el boton copiar son decisiones de render.
- `CodeBlock` se divide por responsabilidad: el resaltado con Shiki ocurre en servidor y el boton
  copiar vive en una hoja cliente minima.
- Sin store global por ahora. Estado UI con hooks locales o Context puntual si aparece una necesidad
  real.
- Los tokens de `app/globals.css` siguen siendo la unica fuente de verdad visual.

## Mapa de componentes

- `components/layout`: `Header`, `Footer`
- `components/ui`: `Btn`, `Cat`, `Tag`, `chip`, `Badge`, `status`, `Thumb`, `Meta`,
  `Breadcrumb`, `SearchInput`, `field/input/textarea`, `EmptyState`, `Pagination`, `Skill`
- `components/blocks`: `prose`, `CodeBlock`, `Callout`, `TableOfContents`
- `components/post`: `PostCard`, `FeaturedCard`, `ListRow`, `PrevNext`, `AuthorCard`
- `components/series`: `SeriesStep` y progreso
- `components/comments`: `Comment`, `CommentForm`
- `components/search`: composicion especifica de resultados/filtros del buscador
- `app/(frontend)/not-found.tsx`: experiencia `404`
- `SEOPreview`: queda en la superficie del CMS/admin, no en el sitio publico

## Pendiente de detallar (Architect)
- Diagrama de componentes de render de Lexical.
- Estrategia de cache / revalidacion de paginas.
- Estrategia del buscador (server-side vs client-side).
