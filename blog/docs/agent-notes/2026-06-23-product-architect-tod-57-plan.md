# TOD-57 — Plan de arquitectura para serializador Lexical y página de post

## Qué hice
Definí el contrato arquitectónico para la página de post y convertí el issue en trabajo ejecutable
para Engineer y Frontend.

## Decisiones clave
- La ruta canónica del detalle sigue siendo `app/(frontend)/blog/[slug]/page.tsx`. El texto del
  issue que menciona `posts/[slug]` queda corregido por ADR 0009 y no debe implementarse.
- `lib/lexical` se trata como una pipeline server-first: renderiza Lexical a React y deriva datos
  efímeros como la TOC, sin persistir nada extra en Payload.
- `seriesOrder` sigue siendo solo el criterio de orden de una serie. La posición visible `N de M`
  se calcula al renderizar y no abre ningún cambio de modelo.
- La página de post solo compone shells y datos provenientes de `lib/data`; no debe mezclar queries
  directas con lógica inline de serialización.

## Artefactos
- ADR: `docs/adr/0012-serializacion-y-composicion-de-post.md`
- Plan del issue `TOD-57`: documento `plan`

## Subtareas abiertas
- Engineer: cerrar la pipeline de `lib/lexical` y completar los derivados server-side del body.
- Frontend: componer la pantalla final del post con TOC, author, navegación contextual y ajuste
  responsive contra el handoff.

## Riesgos que dejé cerrados
- No implementar una segunda ruta `posts/[slug]`.
- No persistir TOC ni posición visible de serie.
- No duplicar converters o consultas dentro de la página.

## Siguiente paso
Seguir la ejecución en las subtareas hijas; este issue padre ya queda resuelto como trabajo de
arquitectura y desglose.
