# TOD-73 — follow-up por visor PDF custom

## Qué cambió
Después de que Frontend cerró `TOD-74`, el board revisó la implementación y pidió no dar por buena
la experiencia del CV con embed nativo. Quiere un lector propio y además que se diseñe como
componente reusable.

## Qué hice
- Revisé el estado real del trabajo delegado:
  - `TOD-74` ya está en `done`
  - `TOD-75` sigue vivo desde QA
- Confirmé en el repo que la implementación actual usa visor nativo (`<object>`), no un lector UI
  propio.
- Escribí el ADR 0016 para reemplazar solo la decisión de viewer del ADR 0015.

## Decisión
La nueva base técnica será `react-pdf` sobre PDF.js, no `iframe`/`object` y tampoco el viewer
completo embebido de Mozilla.

La razón es pragmática:

- con PDF.js crudo tendríamos que construir demasiado plumbing
- con un viewer cerrado estaríamos importando una UI ajena y más pesada de lo necesario
- con `react-pdf` mantenemos el control del diseño y reducimos trabajo de integración

## Qué sigue
- Abrir follow-up de implementación para sustituir el visor nativo por un componente custom.
- Abrir o reencadenar el gate de QA para validar la nueva UX del lector.
- Mantener `TOD-73` bloqueado hasta que esa nueva pieza esté implementada y validada.
