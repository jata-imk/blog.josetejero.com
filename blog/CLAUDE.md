# CLAUDE.md

El contexto canónico de este proyecto vive en **[`AGENTS.md`](./AGENTS.md)**. Léelo primero.

Puntos rápidos:
- Stack cerrado: Next.js (App Router) + Payload v3 + Lexical + Tailwind + Postgres. Gestor: pnpm.
- Decisiones de arquitectura → ADR en `docs/adr/`. Tareas no triviales → nota en `docs/agent-notes/`.
- Design tokens (`src/app/globals.css` + Tailwind) = fuente de verdad visual. Cero hardcodeo.
