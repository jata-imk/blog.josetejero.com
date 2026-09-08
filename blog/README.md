# blog — josetejero.com (Next.js + Payload)

La app del blog/portafolio. Next.js App Router + Payload CMS v3 + Lexical + Tailwind + PostgreSQL.

## Stack

- **Next.js 16** (App Router) con **Payload CMS v3** embebido (admin en `/admin`)
- **PostgreSQL** gestionada por Payload (no Prisma)
- Cuerpo de posts = rich text **Lexical**
- **Tailwind CSS v4** para estilos
- Gestor: **pnpm**
- Producción self-hosted en **VPS Debian 12** con **Docker Compose app + PostgreSQL**
- **CloudPanel/Nginx** como reverse proxy; Cloudflare queda pendiente

## Mapa

- `AGENTS.md` — contexto canónico del proyecto (léelo primero)
- `app/` — rutas del App Router de Next.js
  - `(payload)/` — rutas de Payload (admin, API REST, GraphQL)
  - `(frontend)/` — sitio público
- `payload.config.ts` — configuración de Payload (colecciones, editor, DB)
- `docker-compose.yml` — Compose único: Postgres para dev y app+Postgres con profile `prod`
- `docs/` — ADR, arquitectura, agent-notes y runbooks
- `design/` — handoff visual (tokens, componentes, screenshots)

## Cómo correr en local sin Docker

### Requisitos

- **Node.js** >= 20.9.0
- **pnpm** >= 9
- Acceso SSH al VPS
- Una base PostgreSQL de **desarrollo** en el VPS

No uses la base de producción para desarrollo local. En `NODE_ENV !== 'production'`, Payload puede
ejecutar lógica de seed/dev.

### 1. Instalar dependencias

```bash
cd blog
pnpm install
```

### 2. Abrir túnel SSH a la BD de desarrollo

Ejemplo si PostgreSQL dev escucha en el VPS en `127.0.0.1:5433`:

```bash
ssh -N -L 5433:127.0.0.1:5433 usuario@tu-vps
```

Mantén esa terminal abierta mientras desarrollas.

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Configura `.env` para apuntar al puerto local del túnel:

```env
DATABASE_URL=postgresql://blog_dev:change_me_dev@localhost:5433/blog_dev
PAYLOAD_SECRET=your-local-payload-secret-here
```

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
Abre [http://localhost:3000/admin](http://localhost:3000/admin) para crear tu usuario de Payload.

## Opción local con Docker solo para PostgreSQL

En la máquina de desarrollo que sí tenga Docker, levanta solo PostgreSQL:

```bash
docker compose up -d postgres
```

La app sigue corriendo fuera de Docker con `pnpm dev`.

## Producción

Producción usa el mismo `docker-compose.yml` con el profile `prod`. En el VPS, copia
`.env.example` como `.env`, rellena secretos reales y activa:

```env
COMPOSE_PROJECT_NAME=jt_blog_prod
COMPOSE_PROFILES=prod
DATABASE_URL=postgresql://blog_prod:change_me_prod_db_password@postgres:5432/blog_prod
```

Resumen en el VPS cuando la imagen ya fue construida por GitHub Actions:

```bash
docker compose pull app
docker compose up -d
```

CloudPanel/Nginx debe hacer reverse proxy hacia `127.0.0.1:3000` o el `APP_PORT` configurado.

Para tener dev y prod en el mismo VPS sin mezclar volúmenes ni nombres de contenedores, usa clones
separados:

```bash
/var/www/html/blog-dev
/var/www/html/blog.josetejero.com
```

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo Next.js |
| `pnpm build` | Build de producción (`output: standalone`) |
| `pnpm start` | Arrancar build de producción fuera de Docker |
| `pnpm payload` | CLI de Payload |
| `pnpm migrate` | Ejecutar migraciones de Payload |
| `pnpm migrate:create <name>` | Crear una migración de Payload |
| `pnpm seed:catalog` | Sembrar catálogos (categorías, tags, series) — idempotente |
| `pnpm generate:types` | Generar `payload-types.ts` |
| `pnpm generate:importmap` | Generar import map de Payload |

## Primer arranque de la app

Para poner en marcha una base de datos nueva (schema + primer admin + catálogos), sigue la sección
**"Primer arranque de la app"** del runbook [`docs/runbooks/deploy.md`](docs/runbooks/deploy.md).
En dev el schema se crea solo por `push`; en producción se aplican migraciones y se corre
`pnpm seed:catalog`.
