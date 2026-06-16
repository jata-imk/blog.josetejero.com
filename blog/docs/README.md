# Documentación del proyecto

Puerta de entrada a la documentación de `blog/`. Esta carpeta es la **ventana de José** al proyecto:
como no escribe código, aquí entiende qué se decidió y por qué.

## Índice

- **`adr/`** — Architecture Decision Records. Toda decisión de arquitectura vive aquí.
  - `template.md` — plantilla (Contexto / Opciones / Decisión / Consecuencias).
  - `0001-payload-como-capa-de-datos.md`, `0002-lexical-para-el-cuerpo.md`, `0003-callout-unico-bloque-custom.md`.
- **`architecture/`** — visión del sistema.
  - `overview.md` — el sistema completo de un vistazo.
  - `data-model.md` — las colecciones de Payload.
  - `content-flow.md` — cómo entra el contenido (importación del blog viejo + creación directa).
- **`agent-notes/`** — cada agente deja `YYYY-MM-DD-<agente>-<tarea>.md` con "qué hice y por qué".
- **`runbooks/`** — procedimientos operativos: `deploy.md`, `importer.md`.

## Reglas
- Decisión de arquitectura sin ADR = tarea **no terminada**.
- Tarea no trivial sin agent-note = tarea **no terminada**.
