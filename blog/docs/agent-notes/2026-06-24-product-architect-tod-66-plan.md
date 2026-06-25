# TOD-66 — plan de listados públicos reales

## Qué hice
- Revisé el alcance de `TOD-66` contra las decisiones cerradas del proyecto (`AGENTS.md`, ADR 0005,
  0006, 0011 y 0012).
- Detecté dos ambigüedades que podían romper la implementación:
  - la ruta pública de categorías estaba inconsistente entre `/categoria/[slug]` y
    `/categorias/[slug]`
  - la página de serie pedía `SeriesStep` + progreso sin existir un modelo de progreso de usuario
- Escribí el ADR 0014 para fijar el contrato mínimo de estos listados.
- Preparé la descomposición del issue para Engineer y Frontend con una frontera clara entre capa de
  datos y composición de pantallas.

## Decisiones clave
- Las rutas canónicas de la fase quedan en plural para categorías:
  `/categorias/[slug]`, además de `/blog`, `/series/[slug]` y `/tags/[slug]`.
- El blog index necesita paginación real desde `lib/data`; la página no debe reconstruir metadatos
  con consultas directas a Payload.
- `notFound()` y `EmptyState` no significan lo mismo:
  - `notFound()` si el slug de serie/tag/categoría no existe
  - `EmptyState` si existe pero no tiene posts publicados
- La página de serie expresa progreso editorial publicado, no progreso personal del lector. Eso
  evita inventar estado persistido que el modelo no tiene.

## Por qué
Sin estas decisiones, Engineer y Frontend iban a resolver el mismo problema por su cuenta en
archivos distintos: una ruta singular aquí, una semántica distinta de vacíos allá, o una barra de
“tu progreso” basada en datos que no existen. El ADR deja una sola interpretación correcta antes de
que empiece la implementación.

## Siguiente acción
- Subir el plan al issue `TOD-66`.
- Crear subtareas especializadas para Engineer y Frontend con dependencias explícitas.
- Dejar `TOD-66` esperando la ejecución de esas subtareas, en vez de dejarlo como un issue ambiguo
  “en progreso”.
