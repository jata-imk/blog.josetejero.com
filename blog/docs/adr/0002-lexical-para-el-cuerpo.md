# 0002 — Lexical como formato del cuerpo de los posts

- Estado: aceptada
- Fecha: 2026-06-16
- Decidido por: board (José)

## Contexto
El cuerpo de los posts necesita rich text con código, imágenes, callouts y diagramas. El blog
anterior usaba Markdown. Hay que decidir el formato de almacenamiento del contenido.

## Opciones consideradas
- **Lexical (editor nativo de Payload v3)** — editor WYSIWYG integrado, extensible con bloques
  custom y nodos. Almacena un árbol JSON. Contra: importar el Markdown viejo requiere un conversor.
- **Markdown / MDX** — simple y portable. Contra: peor experiencia de edición en el admin, y los
  bloques ricos (Callout, uploads) quedan fuera del flujo de Payload.

## Decisión
El cuerpo se almacena como **rich text Lexical**. El código usa el **nodo built-in** de Lexical;
el resaltado (Shiki), el tema oscuro y el botón de copiar son **RENDER en el frontend**, no datos.

## Consecuencias
- Más fácil: edición rica en el admin, bloques custom, uploads de imágenes en línea.
- Más difícil: la migración del blog Astro/MD viejo necesita un importador MD → Lexical (la pieza
  más peluda del proyecto; ver `docs/runbooks/importer.md`). Separar render de datos mantiene el
  contenido limpio y portable.
