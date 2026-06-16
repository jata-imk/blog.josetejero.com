# blog — josetejero.com (Next.js + Payload)

La app del blog/portafolio. **El scaffolding (Next + Payload + Postgres) lo crea el Engineer en la
Fase 2**; por ahora esta carpeta contiene la documentación y el diseño que guían esa construcción.

## Mapa
- `AGENTS.md` — contexto canónico del proyecto (léelo primero).
- `design/` — el handoff de Claude Design, los tokens y el inventario de componentes.
- `docs/` — ADR, arquitectura, agent-notes y runbooks.
- `src/`, `payload.config.ts`, `docker-compose.yml` — aparecen cuando el Engineer haga el scaffolding.

## Cómo correr en local
_Pendiente: lo documenta el Engineer al hacer el scaffolding (pnpm + Docker para Postgres)._

## Stack
Next.js (App Router) + Payload CMS v3 + Lexical + Tailwind + PostgreSQL. Gestor: pnpm.
Self-hosted en VPS (Docker + Caddy + Cloudflare).
