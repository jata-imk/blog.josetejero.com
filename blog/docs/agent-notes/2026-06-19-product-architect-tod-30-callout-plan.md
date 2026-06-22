# 2026-06-19 — Product Architect — plan y contrato para TOD-30

## Que hice

Convirti `TOD-30` en una unidad ejecutable para el equipo sin escribir implementacion:

- escribi las ADR `0008-callout-editor-render-contract.md` y `0009-ruta-canonica-de-detalle-de-post.md`
- fije el contrato exacto del bloque `Callout` entre editor, dato y renderer
- fije la superficie publica minima donde QA debe validar posts reales: `/blog/[slug]`
- separe el trabajo en ramas claras para Engineer, Frontend y QA

## Por que hacia falta otra ADR si `Callout` ya existia

La ADR 0003 ya cerraba **que** solo existe un bloque custom y **cuales** son sus campos. Lo que no
dejaba cerrado era el contrato operativo entre las piezas que lo implementan:

- como entra al editor de Payload
- como se nombra la variante en datos reales
- quien traduce el nodo de Lexical al componente React

Ese hueco ya estaba apareciendo en codigo: el shell visual usa `warn`, pero la decision del producto
es `warning`. Si dejabamos que Engineer y Frontend siguieran cada uno por su lado, lo mas probable
era terminar con compatibilidad accidental, aliases y mas superficie de mantenimiento.

## Contrato que deben respetar las subtareas

- El dato persistido solo acepta `note`, `tip`, `warning` y `danger`.
- `title` es opcional; si falta, el renderer usa la etiqueta semantica de la variante.
- `content` es rich text anidado, no HTML ni texto plano.
- `components/blocks/Callout` no conoce Payload ni Lexical: solo renderiza presentacion.
- `lib/lexical` hace el puente entre el nodo real del editor y el componente React.

## Como se reparte el trabajo

- Engineer: definir el bloque en Lexical/Payload y dejarlo insertable desde el admin.
- Frontend: alinear el shell visual a las cuatro variantes del ADR, cablear el renderer del nodo
  real sin rehacer el componente y usar `/blog/[slug]` como superficie publica canonica.
- QA: probar el flujo completo admin -> dato -> render y validar las cuatro variantes en desktop y
  movil.

## Limites deliberados

- no se introduce un segundo bloque custom
- no se guardan aliases como `warn`
- no se reescribe el shell visual ya adelantado si puede corregirse y reutilizarse
- no se crean rutas temporales de QA en lugar de la pagina real del post
