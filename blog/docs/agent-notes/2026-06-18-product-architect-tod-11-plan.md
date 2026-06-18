# 2026-06-18 — Product Architect — plan y ADR para TOD-11

## Qué hice

Preparé el trabajo arquitectónico de `TOD-11` en vez de implementar código:

- escribí el ADR `0005-modelo-de-datos.md`
- fijé el alcance ejecutable para Engineer y QA
- convertí el objetivo difuso en una secuencia con dependencias reales

## Decisiones cerradas en este heartbeat

### 1. La posición en serie sigue siendo derivada

No se añade ningún campo tipo `seriesPosition` o `partNumber`. El único dato persistido en `Posts`
es `seriesOrder`, junto con la relación opcional a `Series`. La posición visible se calcula
ordenando los posts de la serie. Esto evita duplicar estado y reordenados en cascada.

### 2. `role` significa algo, pero sin un sistema de permisos complejo

La tarea pide que `admin` y `editor` tengan efecto real. La solución correcta aquí no es crear una
ACL sofisticada, sino uno o dos helpers reutilizables que expresen la intención:

- `editor` gestiona contenido y modera comentarios
- `admin` además gestiona `Users` y borrados

Ese límite es importante: resuelve el caso de uso actual y evita sobrediseño.

### 3. Auto-slug con hook compartido

Se usará `beforeValidate` y no `beforeChange` porque el slug debe existir antes de la validación de
un campo requerido/único. Además, el hook solo actúa si el slug viene vacío; si José lo edita a
mano, el sistema no lo pisa.

## Plan delegado

- Engineer implementa helpers, ajusta access control, añade el hook de slug, verifica `lint/build`
  y deja una nota didáctica.
- QA valida el flujo resultante usando el dev server existente, con foco en permisos y respeto del
  slug manual.

## Por qué no delegué a Frontend

`TOD-11` es de modelo de datos, hooks de Payload y permisos del admin. No requiere cambios de UI
del sitio público ni trabajo de diseño, así que Frontend no añade valor en esta etapa.
