# 0014 — Listados públicos y rutas canónicas del frontend

- Estado: aceptada
- Fecha: 2026-06-24
- Decidido por: Product Architect

## Contexto
`TOD-66` pide conectar la home y los listados públicos a datos reales de Payload sin remaquetar los
shells ya aprobados. El trabajo trae varias ambigüedades que, si se dejan implícitas, van a
convertirse en retrabajo para Engineer y Frontend:

- la home actual enlaza categorías como `/categoria/[slug]`, mientras el shell global ya usa
  `/categorias`
- `getPosts(limit, page)` hoy devuelve solo `docs`, pero el blog index necesita metadatos de
  paginación para alimentar `Pagination`
- las páginas de tag/categoría deben distinguir entre “slug inexistente” (`notFound()`) y
  “taxonomía válida sin posts publicados” (`EmptyState`)
- la página de serie debe reutilizar `SeriesStep` y barra de progreso sin inventar progreso de
  usuario ni nuevos campos persistidos

El proyecto ya cerró restricciones que este trabajo no puede reabrir:

- Payload v3 es la única capa de datos y las páginas consumen `lib/data` (ADR 0006, ADR 0011)
- la posición visible dentro de una serie se deriva del orden fuente `seriesOrder`; no existe un
  campo adicional para “posición” o “progreso” (ADR 0005, ADR 0012)
- YAGNI: no toca crear view-model builders genéricos ni una nueva capa de repositories

## Opciones consideradas
- Opción A — resolver cada página de forma oportunista con lógica local.
  Pros: cierra pantallas rápido.
  Contras: reproduce decisiones de rutas, paginación y estados vacíos en varias páginas; fomenta
  divergencias entre home, blog y taxonomías.
- Opción B — fijar un contrato pequeño para listados públicos: rutas canónicas, consultas mínimas
  en `lib/data` y semántica explícita para vacíos/404/serie.
  Pros: Engineer y Frontend trabajan sobre reglas comunes y reutilizan shells sin introducir capas
  nuevas.
  Contras: obliga a tocar el contrato actual de `getPosts` y a documentar la semántica de serie.

## Decisión
Se adopta la Opción B.

Reglas de implementación para `TOD-66`:

1. Las rutas canónicas de esta fase son:
   - `/`
   - `/blog`
   - `/series/[slug]`
   - `/tags/[slug]`
   - `/categorias/[slug]`

   Cualquier enlace público a categoría en singular (`/categoria/[slug]`) se considera un bug y se
   normaliza al plural para quedar alineado con `Header` y `Footer`.

2. `lib/data` sigue siendo la única puerta de acceso a Payload. Para superficies paginadas, la
   consulta nombrada debe devolver metadatos suficientes para renderizar `Pagination` desde la
   página sin rehacer `payload.find`. En esta fase, ese contrato aplica al listado `/blog`.

3. Las páginas derivadas por slug separan identidad de contenido:
   - si la entidad base no existe (`Series`, `Tag`, `Category`) la ruta hace `notFound()`
   - si existe pero no tiene posts publicados, la ruta renderiza `EmptyState`

   Esta distinción se resuelve con helpers de `lib/data`, no con consultas directas en la página.

4. La home no define datasets ad hoc. “Destacados”, “últimas publicaciones” y “series
   recomendadas” se derivan server-side desde consultas reales ya disponibles en `lib/data`, y los
   shells (`PostCard`, `ListRow`, `Cat`, `SeriesCard`) se limitan a presentación.

5. La página `/series/[slug]` representa avance editorial publicado, no progreso de usuario:
   - los posts publicados anteriores al último publicado se marcan como `done`
   - el último post publicado se marca como `current`
   - `soon` no se sintetiza a partir de datos inexistentes; solo podría aparecer si en el futuro el
     producto modela entregas planeadas como dato real
   - la barra de progreso expresa cobertura del contenido publicado, no lectura individual del
     usuario

   Con esto se reutiliza `SeriesStep` sin introducir cuentas de usuario, bookmarks ni campos extra
   en `Posts` o `Series`.

## Consecuencias
- Más fácil: Frontend tiene una convención única de rutas y comportamiento para 404/empty state.
- Más fácil: Engineer puede cerrar la paginación del blog index en `lib/data` sin diseñar una capa
  genérica nueva.
- Más fácil: la serie pública mantiene coherencia con el modelo actual; no se inventa “progreso”
  persistido.
- Más difícil: el copy de la pantalla de serie no puede sugerir progreso personal si el producto no
  lo guarda; la implementación tendrá que ajustar ese texto manteniendo el shell visual.
- Deuda asumida: tags y categorías no paginan en esta fase. Si el volumen real crece, esa decisión
  se reabre con un ADR nuevo en vez de anticiparla ahora.
