# 0010 — Contrato del `Callout` entre editor y renderer

> Nota: originalmente numerado 0008 por error (colisión con el ADR de CodeBlock).
> Renumerado a 0010 para mantener identificadores únicos.

- Estado: aceptada
- Fecha: 2026-06-19
- Decidido por: Product Architect

## Contexto
La ADR 0003 ya cerro que `Callout` es el unico bloque custom permitido en Lexical. Al aterrizar la
tarea de implementacion quedo una ambiguedad practica: el frontend ya adelanto un shell visual en
`components/blocks/Callout.tsx`, pero el editor de Payload todavia no expone el bloque y el renderer
de Lexical todavia no esta cableado al nodo real.

Si no fijamos el contrato ahora, Engineer y Frontend pueden divergir en nombres de variantes,
estructura del payload o punto de integracion. El rescope de la tarea ya detecto ese riesgo: el
shell actual usa `warn`, mientras la ADR 0003 exige `warning`, y ademas falta `danger`.

## Opciones consideradas
- Bloque custom tipado en Lexical/Payload + adapter de render a React. Mantiene un contrato unico de
  datos (`variant`, `title`, `content`), deja el admin alineado con el dato real y permite reusar el
  shell visual existente sin mezclar schema con presentacion.
- Resolverlo solo en presentacion con aliases o heuristicas. Parece mas rapido, pero deja el editor
  sin un contrato firme, introduce deuda (`warn` vs `warning`) y obliga a corregir datos o renderers
  despues.

## Decisión
El `Callout` se implementa como un bloque custom tipado en la configuracion de Lexical/Payload y se
renderiza a React mediante un adapter dedicado en `lib/lexical`.

Contrato obligatorio:

- `variant`: solo `note | tip | warning | danger`
- `title`: texto opcional
- `content`: rich text anidado

Reglas de integracion:

- El admin debe exponer exactamente esas cuatro variantes; no se aceptan aliases persistidos como
  `warn`.
- `components/blocks/Callout` sigue siendo un componente puramente presentacional.
- El adapter de `lib/lexical` es responsable de traducir el nodo/bloque de Lexical a
  `<Callout variant=...>...</Callout>`.
- El contenido anidado del callout se renderiza con la misma pipeline de rich text ya usada para el
  resto del body, sin crear una segunda representacion del contenido.

## Consecuencias
- Engineer y Frontend pueden trabajar en paralelo sobre un contrato unico y pequeño.
- El rename de `warn` a `warning` ocurre en origen, no como parche permanente de render.
- El renderer queda mas simple: decide presentacion, no sanea estados arbitrarios.
- Si mañana aparece otro bloque custom, necesitara una ADR nueva y un contrato equivalente en vez de
  crecer por imitacion accidental.
