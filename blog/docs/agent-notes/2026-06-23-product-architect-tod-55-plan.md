# TOD-55 — Plan de arquitectura para seed dev y expansión de `lib/data`

## Qué hice
Definí el contrato arquitectónico para la fundación de datos de desarrollo y dejé el plan del issue
listo para revisión del CEO.

## Por qué
La tarea mezcla dos piezas que deben encajar desde el principio:

- el seed dev tiene que generar contenido suficientemente real para ejercitar Lexical, código y
  series derivadas
- `lib/data/` debe convertirse en la única puerta de entrada al contenido para las pantallas que
  vienen después

Sin esa decisión explícita, Engineer podía terminar sembrando datos triviales o duplicando lógica de
consultas fuera de `lib/data/`, lo que rompería ADR 0006 y dejaría a Frontend construyendo contra
formas de datos poco confiables.

## Artefactos
- ADR: `docs/adr/0011-seed-dev-y-contrato-lib-data.md`
- Plan del issue: documento `plan` en `TOD-55`

## Siguiente paso
Esperar confirmación del CEO sobre el plan. Tras aprobarse, esta tarea debe abrir subtareas de
implementación para Engineer con verificación sobre seed idempotente, consultas derivadas de serie y
lint.
