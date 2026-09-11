# 0035 — Visor progresivo de figuras enlazables

- Estado: aceptada
- Fecha: 2026-09-11
- Decidido por: José Tejero, Codex

## Contexto

Las imágenes del cuerpo se renderizan desde nodos `upload` de Lexical como
`<img>` (con `<figure>` solo cuando hay caption). La portada del post usa otra
ruta, `Thumb`. Ninguna superficie permite ampliar, hacer pan/zoom, recorrer las
figuras del documento ni enlazar una figura concreta. Esto perjudica sobre todo
a diagramas densos y series visuales.

La solución debe conservar HTML útil sin JavaScript, no cargar originales antes
de abrir, funcionar con Server Components, mantener el LCP actual y respetar
teclado, lector de pantalla, foco y `prefers-reduced-motion`. Los SVG continúan
sirviéndose mediante `<img>`, nunca inline (decisión de seguridad vigente).

## Opciones consideradas

### Visor y zoom

- **Lightbox completo (`PhotoSwipe`, YARL):** resuelve galería y gestos, pero
  impone una arquitectura y presentación más genéricas, duplica piezas que el
  navegador ya ofrece y dificulta el morph a medida.
- **Deep zoom (`OpenSeadragon`):** excelente para gigapíxeles y tiles, pero exige
  una pirámide de imágenes que Payload no produce hoy. Es coste injustificado
  para originales normales y SVG vectoriales.
- **Nativo + una primitiva de pan/zoom:** `<dialog>`, History API, Pointer Events
  y View Transitions para la experiencia; `@panzoom/panzoom` únicamente para la
  geometría robusta de zoom, pan y pinch.

### URL

- **Hash (`#figura-…`):** buen fallback elemental, pero no ofrece metadata por
  figura ni una página inequívoca para compartir.
- **Query (`?figura=…`):** facilita estado local, pero hace depender la página
  ISR principal de parámetros de búsqueda y complica canonical/metadata.
- **Ruta dedicada (`/figura/[figureId]`):** permite SSR, metadata específica,
  fallback sin JS e identidad estable sin volver dinámica la ruta editorial.

### Identidad

- **Índice ordinal:** legible, pero cambia al insertar o reordenar imágenes.
- **ID de Media:** estable para el archivo, no para una aparición concreta del
  mismo archivo.
- **ID del nodo Lexical:** identifica la aparición y sobrevive a reordenaciones.
  La portada, que no es nodo Lexical, usa el ID reservado `portada`.

## Decisión

Se implementa un visor propio y progresivo con estas reglas:

1. En servidor se deriva una lista serializable `ViewerFigure` en orden visual:
   portada del post primero y después nodos `upload` del body, recorriendo también
   contenido anidado y Callouts. Una serie incluye las figuras de su body, pero
   no una portada porque esa vista no la renderiza.
2. Cada aparición usa el `id` persistido del nodo Lexical. La portada usa
   `portada`. No se modifica el esquema de Payload ni se crea migración.
3. El converter reutiliza esa misma normalización y emite `<figure>` con un
   enlace real a `/blog/[slug]/figura/[figureId]` o
   `/series/[slug]/figura/[figureId]`. Sin JavaScript el enlace abre una página
   SSR con la figura ampliada y retorno al contenido.
4. Con JavaScript, un provider intercepta el enlace y abre un `<dialog>` nativo.
   El diálogo contiene navegación, tira de figuras, caption/alt visible, zoom,
   pan, pinch, copiar enlace y acceso al original. `Esc` cierra y el foco vuelve
   al disparador; la apertura directa devuelve el foco al contenido principal.
5. Abrir una figura hace `pushState`; cambiar de figura hace `replaceState` y el
   botón Atrás cierra una sola capa. En una entrada directa, cerrar reemplaza la
   URL por la ruta editorial en vez de salir del sitio.
6. `@panzoom/panzoom` se carga dinámicamente al abrir y se destruye al cerrar.
   Los originales se asignan al visor solo entonces; el HTML inline conserva el
   tamaño `content` (o `hero` para portada) y el LCP no recibe nuevas descargas.
7. El morph usa `document.startViewTransition` cuando existe, la fuente está
   visible y no se pidió movimiento reducido. El fallback es apertura/cierre
   instantáneo: la transición nunca es requisito funcional.
8. Las rutas de figura publican metadata Open Graph/Twitter específica y una
   imagen social 1200×630 generada con `ImageResponse`. Su canonical sigue siendo
   la página editorial padre y se marcan `noindex, follow` para evitar duplicados.
9. El visor aplica a portada del post y a todos los uploads del body, incluidos
   los de Callout y body de serie. Portadas de tarjetas/listados quedan fuera.

## Límites y degradación

- Raster normales usan el original con transformaciones; SVG conserva calidad
  vectorial. Tiling/deep zoom queda diferido hasta que existan originales que lo
  justifiquen y un pipeline de tiles.
- Si falla el original, permanece el preview y se anuncia el error sin cerrar el
  visor.
- Flechas/swipe cambian de figura cuando está ajustada; con zoom se reservan para
  pan. La navegación no envuelve en los extremos.
- Las figuras antiguas sin `id` de nodo siguen renderizando como imagen normal,
  pero no se inventa una URL inestable para ellas.

## Consecuencias

- **A favor:** identidad estable, deep links compartibles, metadata por figura,
  SSR real, dependencia única y pequeña, control visual total y carga diferida.
- **Coste:** existe una isla cliente con coordinación entre diálogo, historial,
  gestos y transición; las rutas de post y serie deben compartir su render para
  no duplicar la página.
- **Operación:** no cambia la colección Media ni CI/CD. La verificación sigue el
  contrato actual: lint, build hermético/producción y recorrido manual servido
  con `pnpm start`; el repositorio aún no incorpora framework de tests.

