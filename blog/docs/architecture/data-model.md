# Modelo de datos (colecciones Payload)

> Estado inicial propuesto. Cada cambio no trivial sobre esto debe quedar como ADR.
> Principio rector: **derivar, no duplicar.** Separar datos de presentación.

## Colecciones

### Users
Autores / admin del CMS. Auth de Payload. Campos mínimos: `name`, `email`, `role`, `avatar` (rel a Media).

### Posts
La entidad central.
- `title`, `slug` (único), `excerpt`, `coverImage` (rel a Media)
- `body`: **richText Lexical** (incluye el bloque `Callout` y nodos de código built-in)
- `status`: `draft | published`, `publishedAt`
- `series`: rel opcional a `Series` + `seriesOrder` (número que ordena dentro de la serie)
- `categories`: rel múltiple a `Categories`; `tags`: rel múltiple a `Tags`
- **El post NO almacena su "posición N de M" en la serie.** Esa posición se **deriva** ordenando
  los posts de la serie por `seriesOrder` al renderizar. Single source of truth.

### Series
Agrupa posts en un recorrido ordenado. `title`, `slug`, `description`, `coverImage`.
La lista de posts y su numeración se **derivan** del join con Posts (no se guarda un array duplicado).

### Categories
Taxonomía amplia. `name`, `slug`, `description`.

### Tags
Taxonomía fina. `name`, `slug`, `description`.

### Comments
- `post` (rel), `authorName`, `authorEmail`, `body`, `createdAt`
- `status`: `pending | approved | spam | rejected`
- **Acceso:** crear = público (entra como `pending`); leer = solo `approved`. Moderación vía admin.

### Media
Uploads nativos de Lexical/Payload: imágenes y SVG. `alt`, `caption`, tamaños responsivos.
SVG se sirve como `<img>` (no inline).

## Relaciones derivadas (no almacenar)
- Posición de un post en su serie → ordenar por `seriesOrder`.
- "Posts relacionados" → derivar de tags/categorías compartidas.
- Conteos (posts por tag, por serie) → query, no contador persistido.
