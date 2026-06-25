# 0016 — Visor PDF custom sobre React-PDF

- Estado: aceptada
- Fecha: 2026-06-25
- Decidido por: Product Architect

## Contexto
Después de `TOD-74`, `/sobre-mi` quedó implementada con un visor PDF nativo (`<object>`/HTML
embed) conforme al alcance original de `TOD-73` y al ADR 0015.

El board pidió explícitamente elevar la UX: ya no basta con embeber el PDF del navegador; ahora se
quiere un lector propio, más elegante e intuitivo, y además diseñarlo como componente reusable.

Eso reemplaza la parte del ADR 0015 que limitaba el visor a HTML nativo, pero no cambia las otras
decisiones de ese ADR:

- el contenido de `/sobre-mi` sigue siendo tipado en código
- los documentos públicos siguen viviendo bajo `public/`

La nueva decisión real es qué base técnica usar para construir ese lector propio sin abrir una
pieza sobredimensionada para un único CV.

## Opciones consideradas
- Opción A — usar PDF.js directamente (`pdfjs-dist`) y construir render, paginación, zoom y estado
  desde cero.
  Pros: control total sobre canvas, texto y toolbar.
  Contras: más superficie técnica, más código infra, más riesgo de errores de worker/render y más
  tiempo invertido en plumbing antes de llegar a una UX mejor.
- Opción B — usar `react-pdf` como capa React sobre PDF.js y construir encima una UI propia del
  proyecto.
  Pros: mantiene control visual total, evita escribir el wiring base del documento/páginas desde
  cero, encaja con Next/React, y sigue apoyándose en PDF.js para el render real.
  Contras: introduce dependencia nueva y requiere configurar el worker de PDF.js correctamente.
- Opción C — incrustar el viewer completo de PDF.js o una librería de viewer más cerrada con layout
  ya hecho.
  Pros: entrega muchas funciones listas.
  Contras: re-skin más costoso, menos alineado con el diseño del proyecto, y más fácil caer en una
  UI genérica o en licencias/capacidades que exceden la necesidad actual.

## Decisión
Se adopta la Opción B: implementar un componente custom del proyecto montado sobre `react-pdf`.

Fundamento técnico:

1. `react-pdf` ya resuelve la integración React con PDF.js y el manejo básico de `Document`/`Page`
   sin obligarnos a bajar al display layer crudo.
2. PDF.js sigue siendo la base de render, pero la UI visible será nuestra: toolbar, navegación,
   estados vacíos/carga/error y layout integrados con los tokens del blog.
3. Evitamos incrustar el viewer completo de Mozilla. PDF.js documenta que su viewer puede servir
   como punto de partida, pero no conviene embeberlo sin modificación; para este proyecto es mejor
   componer un lector propio.
4. YAGNI: para un CV y futuros documentos públicos simples no necesitamos búsqueda avanzada,
   anotaciones, firmas, plugins enterprise ni una suite documental completa.

Contrato mínimo del componente:

- Componente reusable del frontend, no inline dentro de `/sobre-mi`.
- Client Component aislado para el visor; la página sigue siendo Server Component de composición.
- Controles mínimos:
  - página actual / total
  - anterior / siguiente
  - zoom in / zoom out / reset
  - descarga
  - abrir en pestaña nueva
- Estados mínimos:
  - loading
  - error con fallback a abrir/descargar
  - empty/unsupported si el documento no puede renderizarse
- Diseño propio del proyecto:
  - toolbar compacta
  - superficie visual integrada con tokens
  - comportamiento usable en móvil y desktop

## Consecuencias
Se vuelve más fácil ofrecer una UX más cuidada sin abandonar el principio YAGNI.

También aparecen obligaciones nuevas:

- hay que añadir y configurar `react-pdf`/worker de PDF.js correctamente
- el visor pasa a ser una pieza client-side con estado propio
- QA debe volver a validar la experiencia del CV porque ya no se trata de un embed nativo

Quedan fuera de alcance en esta fase:

- búsqueda dentro del PDF
- thumbnails/sidebar
- anotaciones, selección persistida o comentarios
- múltiples modos de layout avanzados

Si más adelante el producto necesita un visor documental mucho más rico, esa evolución podrá
revisarse con un ADR nuevo. Hoy la meta es un lector propio, sobrio y bien integrado al blog.
