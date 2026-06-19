# 0006 — Estructura pragmática del frontend en Next

- Estado: aceptada
- Fecha: 2026-06-18
- Decidido por: Product Architect

## Contexto
El proyecto ya tiene cerradas varias decisiones: una sola app Next con App Router, Payload v3 como
capa de datos, Lexical para el cuerpo de los posts, un único bloque custom (`Callout`) y despliegue
self-hosted en VPS. Falta cerrar cómo se organiza el frontend para que Engineer y Frontend puedan
implementar sin inventar capas nuevas ni mezclar acceso a datos, render y comportamiento
interactivo.

La tarea pide una estructura que:

- respete App Router y Server Components por defecto
- aísle el acceso a Payload detrás de funciones nombradas en `lib/data/*`
- deje un destino claro para el inventario de componentes del handoff
- mantenga YAGNI: sin stores globales, repositories ni use-cases enterprise
- preserve la separación entre dato persistido y presentación derivada

## Opciones consideradas
- Opción A — organizar por capas pragmáticas (`components`, `lib/data`, `lib/lexical`, `hooks`) y
  mantener las features ligeras.
  Pros: encaja con Next idiomático, hace visible dónde viven Server Components y Client Components,
  reduce acoplamiento con Payload y deja el render de Lexical aislado.
  Contras: no encapsula cada feature en un paquete autocontenido; requiere disciplina para no volver
  a llamar `payload.find` desde páginas o componentes.
- Opción B — organizar por feature vertical completa (`features/post`, `features/search`,
  `features/comments`) incluyendo datos, UI y hooks dentro de cada feature.
  Pros: muy modular si el producto creciera mucho.
  Contras: hoy añade fricción innecesaria, duplica piezas compartidas de render y complica el
  aprendizaje del board en una base aún pequeña.
- Opción C — introducir una arquitectura formal de servicios/repositories/store global.
  Pros: deja capas muy explícitas.
  Contras: contradice YAGNI, multiplica boilerplate y reabre debates ya cerrados sobre
  sobrediseño.

## Decisión
Se adopta la Opción A: una estructura de frontend pragmática, idiomática de Next y guiada por
responsabilidad técnica, no por ceremonias enterprise.

Árbol objetivo bajo `blog/`:

```text
app/
  (frontend)/
  (payload)/
components/
  ui/
  layout/
  blocks/
  post/
  series/
  comments/
  search/
  about/
lib/
  data/
  lexical/
  utils/
  access.ts
  seed.ts
  slug.ts
hooks/
```

Reglas de capas:

1. Server Components por defecto. Solo usan `'use client'` las hojas con interactividad real:
   copiado de código, navegación móvil, buscador con input reactivo, TOC activa y formulario de
   comentarios.
2. `lib/data/*` es la única puerta de entrada al contenido del blog. Páginas y componentes no
   llaman `payload.find` ni `findByID` de forma directa; consumen funciones nombradas como
   `getPostBySlug`, `getPosts`, `getSeriesWithPosts` o `searchPosts`.
3. `lib/lexical/*` concentra la conversión Lexical -> React y sus renderers auxiliares. El bloque
   custom `Callout` vive en `components/blocks/Callout`. El resaltado de código, el tema oscuro y
   el botón copiar son render, no schema.
4. `components/ui/*` contiene primitives reutilizables del sistema visual. `components/layout/*`
   aloja shell compartido. Las carpetas de feature (`post`, `series`, `comments`, `search`,
   `about`) contienen composición de pantalla, no acceso directo a Payload.
5. `hooks/*` queda reservado a comportamiento client-only. No se usa store global; el estado UI se
   resuelve con hooks locales o, si aparece un caso real, con Context puntual.
6. Los tokens de `app/globals.css` son la única fuente visual. Ningún componente hardcodea colores,
   espaciados o tipografía que ya existan como token.

Asignación del inventario de componentes:

| Componente | Destino |
| --- | --- |
| `Header`, `Footer` | `components/layout/*` |
| `Btn`, `Cat`, `Tag`, `chip`, `Badge`, `status`, `Thumb`, `Meta`, `Breadcrumb`, `SearchInput`, `field/input/textarea`, `EmptyState`, `Pagination`, `Skill` | `components/ui/*` |
| `prose`, `CodeBlock`, `Callout`, `TableOfContents` | `components/blocks/*` |
| `PostCard`, `FeaturedCard`, `ListRow`, `PrevNext`, `AuthorCard` | `components/post/*` |
| `SeriesStep` + progreso | `components/series/*` |
| `Comment`, `CommentForm` | `components/comments/*` |
| `SEOPreview` | fuera del frontend público; queda en superficie CMS/admin cuando se implemente |
| `404` | `app/(frontend)/not-found.tsx` apoyado por `components/ui` si hace falta |

## Consecuencias
La implementación queda más fácil de navegar: Frontend sabe dónde construir primitives y features;
Engineer sabe dónde encapsular consultas y render de contenido.

También se fijan límites útiles:

- no se introduce store global mientras no exista un problema concreto de coordinación de estado
- no se crean repositories, DTO mappers ni use-cases formales sobre Payload
- la posición de un post dentro de una serie sigue siendo derivada, nunca persistida

La deuda asumida es deliberada: si el producto crece hasta requerir búsqueda compleja, caché más
fina o múltiples experiencias de consumo, esta estructura podrá evolucionar. Hoy sería peor pagar
ese coste por adelantado.
