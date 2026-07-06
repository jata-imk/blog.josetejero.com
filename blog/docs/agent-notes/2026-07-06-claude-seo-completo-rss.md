# SEO completo + RSS — punto 1 del roadmap de mejoras

Fecha: 2026-07-06 · Agente: Claude Code (sesión con el board) · ADR relacionado: 0029

## Qué se hizo

Se implementó todo el SEO del sitio público y el feed RSS. Antes de esto, el blog no
emitía Open Graph, sitemap, robots.txt, JSON-LD, canonicals, favicon ni RSS; solo el
detalle de post y "Sobre mí" tenían metadata (título y descripción). Ahora las ~13
páginas públicas emiten metadata completa y el sitio expone `/sitemap.xml`,
`/robots.txt` y `/rss.xml`.

### El concepto clave: la Metadata API se hereda

En App Router, cada layout y página puede exportar `metadata` (estático) o
`generateMetadata` (dinámico, cuando depende de datos). Next **fusiona** estos objetos
de arriba hacia abajo: lo que declara `app/(frontend)/layout.tsx` es el default de todo
el sitio, y cada página sobreescribe solo los campos que le importan. Por eso el layout
define una sola vez `metadataBase` (la URL pública, desde `NEXT_PUBLIC_SITE_URL`),
el `title.template` (`"%s · José Tejero"`), el Open Graph por defecto y el autodiscovery
del RSS — y una página como `/categorias` solo declara título, descripción y canonical.

### Piezas nuevas

- **`lib/seo.ts`** — fuente única de identidad del sitio (nombre, autor, descripción,
  URL, perfiles sociales) y builders de JSON-LD. Metadata y datos estructurados derivan
  de las mismas constantes: no pueden contradecirse.
- **`components/seo/JsonLd.tsx`** — inyecta `<script type="application/ld+json">`.
  JSON-LD es un bloque invisible que describe la página en vocabulario schema.org;
  Google lo usa para entender qué es la página y mostrar resultados enriquecidos.
  Se emiten: `WebSite` (layout), `BlogPosting` + `BreadcrumbList` (cada entrada).
- **`app/sitemap.ts`** — genera `/sitemap.xml` consultando `lib/data`: páginas fijas,
  todos los posts publicados (con `<lastmod>` desde `updatedAt`, el dato que Google sí
  usa para decidir re-rastreos) y las taxonomías. Nuevo helper `getPostsForSitemap()`
  en `lib/data/posts.ts` (solo slug + updatedAt, `depth: 0`, la consulta más barata).
- **`app/robots.ts`** — genera `/robots.txt`: allow todo, disallow `/admin`, `/api/` y
  `/buscar`, y apunta al sitemap. Robots.txt no es seguridad; solo orienta crawlers.
- **`app/rss.xml/route.ts`** — feed RSS 2.0 con la librería `feed` (últimos 20 posts,
  excerpt + enlace + portada como enclosure). Se eligió `/rss.xml` porque el Footer ya
  enlazaba esa ruta (daba 404 desde el lanzamiento). Route handler = endpoint sin React,
  ideal para XML.
- **`app/(frontend)/opengraph-image.tsx`** — la imagen de tarjeta social por defecto,
  generada por código con `ImageResponse` (1200×630, el tamaño canónico de OG). Las
  entradas con portada la sobreescriben con su `coverImage` en tamaño `hero` (1920×1080).
- **`app/icon.svg`** — favicon ("J" sobre el gradiente de marca). Convención nativa.

### Páginas cableadas

- `blog/[slug]`: `generateMetadata` ampliado — canonical, OG `type: article` con fechas
  y autor, portada, Twitter card — más los dos JSON-LD.
- `blog` (listado): título "Blog — Página N" al paginar; canonical **sin** los query
  params de filtros (ese contenido ya tiene URL oficial en las taxonomías, ADR 0014).
- `categorias|tags|series` (índices y `[slug]`): metadata con datos del CMS + canonical.
- `buscar`: `noindex, follow` (resultados de búsqueda no deben indexarse).
- `sobre-mi`: se quitó el sufijo manual del título (ahora lo pone el template del layout)
  y se añadió canonical + OG `profile`. Home: solo canonical `/` (hereda el resto).

### Gotcha descubierto en verificación: Next reemplaza, no fusiona, los objetos anidados

La Metadata API fusiona metadata entre layout y página **por clave de primer nivel**:
si una página define `openGraph` o `alternates`, el objeto del layout se pisa COMPLETO.
En la primera verificación, los posts habían perdido `og:site_name`/`og:locale` y todas
las páginas con canonical habían perdido el autodiscovery del RSS. La solución fue el
helper `alternatesFor(canonical)` en `lib/seo.ts` (declara canonical + feed juntos) y
repetir `siteName`/`locale` en los `openGraph` de página. Moraleja: con metadata, hay
que verificar el HTML servido, no asumir la herencia.

## Por qué así (decisiones, ver ADR 0029)

- **Sin librerías de SEO**: la Metadata API nativa cubre todo; `next-seo` es legado del
  Pages Router y `@payloadcms/plugin-seo` exigiría migración de schema para un beneficio
  que hoy no se necesita.
- **`feed` para RSS**: escapar XML a mano es el típico bug silencioso (el primer título
  con `&` rompe el feed). La librería lo hace bien y pesa poco.
- **Excepción a "cero hardcodes"**: `opengraph-image.tsx` e `icon.svg` copian colores de
  `globals.css` porque sus runtimes (Satori / SVG estático) no leen CSS variables. Está
  señalizado con comentarios en ambos archivos.

## Restricciones respetadas

- Rutas leen solo de `lib/data` (ADR 0011); `/blog/[slug]` sigue siendo la canonical
  editorial (ADR 0009); `revalidate = 3600` en sitemap y feed, coherente con el sitio.
- No se tocó el schema de Payload ni hubo migraciones.
- Verificación local: `tsc --noEmit` y `eslint .` limpios. Verificación funcional
  pendiente de servidor (ver siguiente sección).

## Cómo verificar (board)

Con el dev server corriendo: abrir `/sitemap.xml`, `/robots.txt`, `/rss.xml`; ver el
código fuente de la home y de un post (buscar `og:`, `canonical`, `ld+json`). Tras el
deploy: validar el feed en validator.w3.org/feed, el JSON-LD en el Rich Results Test de
Google y la tarjeta social en opengraph.xyz. Luego, punto 2 del roadmap: dar de alta la
propiedad en Search Console y enviar `https://josetejero.com/sitemap.xml`.
