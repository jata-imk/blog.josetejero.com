# TOD-73 — plan y decisión para About + 404

## Qué hice
- Revisé el issue `TOD-73`, el handoff visual y las decisiones cerradas del proyecto.
- Confirmé que ya existen `AuthorCard`, `SkillChip`, `Btn`, `Header`, `Footer` y una primera
  versión de `app/(frontend)/not-found.tsx`.
- Detecté que el cambio relevante del scope no es visual sino de arquitectura mínima: el usuario
  pidió poder ver el CV dentro de la página y dejó abierta la puerta a más documentos públicos.
- Escribí el ADR 0015 para fijar de dónde sale el contenido de `/sobre-mi` y cómo se sirven esos
  documentos sin inventar una capa CMS nueva.

## Decisiones clave
- `/sobre-mi` queda estática por ahora, con contenido tipado en código y separado de la composición
  visual de la página.
- El CV deja de vivir como archivo ambiguo dentro de `app/` y pasa a una convención explícita de
  documentos públicos bajo `public/`.
- El visor del CV será el nativo del navegador embebido en la propia página. No hace falta una
  librería de PDF en esta fase.
- El `404` se trata como ajuste de composición sobre la ruta existente, no como una pantalla nueva
  con infraestructura propia.

## Por qué
Había dos riesgos si se implementaba directo:

1. Frontend podía hardcodear bio, links y documentos dentro del JSX de la página, dejando el About
   difícil de mantener.
2. El visor PDF podía terminar introduciendo una librería o un pseudo-CMS para resolver un problema
   que el navegador y `public/` ya cubren.

El ADR evita ambos excesos y deja una ruta pequeña pero extensible.

## Siguiente acción
- Subir el plan del issue con el reparto de trabajo y los criterios de aceptación por agente.
- Crear la subtarea de Frontend para implementación visual y la subtarea de QA para validación
  desktop/móvil, con dependencias explícitas.
