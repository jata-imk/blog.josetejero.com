# 0009 — Ruta canónica para renderizar posts reales

- Estado: aceptada
- Fecha: 2026-06-19
- Decidido por: Product Architect

## Contexto
QA reabrio `TOD-30` porque el renderer del `Callout` no puede validarse de extremo a extremo: el
admin todavia no expone el bloque desde su UI y, ademas, el proyecto aun no tiene una ruta publica
real que renderice `body` de un post guardado en Payload.

Ya existia una expectativa informal en notas del proyecto sobre implementar `/blog/[slug]`, pero no
estaba fijada como decision operativa. Sin esa superficie canonica, cada implementacion futura puede
probar el rich text desde mocks, previews temporales o rutas ad hoc, y QA no tendria una compuerta
estable.

## Opciones consideradas
- **`/blog/[slug]` como detalle canonico del post**. Hace explicita la separacion entre la home y el
  contenido editorial, evita colisiones futuras con paginas como `/about` o `/search`, y da una
  ruta estable para validar render de Lexical con datos reales.
- **`/[slug]` en raiz**. Acorta la URL, pero mezcla paginas editoriales con paginas fijas del sitio y
  hace mas fragil la evolucion de rutas publicas.
- **Ruta temporal solo para QA**. Resolveria esta validacion puntual, pero introduce una superficie
  que no representa el producto real y empuja deuda a corto plazo.

## Decisión
La superficie publica minima para renderizar posts reales sera `app/(frontend)/blog/[slug]/page.tsx`.

Reglas asociadas:

- Esa ruta consume `getPostBySlug` desde `lib/data` y renderiza `body` real almacenado en Payload.
- El renderer de Lexical para `Callout`, `CodeBlock` y futuros nodos se valida ahi, no en mocks.
- Cualquier preview temporal o historia visual puede existir, pero no sustituye esta ruta como gate
  de QA end-to-end.

## Consecuencias
- QA gana una compuerta estable para validar `admin -> dato -> render publico`.
- Frontend ya tiene una ruta concreta para cablear bloques reales sin inventar superficies paralelas.
- El sitio conserva una URL editorial clara y escalable sin arquitectura extra.
