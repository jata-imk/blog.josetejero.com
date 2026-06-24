# 0012 — Serialización Lexical y composición canónica de la página de post

- Estado: aceptada
- Fecha: 2026-06-23
- Decidido por: Product Architect

## Contexto
`TOD-57` es la pieza keystone que convierte el `body` Lexical de Payload en la pantalla pública de
detalle de post. El proyecto ya cerró varias decisiones que este trabajo no puede reinterpretar:

- la ruta canónica del detalle real es `/blog/[slug]` (ADR 0009)
- Payload v3 es la única capa de datos; las páginas consumen `lib/data`, no `payload.find` directo
- `Callout` es el único bloque custom y su contrato ya está fijado (ADR 0010)
- Shiki + copiar son render de frontend, no parte del dato
- la posición visible de serie se deriva; no se persiste como `position`

Hoy existe una versión parcial de `app/(frontend)/blog/[slug]/page.tsx` y del converter de
`lib/lexical`, pero el issue mezcla responsabilidades y deja ambigüedades prácticas:

- pide `posts/[slug]`, pero la arquitectura aceptada exige `blog/[slug]`
- mezcla la traducción Lexical → React con la maqueta final de la página
- no explicita qué piezas deben resolverse en servidor y cuáles en cliente
- necesita una salida reutilizable para TOC, imágenes, código, callouts y navegación de serie sin
  crear una segunda representación persistida del contenido

## Opciones consideradas
- **Resolver todo dentro de `page.tsx` con converters inline y lógica de composición local.**
  Parece rápido para cerrar una sola página, pero acopla render, extracción de TOC, navegación de
  serie y resaltado de código a una ruta concreta. Complica testear, reutilizar y explicar la
  frontera Server/Client.
- **Separar un pipeline server-first en `lib/lexical` y dejar `page.tsx` como composición de shells
  existentes.**
  Requiere diseñar mejor el contrato entre datos, serialización y componentes, pero preserva la
  arquitectura del proyecto y permite que Engineer y Frontend trabajen sobre una interfaz pequeña.

## Decisión
Se adopta la segunda opción.

Contrato de implementación para `TOD-57`:

- La ruta pública canónica sigue siendo `app/(frontend)/blog/[slug]/page.tsx`. Cualquier mención a
  `posts/[slug]` en el issue se considera desactualizada y no reabre ADR 0009.
- `lib/lexical` se trata como una pipeline de render server-first con dos responsabilidades:
  transformar el JSON de Lexical en React usando converters tipados y derivar metadatos efímeros del
  documento cuando la página los necesite, empezando por la tabla de contenidos.
- La página de post orquesta datos y shells; no define converters inline ni rehace queries. Obtiene
  el post desde `getPostBySlug` y, si pertenece a una serie, deriva contexto adicional desde
  `lib/data` para calcular navegación y posición visible.
- El contenido anidado y el contenido principal usan la misma pipeline de rich text. `Callout`
  renderiza su `content` reutilizando `RichText` con los mismos converters.
- El resaltado de código ocurre en servidor antes del render del árbol React. La única hoja cliente
  asociada al código sigue siendo el botón copiar.
- La TOC se deriva del árbol Lexical al renderizar la página y se entrega a `TableOfContents` como
  una lista serializable de headings `h2`/`h3`; no se almacena en Payload.
- La navegación de serie usa el orden fuente `seriesOrder`, pero la posición visible (`N de M`) se
  deriva al localizar el post actual dentro de la lista ordenada. No se agrega ningún campo nuevo al
  modelo.
- Si falta alguna pieza visual del handoff, se compone con shells existentes o con una pieza mínima
  nueva en `components/post` o `components/series`; no se rehace la estética base.

## Consecuencias
- Más fácil: Engineer puede concentrarse en un contrato claro para serialización, TOC, media y
  contexto de serie sin invadir la maqueta final.
- Más fácil: Frontend compone la pantalla final reutilizando shells ya aprobados y una API pequeña.
- Más fácil: la explicación didáctica sobre Server vs Client queda alineada con el código real.
- Más difícil: hay que distinguir con cuidado entre “orden fuente” (`seriesOrder`) y “posición
  visible derivada” para no contaminar el modelo con otro campo.
- Deuda asumida: por ahora la pipeline solo deriva TOC y contexto de render inmediato. No se diseña
  una capa genérica de AST utilities hasta que aparezca otra necesidad real.
