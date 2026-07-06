# 0029 — SEO completo + RSS con convenciones nativas de App Router

- Estado: aceptada
- Fecha: 2026-07-06
- Decidido por: board (José) + Claude Code, sobre el roadmap de mejoras (punto 1)

## Contexto

El blog está en producción pero es invisible para buscadores y redes sociales: no había
Open Graph ni Twitter Cards (compartir un enlace mostraba solo la URL pelada), ni sitemap,
ni robots.txt, ni JSON-LD, ni canonicals, ni favicon, ni RSS. Solo 2 de ~13 páginas públicas
tenían metadata, y mínima (title + description). El roadmap prioriza esto como el punto de
mayor impacto/esfuerzo, y desbloquea Search Console (punto 2), que necesita un sitemap.

Restricciones: los datos ya existen en Payload (title, excerpt, coverImage con tamaño
`hero` 1920×1080, fechas); la regla del proyecto es que las rutas solo leen de `lib/data`
(ADR 0011); la ruta canónica del post es `/blog/[slug]` (ADR 0009).

## Opciones consideradas

- **Metadata: API nativa de Next vs `next-seo` vs `@payloadcms/plugin-seo`.**
  - Nativa — pros: cero dependencias, se hereda/fusiona por niveles (layout → página),
    soporta sitemap/robots/OG-image como convenciones de archivo; contras: escribir los
    objetos a mano. `next-seo` nació para el Pages Router: hoy es redundante.
  - `plugin-seo` — pros: meta title/description editables por entrada desde el admin;
    contras: migración de schema y sobre-ingeniería para un blog personal donde
    título + excerpt + portada cubren el 95 % de los casos. **Descartado por ahora**
    (revisable si algún día se necesitan metas personalizados por entrada).
- **RSS: librería `feed` vs XML manual.**
  - `feed` — pros: escapa caracteres especiales (un `&` en un título rompería XML manual),
    fechas RFC-822, mismo código puede emitir RSS 2.0/Atom/JSON Feed; contras: una dependencia más (pequeña).
  - Manual — pros: cero deps; contras: fácil producir un feed inválido sin notarlo. **Se eligió `feed`.**
- **URL del feed: `/feed.xml` vs `/rss.xml`.** El Footer ya publicaba un enlace a
  `/rss.xml` (hasta hoy daba 404). **Se eligió `/rss.xml`** para no romper ese enlace.
- **Contenido del feed: excerpt + enlace vs cuerpo completo.** Cuerpo completo exige
  convertir Lexical → HTML con URLs absolutas (más superficie de bugs). **Excerpt + enlace**;
  ampliable después sin romper suscriptores.
- **Canonicals en listados con filtros/paginación.** Cada página de paginación es
  self-canonical (recomendación de Google: no son duplicados); los filtros de `/blog`
  (`?cat=`, `?tag=`, `?sort=`) no entran a la canonical porque ese contenido ya tiene URL
  oficial en `/categorias/[slug]` y `/tags/[slug]` (ADR 0014/0019). `/buscar` va con
  `noindex, follow` (combinaciones infinitas del mismo contenido).
- **Imagen OG por defecto: generada por código vs asset estático.** Generada con
  `ImageResponse` (`opengraph-image.tsx`): se mantiene con código y no bloquea por falta
  de asset. Los posts con portada la sobreescriben con su `coverImage` en tamaño `hero`.

## Decisión

Implementar todo el SEO con la Metadata API y las convenciones de archivo nativas de Next
(App Router), sin plugins de CMS; RSS 2.0 con la librería `feed` servido en `/rss.xml` como
route handler. Fuente única de identidad del sitio y builders JSON-LD en `lib/seo.ts`;
componente `JsonLd` para inyectar los bloques `application/ld+json` (WebSite en el layout,
BlogPosting + BreadcrumbList en cada entrada). Sitemap y feed leen solo de `lib/data`
(nuevo helper `getPostsForSitemap`). Todo con `revalidate = 3600`, igual que el sitio.

**Excepción documentada a "cero hardcodes":** `opengraph-image.tsx` y `app/icon.svg`
copian valores de color del token layer (`app/globals.css`) porque Satori/SVG estático no
pueden leer CSS custom properties. Si los tokens cambian, esos dos archivos se actualizan a mano.

## Consecuencias

- Compartir cualquier URL del sitio produce tarjeta con imagen + título + descripción;
  Google recibe sitemap, robots, canonicals y datos estructurados; los lectores RSS pueden
  suscribirse (autodiscovery incluido vía `alternates.types`).
- Se desbloquea el punto 2 del roadmap (enviar `/sitemap.xml` a Search Console).
- Nueva dependencia: `feed` (~sin deps transitivas pesadas).
- Deuda asumida: paleta duplicada en OG image/favicon (ver excepción); el feed no lleva
  cuerpo completo; los metas por entrada no son personalizables desde el admin (requeriría
  `plugin-seo`, revisable).
- `NEXT_PUBLIC_SITE_URL` pasa de "conveniente" a **crítica**: si falta en producción,
  canonicals/OG/sitemap/feed apuntarían a localhost. Ya está en `.env.example` y como
  build-arg del Dockerfile.
