# Runbook: deploy al VPS

## Objetivo

Desplegar la app Next.js + Payload CMS v3 en un VPS Debian 12 con CloudPanel instalado. Producción
usa el `docker-compose.yml` único del proyecto con el profile `prod`: `app` + `postgres`.
CloudPanel/Nginx solo publica HTTP/TLS y hace reverse proxy al contenedor de la app.

## Entornos

- Dev A, PC con Docker: `docker compose up -d postgres` y la app corre con `pnpm dev`.
- Dev B, PC sin Docker: la app corre con `pnpm dev` y la BD llega por túnel SSH al VPS.
- Dev en VPS: el mismo Compose levanta solo `postgres`; no necesita CloudPanel/Nginx.
- Prod, VPS: `COMPOSE_PROFILES=prod docker compose up -d` levanta app + PostgreSQL.

No existe un profile `dev`: el modo dev es el comportamiento por defecto del Compose, porque el
servicio `app` solo se activa con el profile `prod`.

## Esquema de producción

```text
navegador
  ↓
CloudPanel / Nginx
  ↓ proxy a 127.0.0.1:3000
Docker Compose profile prod
  ├─ app: Next.js standalone + Payload
  └─ postgres: PostgreSQL 17, red interna Docker, volumen persistente
```

PostgreSQL no debe exponer `5432` a Internet. Para administrar, desarrollar o construir con acceso
a BD remota, usa túnel SSH.

## Preparar el VPS

1. Instala Docker Engine y el plugin de Docker Compose en Debian 12.
2. Usa la raíz web del VPS para los clones:

```bash
sudo mkdir -p /var/www/html
sudo chown -R "$USER":"$USER" /var/www/html
```

3. Usa clones separados para evitar mezclar `.env`, nombres de contenedores y volúmenes:

```bash
/var/www/html/blog-dev
/var/www/html/blog-prod
```

## PostgreSQL dev en el VPS

Este entorno no usa CloudPanel/Nginx y no levanta la app en Docker. Solo levanta PostgreSQL cuando
lo necesites.

```bash
cd /var/www/html
git clone <URL_DEL_REPO> blog-dev
cd blog-dev/blog
cp .env.example .env
```

Configura `.env` dev:

```env
COMPOSE_PROJECT_NAME=jt_blog_dev
DATABASE_URL=postgresql://blog_dev:change_me_dev_password@localhost:5433/blog_dev
POSTGRES_DB=blog_dev
POSTGRES_USER=blog_dev
POSTGRES_PASSWORD=change_me_dev_password
POSTGRES_BIND=127.0.0.1
POSTGRES_PORT=5433
PAYLOAD_SECRET=dev-secret-local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Levanta solo PostgreSQL:

```bash
docker compose up -d postgres
docker compose ps
```

Desde tu PC local, abre el túnel SSH:

```bash
ssh -N -L 5433:127.0.0.1:5433 usuario@tu-vps
```

En el `.env` local de Windows usa:

```env
DATABASE_URL=postgresql://blog_dev:change_me_dev_password@localhost:5433/blog_dev
PAYLOAD_SECRET=dev-secret-local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Cuando termines de usar dev:

```bash
docker compose down
```

Eso apaga el contenedor y conserva el volumen de datos. Para resetear la BD dev completa:

```bash
docker compose down -v
```

## Producción en el VPS

1. Clona el repo en el directorio de producción:

```bash
cd /var/www/html
git clone <URL_DEL_REPO> blog-prod
cd blog-prod/blog
cp .env.example .env
```

2. Ajusta `.env` para producción:

```env
COMPOSE_PROJECT_NAME=jt_blog_prod
COMPOSE_PROFILES=prod
APP_IMAGE=ghcr.io/tu-usuario/josetejero-blog:latest
DATABASE_URL=postgresql://blog_prod:change_me_prod_db_password@postgres:5432/blog_prod
POSTGRES_DB=blog_prod
POSTGRES_USER=blog_prod
POSTGRES_PASSWORD=change_me_prod_db_password
PAYLOAD_SECRET=change_me_long_random_payload_secret
NEXT_PUBLIC_SITE_URL=https://josetejero.com
APP_BIND=127.0.0.1
APP_PORT=3000
```

No subas `.env` al repo.

## Build en GitHub Actions

El camino recomendado es construir la imagen en GitHub Actions, con acceso a PostgreSQL por túnel
SSH para que ISR pueda prerenderizar posts publicados. La imagen resultante se publica en un
registry, por ejemplo GHCR, y el VPS solo hace pull.

Variables necesarias durante el build:

```env
DATABASE_URL=postgresql://blog_prod:...@localhost:5433/blog_prod
PAYLOAD_SECRET=...
NEXT_PUBLIC_SITE_URL=https://josetejero.com
```

Si el build se ejecuta dentro de Docker, asegúrate de que el contenedor de build pueda alcanzar el
puerto local del túnel SSH. En runners Linux normalmente se resuelve con build network `host` o una
configuración equivalente del action de Docker.

## Primer deploy en el VPS

Desde `blog/` en el VPS:

```bash
docker compose pull app
docker compose up -d
```

Verifica que los contenedores estén sanos:

```bash
docker compose ps
docker compose logs -f app
```

## CloudPanel / Nginx

En CloudPanel, crea o edita el sitio de `josetejero.com` y configura el vhost para proxy al puerto
local de la app:

```nginx
location / {
  proxy_pass http://127.0.0.1:3000;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

Si cambias `APP_PORT`, actualiza también el `proxy_pass`.

## ISR

El frontend público usa ISR (`revalidate = 3600`) y `/blog/[slug]` vuelve a usar
`generateStaticParams`. Esto favorece SEO porque Next puede entregar HTML prerenderizado y
regenerarlo después.

El build necesita acceso a PostgreSQL para prerenderizar los slugs publicados. En GitHub Actions,
abre un túnel SSH al VPS y ejecuta el build con una `DATABASE_URL` que apunte al puerto local del
túnel. El `Dockerfile` acepta `DATABASE_URL`, `PAYLOAD_SECRET` y `NEXT_PUBLIC_SITE_URL` como build
args; esos valores se usan solo en la etapa `builder`.

No uses la base de producción para experimentos de desarrollo. Para builds reales de producción,
puedes apuntar a `blog_prod` si el objetivo es prerenderizar contenido publicado real.

## Desarrollo local con BD dev en el VPS

Crea una base separada de producción, por ejemplo `blog_dev`, con usuario propio. No uses
`blog_prod` para `pnpm dev`.

Abre un túnel SSH desde la PC local:

```bash
ssh -N -L 5433:127.0.0.1:5433 usuario@tu-vps
```

En `.env` local:

```env
DATABASE_URL=postgresql://blog_dev:change_me_dev@localhost:5433/blog_dev
PAYLOAD_SECRET=your-local-payload-secret-here
```

Luego:

```bash
pnpm dev
```

## Migraciones

En desarrollo, crea migraciones con:

```bash
pnpm migrate:create nombre-de-cambio
pnpm migrate
```

En producción, aplica migraciones antes de considerar completo el deploy. No dependas de seed ni
auto-push en producción: el seed es solo para `NODE_ENV !== 'production'`.

## Backups

Antes de cambios importantes:

```bash
docker compose exec postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup-blog-prod.sql
```

También debes respaldar el volumen `payload_media`, porque ahí viven los uploads locales de Payload.

## Checklist post-deploy

- Home, blog index, post, serie, tag, categoría y búsqueda renderizan.
- `/admin` carga y permite login.
- Crear/editar un post funciona.
- Subir una imagen a `Media` funciona y persiste tras reiniciar contenedores.
- Los bloques de código renderizan con Shiki y botón copiar.
- Nginx sirve `josetejero.com` con HTTPS.
- PostgreSQL no acepta conexiones públicas directas.
