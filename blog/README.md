# blog — josetejero.com (Next.js + Payload)

La app del blog/portafolio. Next.js App Router + Payload CMS v3 + Lexical + Tailwind + PostgreSQL.

## Stack

- **Next.js 16** (App Router) con **Payload CMS v3** embebido (admin en `/admin`)
- **PostgreSQL** gestionada por Payload (no Prisma)
- Cuerpo de posts = rich text **Lexical**
- **Tailwind CSS v4** para estilos
- Gestor: **pnpm**
- Self-hosted en VPS (`output: 'standalone'`)

## Mapa

- `AGENTS.md` — contexto canónico del proyecto (léelo primero)
- `app/` — rutas del App Router de Next.js
  - `(payload)/` — rutas de Payload (admin, API REST, GraphQL)
  - `(frontend)/` — sitio público
- `payload.config.ts` — configuración de Payload (colecciones, editor, DB)
- `docs/` — ADR, arquitectura, agent-notes y runbooks
- `design/` — handoff visual (tokens, componentes, screenshots)

## Cómo correr en local

### Requisitos

- **Node.js** >= 20.9.0
- **pnpm** >= 9
- **Docker** (para Postgres en desarrollo)

### 1. Instalar dependencias

```bash
cd blog
pnpm install
```

### 2. Levantar PostgreSQL

```bash
docker compose up -d postgres
```

Esto arranca Postgres 17 en `localhost:5432` con:
- Usuario: `blog`
- Password: `blog_dev`
- Base de datos: `blog_dev`

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

El `.env.example` ya contiene los valores de desarrollo. Para producción, cambia
`PAYLOAD_SECRET` por un valor largo y aleatorio, y `DATABASE_URL` por tu conexión real.

### 4. Generar tipos e import map

```bash
pnpm generate:importmap
pnpm generate:types
```

### 5. Arrancar el servidor de desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver el frontend.
Abre [http://localhost:3000/admin](http://localhost:3000/admin) para crear tu primer usuario de Payload.

### 6. Build de producción

```bash
pnpm build
pnpm start
```

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo Next.js |
| `pnpm build` | Build de producción (`output: standalone`) |
| `pnpm start` | Arrancar build de producción |
| `pnpm payload` | CLI de Payload |
| `pnpm generate:types` | Generar payload-types.ts |
| `pnpm generate:importmap` | Generar import map de Payload |

## Docker

El `docker-compose.yml` solo incluye Postgres para desarrollo local. La app en sí
no está dockerizada todavía — el deploy usa `output: 'standalone'` de Next.js.
Ver `docs/runbooks/deploy.md`.
