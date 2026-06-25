# 0018 — Campo `featured` en Posts

- Estado: aceptada
- Fecha: 2026-06-25
- Decidido por: Engineer

## Contexto
La épica TOD-84 introduce búsqueda, filtros, posts destacados y series como parte de la funcionalidad
pública del blog. Para habilitar estas funciones, la capa de datos necesita:

1. Una forma de marcar posts como "destacados" para promoverlos en la home o en listados especiales.
2. Helpers de listado más flexibles que soporten filtrado por categoría, tag y ordenación.
3. Búsqueda unificada sobre posts, series, categorías y tags.
4. Un helper de "tags populares" derivado por conteo de posts publicados.

Este ADR documenta específicamente la adición del campo `featured` al modelo de datos de `Posts`,
que es un cambio de esquema que requiere migración de base de datos.

## Opciones consideradas
- Opción A — usar un campo booleano `featured` persistido en la colección Posts.
  Pros: simple, performante, fácil de filtrar en queries, evita joins adicionales.
  Contras: no permite múltiples niveles de destacados o prioridad; es binario (sí/no).

- Opción B — usar un campo numérico `featuredPriority` donde 0 = no destacado, > 0 = destacado con
  prioridad.
  Pros: permite ordenar destacados por prioridad, más flexible para futuros casos.
  Contras: más complejo que el caso de uso actual, no hay requisito de múltiples niveles de prioridad.

- Opción C — no añadir campo persistido; derivar "destacados" por heurística (ej: posts más recientes
  + más tags).
  Pros: no requiere cambio de esquema ni migración.
  Contras: no ofrece control editorial explícito; la lógica heurística es difícil de ajustar y puede
  no coincidir con lo que el autor quiere promover.

## Decisión
Adoptamos la Opción A: campo booleano `featured` con default `false`.

Fundamento técnico:

1. El caso de uso es binario: un post está destacado o no. No hay requisito de prioridades ni
   niveles múltiples.
2. El campo se posiciona en el sidebar del admin de Payload junto con otros meta-campos (`status`,
   `publishedAt`, `series`, etc.) para que sea fácil de editar por el autor.
3. El default `false` mantiene el comportamiento actual: posts nuevos no son destacados por defecto.
4. Este cambio es backward-compatible con posts existentes: la migración añade la columna con default
   `false`, por lo que posts ya publicados conservan su estado actual sin necesidad de backfill manual.

Contrato del campo:

- Nombre: `featured`
- Tipo: `checkbox` (Payload) → `boolean` (Postgres)
- Default: `false`
- Posición: sidebar (junto con `status`, `publishedAt`, etc.)
- Indexación: no se requiere índice dedicado en esta fase; el volumen de posts publicados es bajo
  y los queries de "posts destacados" son pocos y cacheables.

Migración:

- El cambio de esquema requiere migración de Postgres.
- En dev, Payload auto-push ya aplicó el campo; en producción, se debe aplicar la migración generada.
- Comando: `pnpm payload migrate:create featured-field` → `pnpm payload migrate`

Nota sobre dev mode vs. production migrations:

En el desarrollo local con Payload dev mode habilitado, Payload sincroniza automáticamente los cambios
de esquema a la base de datos mediante "auto-push". Esto significa que el campo `featured` ya existe
en la base de datos de desarrollo sin necesidad de aplicar la migración generada.

Sin embargo, para entornos de producción o cuando se desactive el dev mode, la migración debe aplicarse
explícitamente. El archivo de migración generado contiene el SQL para añadir la columna `featured` a
la tabla `posts`.

## Consecuencias
- Más fácil: el autor puede marcar manualmente posts como destacados desde el admin de Payload.
- Más fácil: los helpers de datos pueden filtrar por `featured: true` sin joins ni lógica heurística.
- Más fácil: el frontend puede mostrar un post destacado en la home o en la barra lateral sin
  duplicar lógica de selección.

- Más difícil: cambio de esquema → requiere migración en prod y regeneración de tipos.
- Más difícil: si en el futuro se necesitan niveles de prioridad, habrá que migrar de nuevo (pero
  esto es YAGNI: no hay evidencia de que sea necesario hoy).

Helpers asociados:

Como parte de la misma tarea (TOD-85), se implementan estos helpers en `lib/data/posts.ts`:

- `getFeaturedPost()`: retorna el post destacado más reciente publicado.
- `getPosts(options)`: extendido para aceptar `{ category?, tag?, sort?, excludeFeatured? }` y
  permitir listados flexibles.
- `getPopularTags(limit)`: derivado por conteo en memoria de posts publicados (no contador persistido).

Y se crea `lib/data/search.ts`:

- `searchAll(q, scope?)`: búsqueda unificada con `ilike` sobre posts (title/excerpt), series
  (title/description), categorías (name) y tags (name).

Todos estos helpers se exportan desde `lib/data/index.ts` para consumo del frontend.
