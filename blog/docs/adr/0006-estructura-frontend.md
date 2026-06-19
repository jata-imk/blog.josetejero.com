# 0006 — estructura pragmatica del frontend en Next

- Estado: aceptada
- Fecha: 2026-06-18
- Decidido por: Product Architect

## Contexto
El proyecto ya tiene cerradas varias decisiones: una sola app Next con App Router, Payload v3 como
capa de datos, Lexical para el cuerpo de los posts, un unico bloque custom (`Callout`) y despliegue
self-hosted en VPS. Falta cerrar como se organiza el frontend para que Engineer y Frontend puedan
implementar sin inventar capas nuevas ni mezclar acceso a datos, render y comportamiento
interactivo.

La tarea pide una estructura que:

- respete App Router y Server Components por defecto
- aisle el acceso a Payload detras de funciones nombradas en `lib/data/*`
- deje un destino claro para el inventario de componentes del handoff
- mantenga YAGNI: sin stores globales, repositories ni use-cases enterprise
- preserve la separacion entre dato persistido y presentacion derivada

## Opciones consideradas
- Opcion A — organizar por capas pragmáticas (`components`, `lib/data`, `lib/lexical`, `hooks`) y
  mantener las features ligeras.
  Pros: encaja con Next idiomatico, hace visible donde viven Server Components y Client Components,
  reduce acoplamiento con Payload y deja el render de Lexical aislado.
  Contras: no encapsula cada feature en un paquete autocontenido; requiere disciplina para no volver
  a llamar `payload.find` desde paginas o componentes.
- Opcion B — organizar por feature vertical completa (`features/post`, `features/search`,
  `features/comments`) incluyendo datos, UI y hooks dentro de cada feature.
  Pros: muy modular si el producto creciera mucho.
  Contras: hoy añade friccion innecesaria, duplica piezas compartidas de render y complica el
  aprendizaje del board en una base aun pequena.
- Opcion C — introducir una arquitectura formal de servicios/repositories/store global.
  Pros: deja capas muy explicitas.
  Contras: contradice YAGNI, multiplica boilerplate y reabre debates ya cerrados sobre
  sobredisenio.

## Decisión
Se adopta la Opcion A: una estructura de frontend pragmatica, idiomatica de Next y guiada por
responsabilidad tecnica, no por ceremonias enterprise.

Arbol objetivo bajo `blog/`:

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
   copiado de codigo, navegacion movil, buscador con input reactivo, TOC activa y formulario de
   comentarios.
2. `lib/data/*` es la unica puerta de entrada al contenido del blog. Paginas y componentes no
   llaman `payload.find` ni `findByID` de forma directa; consumen funciones nombradas como
   `getPostBySlug`, `getPosts`, `getSeriesWithPosts` o `searchPosts`.
3. `lib/lexical/*` concentra la conversion Lexical -> React y sus renderers auxiliares. El bloque
   custom `Callout` vive en `components/blocks/Callout`. El resaltado de codigo, el tema oscuro y
   el boton copiar son render, no schema.
4. `components/ui/*` contiene primitives reutilizables del sistema visual. `components/layout/*`
   aloja shell compartido. Las carpetas de feature (`post`, `series`, `comments`, `search`,
   `about`) contienen composicion de pantalla, no acceso directo a Payload.
5. `hooks/*` queda reservado a comportamiento client-only. No se usa store global; el estado UI se
   resuelve con hooks locales o, si aparece un caso real, con Context puntual.
6. Los tokens de `app/globals.css` son la unica fuente visual. Ningun componente hardcodea colores,
   espaciados o tipografia que ya existan como token.

Asignacion del inventario de componentes:

| Componente | Destino |
| --- | --- |
| `Header`, `Footer` | `components/layout/*` |
| `Btn`, `Cat`, `Tag`, `chip`, `Badge`, `status`, `Thumb`, `Meta`, `Breadcrumb`, `SearchInput`, `field/input/textarea`, `EmptyState`, `Pagination`, `Skill` | `components/ui/*` |
| `prose`, `CodeBlock`, `Callout`, `TableOfContents` | `components/blocks/*` |
| `PostCard`, `FeaturedCard`, `ListRow`, `PrevNext`, `AuthorCard` | `components/post/*` |
| `SeriesStep` + progreso | `components/series/*` |
| `Comment`, `CommentForm` | `components/comments/*` |
| `SEOPreview` | fuera del frontend publico; queda en superficie CMS/admin cuando se implemente |
| `404` | `app/(frontend)/not-found.tsx` apoyado por `components/ui` si hace falta |

## Consecuencias
La implementacion queda mas facil de navegar: Frontend sabe donde construir primitives y features;
Engineer sabe donde encapsular consultas y render de contenido.

Tambien se fijan limites utiles:

- no se introduce store global mientras no exista un problema concreto de coordinacion de estado
- no se crean repositories, DTO mappers ni use-cases formales sobre Payload
- la posicion de un post dentro de una serie sigue siendo derivada, nunca persistida

La deuda asumida es deliberada: si el producto crece hasta requerir busqueda compleja, cache mas
fina o multiples experiencias de consumo, esta estructura podra evolucionar. Hoy seria peor pagar
ese coste por adelantado.
