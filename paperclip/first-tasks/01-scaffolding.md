# Tarea 01 — Scaffolding Next + Payload v3 + Postgres

**Asignar a:** Engineer · **Depende de:** nada · **Tipo:** boilerplate

## Prompt para el issue
> Crea el scaffolding base de la app en `blog/`: Next.js (App Router) + Payload CMS v3 integrado
> (admin en `/admin`) + PostgreSQL en local vía Docker. Gestor de paquetes: **pnpm**.
>
> Requisitos:
> - Proyecto Next con App Router y TypeScript. **Tailwind v4** configurado (los design tokens se
>   cargan en la tarea 03; aquí solo deja Tailwind v4 instalado y funcionando).
> - Payload v3 embebido en la misma app Next; admin accesible en `/admin`.
> - `docker-compose.yml` que levante Postgres para desarrollo local.
> - Variables de entorno documentadas (`.env.example`): `DATABASE_URL`, `PAYLOAD_SECRET`, etc.
>   **Nunca** commitees secretos reales.
> - `output: 'standalone'` previsto para el deploy (no es necesario dockerizar la app aún).
> - Actualiza `blog/README.md` con los pasos exactos para correr en local (pnpm install, levantar
>   Postgres, migrar, dev server).
> - Documenta que el **dev server lo corre el board (o un proceso persistente), NO los agentes**:
>   los agentes (QA/Frontend) solo consumen `http://localhost:3000`. Ver
>   `blog/docs/runbooks/dev-server.md`. (Regla para no tirar el control plane de Paperclip.)
>
> Respeta `blog/AGENTS.md`. No agregues librerías de datos extra (Prisma está descartado).

## Done cuando
- `pnpm dev` levanta la app y `/admin` carga el setup de Payload.
- Postgres corre vía docker-compose y Payload conecta.
- `blog/README.md` permite a alguien nuevo correrlo siguiendo los pasos.
- **agent-note** en `blog/docs/agent-notes/` explicando la estructura del App Router y cómo Payload
  vive dentro de Next (pieza didáctica para José).
- QA verifica build + arranque.
