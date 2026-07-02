# Mejora de lectura en detalle de post

## Qué cambié

Mejoré la experiencia de lectura del detalle de post sin tocar datos, importador ni arquitectura de Lexical/Payload. El cambio se concentra en el CSS global de componentes visuales, el componente del índice lateral y la clase del `article` de la página de post.

## Por qué

El cuerpo de Payload no renderiza los bloques como hijos directos de `.ab-prose`; los envuelve en `.payload-richtext`. Por eso la regla original `.ab-prose > * + *` no separaba párrafos, imágenes, blockquotes o bloques de código: visualmente quedaban pegados aunque existiera una intención de spacing en el diseño.

También había dos problemas de layout: el índice lateral ocupaba una columna fija que desplazaba el artículo fuera del centro visual, y en móvil el artículo podía conservar un ancho de 720px dentro de un viewport pequeño. Eso afectaba directamente la comodidad de lectura.

## Detalle técnico

- El spacing ahora se aplica a `.ab-prose .payload-richtext > * + *`, que es donde realmente viven los nodos de Lexical.
- El `code` inline dentro de prosa ahora tiene fondo, borde, padding y contraste propios usando tokens (`--bg-soft`, `--line-2`, `--ink`). El selector excluye el código dentro de `.ab-code` para no romper el bloque Shiki.
- El artículo usa `.post-article` con `width: 100%`, `max-width: var(--wrap-narrow)` y `min-width: 0`, evitando overflow en grids responsive.
- El TOC desktop pasó de panel fijo a rail compacto: muestra marcas por sección y se expande con `:hover` o `:focus-within`. Esto mantiene el índice accesible con teclado y reduce el espacio reservado en la composición.
- El TOC expandido tiene `max-height: calc(100vh - 112px)` y `overflow-y: auto`, de modo que listas largas se desplazan dentro del panel sin obligar a scrollear todo el documento para ver los últimos links.
- El rail colapsado mide solo el contenido real del índice, no el alto del post completo. Las marcas se mantienen cerca entre sí aunque el documento sea largo.
- El panel desktop dejó de animar ancho o `transform`. Mantiene un ancho estable y transparente; al hacer hover/focus solo aparecen fondo, borde, sombra ligera y textos por opacidad. Esto evita que el texto parezca nacer desde un punto o que la sombra se vea como un borde sólido durante la transición.
- El código inline usa el tinte azul del blog (`--blue-tint`, `--blue-border`, `--blue-700`) para diferenciarse mejor del texto normal sin introducir una paleta nueva.
- El TOC desktop quedó fijo al borde derecho del viewport y fuera del flujo del grid del artículo. En colapsado muestra solo marcas; al expandirse aparece un panel con fade suave sin desplazar el contenido.
- Las marcas del TOC usan una caja fija de 28px y cambian su longitud visual con `background-size`. Así los estados activo, normal y subnivel comparten el mismo eje izquierdo y no se desalinean.
- Los headings del cuerpo tienen `scroll-margin-top` y el documento tiene `scroll-padding-top`, para que los links `#heading` no queden tapados por el header sticky.
- El ajuste final alinea las marcas colapsadas por el borde derecho, separa el rail del borde de la ventana con tokens de espaciado y evita que el estado activo cambie tamaños: solo cambia color/opacidad.
- En el panel expandido se ocultan las marcas y la jerarquía se expresa con indentación de texto. El panel usa `overscroll-behavior: contain` para que el scroll interno no se transfiera al documento.
- El offset de anchors usa `scroll-padding-top` para cubrir el header sticky y un `scroll-margin-top` pequeño en headings. Así el título queda visible con un margen corto, sin duplicar la altura del header.

## Iteración: TOC de dos capas (estilo Notion)

El rail de una sola capa (mismos `<a>` que se morfeaban de marca a texto) tenía tres problemas: el área de hover abarcaba los ~260px del `aside` aunque solo se vieran marcas de 28px; al expandir cambiaba `min-height`/`padding` de cada fila y toda la lista se "descomprimía" en vertical; y no había separación real entre marcas y panel.

Se rehízo `TableOfContents` con **dos capas independientes**, como Notion:

- **Capa de marcas** (`.ab-toc-marks`, `aria-hidden`): spans decorativos, filas fijas y compactas, alineadas al borde derecho. Nunca cambian de tamaño ni posición → sin descompresión.
- **Capa de panel** (`.ab-toc-panel`): popover flotante `position: absolute` anclado arriba-derecha con los links reales (única semántica para lectores de pantalla). En reposo `opacity: 0` + `translateX(6px) scale(.99)` + `pointer-events: none`; en `:hover`/`:focus-within` del rail hace cross-fade a `opacity: 1` + `transform: none`. El panel crece hacia la izquierda superponiéndose al contenido, sin desplazar el artículo.

El `.ab-toc-rail` pasó de `width: 100%` a `width: max-content`, así el área de hover se limita a la tira de marcas (~22px). El panel es descendiente del rail, por lo que hovering el panel mantiene `:hover` aunque sobresalga de la caja del rail. Se añadió `@media (prefers-reduced-motion: reduce)` para anular el transform. Se conserva `IntersectionObserver`/`aria-current` sin estado React nuevo.

Validado con Playwright (viewport 1440): ancho del rail = 22px (antes ~260); marcas sin desplazamiento vertical (`markShiftY = 0`, `markHeightDelta = 0`); panel colapsado `opacity 0`/`pe none` → hover `opacity 1` con marcas a `opacity 0`; la zona izquierda ya no expande; el foco de teclado revela el panel.

## Concepto

En App Router, la página de post es un Server Component que prepara datos y renderiza `RichText`. El índice lateral es Client Component porque necesita `IntersectionObserver` para saber qué heading está activo en el viewport. El CSS hace el cambio de estado visual del TOC sin agregar estado React: el panel se mantiene compacto por defecto y se expande solo por interacción (`hover` o foco).

## Verificación esperada

QA debe revisar un post largo con muchos headings en desktop y móvil:

- El artículo debe verse centrado y sin overflow horizontal.
- El TOC lateral debe permanecer compacto hasta hacer hover/focus.
- El TOC expandido debe scrollear internamente cuando no cabe en el alto del navegador.
- El `code` inline debe distinguirse claramente del texto normal.
- Los bloques del post deben tener separación cómoda entre párrafos, imágenes, listas, callouts y bloques de código.
