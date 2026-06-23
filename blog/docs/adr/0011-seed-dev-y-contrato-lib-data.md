# 0011 — Seed dev canónico y contrato de consultas en `lib/data`

- Estado: aceptada
- Fecha: 2026-06-23
- Decidido por: Product Architect

## Contexto
`TOD-55` pide dos piezas que se tocan entre sí: sembrar contenido dev útil para construir y revisar
pantallas, y ampliar `lib/data/` para que el frontend consuma Payload sin consultas sueltas en
pages o componentes.

Las restricciones ya están cerradas:

- Payload v3 es la única capa de datos.
- El cuerpo del post vive en Lexical y debe ejercitar código built-in + `Callout`.
- La posición visible de un post dentro de una serie siempre se deriva; nunca se persiste.
- `lib/data/*` es la única puerta de entrada al contenido del blog según ADR 0006.
- YAGNI: no toca diseñar importadores, factories genéricas ni una capa de repositorios formal.

Si Engineer implementa seed y consultas de forma oportunista, aparecen dos riesgos: duplicar lógica
de búsquedas por `slug`/`status` en muchos sitios, o sembrar fixtures tan pobres que las pantallas
se construyan contra datos irreales y luego fallen al renderizar contenido rico real.

## Opciones consideradas
- Opción A — resolver el seed como una lista ad hoc dentro de `lib/seed.ts` y ampliar `lib/data/`
  con funciones aisladas por colección.
  Pros: cambio rápido, poco movimiento de archivos.
  Contras: mezcla usuarios, taxonomías, series y posts en una sola rutina; vuelve difícil mantener
  idempotencia por entidad; fomenta repetir filtros (`published`, `slug`, orden de serie) en cada
  consulta.
- Opción B — tratar el seed dev y `lib/data/` como un contrato mínimo de contenido canónico:
  fixtures declarativas por entidad, creación idempotente por `slug`/`email`, y helpers de
  consulta centrados en casos de uso del frontend.
  Pros: mantiene una sola fuente de verdad para los slugs de desarrollo, permite sembrar relaciones
  reales entre posts/series/tags/categorías, y deja consultas nombradas fáciles de reutilizar.
  Contras: obliga a diseñar de antemano el orden de creación y un pequeño set de helpers internos.

## Decisión
Se adopta la Opción B.

La implementación de `TOD-55` debe seguir este contrato:

- `lib/seed.ts` sigue siendo el punto de entrada, pero separa internamente fixtures de `users`,
  `categories`, `tags`, `series` y `posts` para que el orden de siembra sea explícito.
- Cada entidad sembrada en dev se identifica por su clave natural:
  `email` para `users`, `slug` para `categories`, `tags`, `series` y `posts`.
  Si ya existe, se reutiliza y no se duplica.
- Los posts de ejemplo son `published` y al menos dos de ellos contienen Lexical real con:
  headings, listas, links, bloque de código built-in y un `Callout`, para validar el renderer real
  en vez de HTML plano o datos ficticios mínimos.
- Las relaciones se resuelven por slug durante el seed:
  un post referencia `series`, `categories` y `tags` buscando primero los documentos ya sembrados.
  `seriesOrder` se guarda solo como criterio de orden; la posición visible sigue siendo derivada.
- `lib/data/` expone funciones nombradas por caso de uso de pantalla, no helpers genéricos tipo
  `findCollection`.
  El mínimo para esta fase es:
  `getPosts`, `getPostBySlug`, `getSeriesWithPosts`, `getPostsByTag`, `getPostsByCategory`,
  `getSeries`, `getCategories` y `getTags`.
- Las consultas públicas de posts filtran `status = published` por defecto.
  La derivación de serie ocurre en la función de datos: al cargar una serie, sus posts salen
  ordenados por `seriesOrder` y con profundidad suficiente para que el frontend no rehaga joins.

## Consecuencias
- Más fácil: Engineer tiene una ruta clara para sembrar datos útiles sin introducir factories o
  utilidades prematuras.
- Más fácil: Frontend puede construir listados, detalle de post y detalle de serie contra funciones
  estables, sin `payload.find` directo.
- Más fácil: QA revisa pantallas con contenido que se parece al real, incluido Lexical con bloques.
- Más difícil: el seed tendrá que cuidar el orden de dependencias y la resolución de relaciones por
  slug para seguir siendo idempotente.
- Deuda asumida: no introducimos búsqueda ni “related posts” todavía; esas consultas se diseñarán
  cuando exista la tarea del buscador o una necesidad real de navegación relacionada.
