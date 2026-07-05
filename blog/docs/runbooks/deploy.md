# Runbook: deploy al VPS

## Objetivo

Desplegar la app Next.js + Payload CMS v3 en un VPS Debian 12 con CloudPanel instalado. Producción
usa el `docker-compose.yml` único del proyecto con el profile `prod`: `app` + `postgres`.
CloudPanel/Nginx solo publica HTTP/TLS y hace reverse proxy al contenedor de la app.

## Entornos

Hay **tres entornos**:

1. **Local completo** — todo en tu PC. `docker compose up -d postgres` levanta PostgreSQL en Docker
   y la app corre con `pnpm dev` (recomendado por el HMR). Si quisieras validar la imagen de prod en
   local, puedes levantar además el servicio `app` con el profile `prod`.
2. **Híbrido** — Next.js corre en tu PC con `pnpm dev` y la BD PostgreSQL vive en Docker en el VPS,
   accesible por **túnel SSH**. Es el flujo de desarrollo habitual desde Windows.
3. **Producción** — app + PostgreSQL, **ambos en Docker en el VPS** con el profile `prod`.
   CloudPanel/Nginx hace reverse proxy al contenedor de la app.

No existe un profile `dev`: el modo dev es el comportamiento por defecto del Compose, porque el
servicio `app` solo se activa con el profile `prod`.

> **Schema por entorno.** En local completo e híbrido (dev, `NODE_ENV !== 'production'`) el schema se
> sincroniza solo por el `push` del adaptador Postgres al arrancar `pnpm dev` — **no migres en dev**.
> En producción `push` está desactivado: el schema se crea aplicando migraciones (ver ADR
> [0027](../adr/0027-migraciones-y-seed-para-produccion.md)).

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

## Build en el VPS (alternativa sin CI)

El ADR [0021](../adr/0021-deploy-vps-cloudpanel-docker-compose.md) marca CI/GHCR como camino
**preferente**, pero no lo obliga. Si no quieres montar GitHub Actions ni un registry, puedes
construir la imagen **en el mismo VPS**, porque ahí PostgreSQL ya está a mano (publicado en
`127.0.0.1:5432`).

> **`docker build` con host `postgres` falla en el VPS.** Durante el build no existe la red de
> Compose, así que el nombre de servicio `postgres` no se resuelve (`getaddrinfo ENOTFOUND
> postgres`). La solución es construir con `--network host` y una `DATABASE_URL` que apunte a
> `localhost:5432` (el puerto publicado en el host). `--network host` **solo funciona en Linux**
> (el VPS), no en Docker Desktop de Windows/Mac.

> **`docker build` no arranca nada.** Solo *crea la imagen*. Si después de construir haces
> `docker compose ps` y solo ves `postgres`, es normal: falta `docker compose up -d` para
> **arrancar** la app.

> **Cuida el tag (`APP_IMAGE`).** Si construyes con `-t josetejero-blog:local` pero el `.env`
> tiene `APP_IMAGE=ghcr.io/...`, `docker compose up -d` intentará hacer *pull* de esa imagen
> (inexistente) en vez de usar la local. Comenta `APP_IMAGE` (usa el default
> `josetejero-blog:local`) o construye con `-t` igual al valor de `APP_IMAGE`.

Secuencia completa desde `blog/` en el VPS:

```bash
cd /var/www/html/blog-prod/blog

# 1. Levanta solo PostgreSQL
docker compose up -d postgres

# 2. Migra primero (las tablas deben existir para que generateStaticParams prerenderice)
DATABASE_URL='postgresql://USUARIO:PASS@localhost:5432/DB' pnpm payload migrate

# 3. Construye la imagen con red host y DATABASE_URL a localhost (NO "postgres")
docker build --network host \
  --build-arg 'DATABASE_URL=postgresql://USUARIO:PASS@localhost:5432/DB' \
  --build-arg 'PAYLOAD_SECRET=TU_SECRET' \
  --build-arg 'NEXT_PUBLIC_SITE_URL=https://josetejero.com' \
  -t josetejero-blog:local .

# 4. Arranca la app (usa la imagen recién construida)
docker compose up -d
```

> **Gotcha de shell: contraseñas con `&`, `*`, `$`.** En bash, `&` significa "ejecuta en segundo
> plano" y `*` es comodín, así que una contraseña sin comillas **parte el comando** y produce el
> engañoso `docker: 'docker buildx build' requires 1 argument` (se pierde el `.` del contexto).
> **Entrecomilla siempre con comillas simples** toda `DATABASE_URL` y todo `--build-arg` que lleve
> la contraseña, tal como se muestra arriba.

> **El build NO debe sembrar datos de prueba en la BD.** El `onInit` de `payload.config.ts` corre
> `seedDev()` (usuarios `*@test.local`, posts de ejemplo, catálogos) salvo que
> `NODE_ENV === 'production'`. Por eso la etapa `builder` del `Dockerfile` **define
> `ENV NODE_ENV=production`**: sin eso, construir contra la BD de prod (ISR) la contamina con datos
> de prueba. Tras un build contra prod, revisa que en los logs **no** aparezcan líneas `[seed] ...`.
> Si ves datos de prueba en prod, resetea: `docker compose down -v` → `up -d postgres` → `migrate`
> → rebuild → `up -d`.

> **Rebuild "exitoso" pero las páginas siguen con datos viejos → caché de capas de Docker.**
> `docker build` cachea la capa `RUN pnpm build` (`Dockerfile` línea ~24) según el código copiado
> (`COPY . .`) y los valores de `ARG`/`ENV` (`DATABASE_URL`, `PAYLOAD_SECRET`,
> `NEXT_PUBLIC_SITE_URL`). Si el código no cambió y pasas los **mismos** `--build-arg` de siempre,
> Docker reutiliza la capa cacheada y **`next build` nunca se vuelve a ejecutar**, aunque el comando
> `docker build` termine "bien". El contenido de la BD en vivo (categorías/tags/series/posts nuevos)
> no es un input que Docker pueda ver — solo mira archivos y argumentos, así que agregar contenido
> sin tocar código **no invalida el caché** y las páginas estáticas (`/categorias`, `/series`,
> `/tags/[slug]`, sin `searchParams`) siguen sirviendo el HTML horneado de la build anterior.
>
> Si rebuildeaste solo para reflejar contenido nuevo (sin cambios de código), agrega `--no-cache`:
> ```bash
> docker build --no-cache --network host \
>   --build-arg 'DATABASE_URL=...' --build-arg 'PAYLOAD_SECRET=...' \
>   --build-arg 'NEXT_PUBLIC_SITE_URL=https://josetejero.com' \
>   -t josetejero-blog:local .
> docker compose up -d --force-recreate
> ```
> Confirma con `curl -sI http://127.0.0.1:3000/categorias | grep -i x-nextjs-cache` — debe dejar de
> decir `HIT` del build viejo.

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

CloudPanel/Nginx solo publica HTTP/TLS y hace reverse proxy al contenedor de la app (que corre en
Docker, **no** bajo el runtime Node de CloudPanel).

### Paso a paso

1. **DNS.** Antes de nada, apunta el registro `A` de `josetejero.com` (y `www` si lo usas) a la IP
   pública del VPS. Sin esto, ni el acceso por dominio ni Let's Encrypt funcionan.

2. **Verifica que la app escuche en el host.** Con `APP_BIND=127.0.0.1` y `APP_PORT=3000`, el
   contenedor publica en `127.0.0.1:3000`. Confírmalo antes de montar el proxy:

   ```bash
   curl -I http://127.0.0.1:3000    # debe responder 200/307/308
   ```

3. **Crea el sitio en CloudPanel.** Sites → **Add Site → "Create a Reverse Proxy"**:
   - **Domain name:** `josetejero.com` (añade también `www.josetejero.com` si aplica).
   - **Reverse Proxy URL:** `http://127.0.0.1:3000`.
   - CloudPanel genera el vhost Nginx con el `proxy_pass` y las cabeceras. Usa la plantilla
     **Reverse Proxy**, no la de Node.js (la app vive en Docker).

4. **Confirma las cabeceras del vhost.** Si editas el vhost, verifica que el bloque incluya:

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

   `X-Forwarded-Proto` es clave para que Payload sepa que la petición llegó por HTTPS. Si cambias
   `APP_PORT`, actualiza también el `proxy_pass`.

5. **SSL/TLS.** En el sitio → **SSL/TLS → New Let's Encrypt Certificate**. CloudPanel emite el
   certificado y fuerza HTTPS. (Requiere que el DNS del paso 1 ya resuelva a la IP del VPS).

6. **Prueba.** Abre `https://josetejero.com` (home) y `https://josetejero.com/admin` (crear el
   primer usuario admin de Payload).

> **No expongas Postgres.** El proxy solo toca el `:3000` de la app; PostgreSQL sigue en la red
> interna de Docker / `127.0.0.1` y no acepta conexiones públicas.

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

## Primer arranque de la app (schema + admin + catálogos)

Una **base de datos nueva** necesita tres cosas antes de tener un blog usable: el **schema** (tablas),
el **primer usuario admin** y los **catálogos** (categorías, tags, series). El cómo cambia según el
entorno.

### Local completo e híbrido (dev)

No hay que migrar: el `push` de dev crea el schema al arrancar `pnpm dev`. Además, el seed de dev
(`lib/seed.ts`, vía `onInit`) crea automáticamente usuarios de prueba (`admin@test.local`) y posts de
ejemplo — solo en `NODE_ENV !== 'production'`. Si además quieres los **catálogos reales**:

```bash
pnpm seed:catalog   # idempotente: se puede correr varias veces sin duplicar
```

### Producción (todo en Docker)

En prod `push` está desactivado y el seed de dev **no** corre. La imagen de la app es `standalone`
(Next empaqueta solo lo justo para correr `server.js`): **no incluye `pnpm` ni el CLI de Payload**, así
que `pnpm payload migrate` y `pnpm seed:catalog` **no se pueden ejecutar dentro del contenedor `app`**.

Conviene tener claro que en el VPS hay **dos copias del código**, y no se pisan:

- **La imagen Docker** — trae el código "horneado" en el build; es lo que *corre* la app. `docker
  compose up` solo la enciende, no copia nada del disco del VPS.
- **El repo clonado** (`/var/www/html/blog-prod/blog`) — aporta `docker-compose.yml` y `.env`, y si le
  haces `pnpm install`, además te da el CLI de Payload. Solo comparte con el contenedor la **base de
  datos**, nada más.

**Decisión (ADR [0027](../adr/0027-migraciones-y-seed-para-produccion.md)): las migraciones y el seed se
corren con el CLI de Payload contra la BD del VPS.** Hay dos maneras válidas de dar ese CLI, según
dónde tengas Node/pnpm instalados:

- **Desde el host del VPS** (fuera de Docker): requiere Node ≥ 20.9 y pnpm en el VPS, y `pnpm install`
  hecho en el checkout. `DATABASE_URL` usa `localhost:5432` (el puerto publicado en el host).
- **Desde tu PC, por túnel SSH** (recomendado si el VPS no tiene Node instalado): abre el túnel
  (`ssh -N -L 5432:127.0.0.1:5432 usuario@tu-vps`, ajusta el puerto local si ya usas `5433` para dev) y
  corre el CLI en tu PC con `DATABASE_URL` apuntando al puerto del túnel (`localhost:5432` o el que
  elijas). El resultado es el mismo: el CLI solo necesita alcanzar la BD por red, da igual desde qué
  máquina.

En ambos casos, **nunca** uses el nombre de servicio Docker `postgres` en la `DATABASE_URL` del CLI —
solo resuelve dentro de la red interna del contenedor `app`. Pasa la `DATABASE_URL` en línea al
comando, sin depender del `.env` del VPS (que sí apunta a `postgres:5432`, para el contenedor).

> **`NODE_ENV=production` es obligatorio al correr el CLI desde tu PC.** `payload run` (usado por
> `seed:catalog`) llama a `getPayload()`, que dispara el `onInit` de `payload.config.ts`. Ese hook solo
> se salta el seed de dev (`seedDev()`, usuarios `*@test.local` y posts falsos) cuando
> `NODE_ENV === 'production'`. En tu PC, sin ese flag, `NODE_ENV` no es `production` → **`seed:catalog`
> siembra el catálogo real Y el seed de dev a la vez**, contaminando la BD de prod. Fija siempre
> `NODE_ENV=production` en la misma sesión antes de `pnpm payload migrate` o `pnpm seed:catalog`.

> **Sintaxis por shell.** Los comandos de este runbook usan sintaxis bash
> (`VAR=valor comando`). En **PowerShell** (Windows) esa forma no existe: fija cada variable con
> `$env:VAR = 'valor'` en una línea aparte, antes del comando. Las contraseñas con `&`, `$`, backtick
> (`` ` ``) van también entre comillas simples en PowerShell — evita comillas dobles, que sí interpolan.

> **El orden importa: proxy/SSL antes del primer admin.** El first-user de Payload se crea entrando a
> `/admin`, y `NEXT_PUBLIC_SITE_URL=https://josetejero.com` ya asume HTTPS — Payload valida cookies/CSRF
> con la cabecera `X-Forwarded-Proto`. Monta el reverse proxy + DNS + SSL de CloudPanel (sección
> siguiente) **antes** de crear el admin; si abres `/admin` por HTTP o IP antes de tener el dominio con
> HTTPS, puede fallar el flujo first-user o dejarte con cookies mal configuradas.

Secuencia sobre una BD de prod vacía. Es **un solo** `docker-compose.yml` con dos servicios
(`postgres` + `app`); se levantan por pasos para migrar antes de exponer la app. Los pasos 2 y 5
(migrate, seed) se corren **desde donde tengas el CLI** — VPS o tu PC por túnel, ver arriba:

```bash
# --- en el VPS ---
# 1. Levanta solo PostgreSQL (el otro servicio, app, arranca en el paso 3)
docker compose up -d postgres
```

```powershell
# --- desde tu PC (PowerShell), por el túnel SSH abierto hacia el VPS ---
# 2. Migra el schema — NODE_ENV=production obligatorio (ver nota arriba)
$env:NODE_ENV = 'production'
$env:DATABASE_URL = 'postgresql://blog_prod:TU_PASSWORD@localhost:5432/blog_prod'
pnpm payload migrate
```

```bash
# --- en el VPS ---
# 3. Construye la imagen (ver sección "Build en el VPS") y arranca la app
docker compose up -d

# 4. Monta CloudPanel: DNS + reverse proxy + SSL (sección "CloudPanel / Nginx" más abajo)
```

```text
# 5. Abre https://josetejero.com/admin → crea el PRIMER usuario admin (flujo first-user de Payload)
```

```powershell
# --- desde tu PC (PowerShell), por el túnel SSH ---
# 6. Siembra los catálogos — MISMO $env:NODE_ENV y $env:DATABASE_URL del paso 2
#    (si es otra sesión de PowerShell, vuelve a fijarlos: no persisten entre ventanas)
$env:NODE_ENV = 'production'
$env:DATABASE_URL = 'postgresql://blog_prod:TU_PASSWORD@localhost:5432/blog_prod'
pnpm seed:catalog
```

> **Entrecomilla la `DATABASE_URL`.** Si la contraseña lleva caracteres especiales (`&`, `*`, `$`,
> backtick), usa comillas simples: en bash evita que el shell las interprete (`&` = segundo plano,
> `*` = comodín); en PowerShell evita la interpolación de `$`/backtick que sí ocurre con comillas dobles.

> **Acentos ilegibles en la consola de PowerShell (`Categor├¡a` en vez de `Categoría`).** Es solo la
> consola mostrando mal UTF-8, los datos en Postgres quedan correctos. Antes de correr el CLI:
> ```powershell
> [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
> chcp 65001
> ```

> También sirve un único `docker compose up -d` (levanta ambos servicios; la app espera a la BD por su
> `depends_on`). En ese caso la app puede loguear "tabla no existe" hasta que corras el paso 2; en un
> primer deploy, sin tráfico aún, es solo cosmético.

A partir de aquí ya puedes importar/redactar posts y asociarlos a los catálogos.

## Redeploy tras cambios de código

Tras el primer deploy, cada nuevo cambio de código sigue este flujo. No hace falta bajar la app: un
rebuild + `docker compose up -d` recrea el contenedor `app` porque cambió la imagen.

```powershell
# 0. SOLO si el cambio toca el schema — migra ANTES del build, porque ISR
#    prerenderiza páginas leyendo la BD durante el build. Desde tu PC (PowerShell) por
#    túnel — NODE_ENV=production obligatorio, ver nota arriba:
$env:NODE_ENV = 'production'
$env:DATABASE_URL = 'postgresql://blog_prod:TU_PASSWORD@localhost:5432/blog_prod'
pnpm payload migrate
```

```bash
# --- en el VPS ---
cd /var/www/html/blog-prod/blog
git pull                              # trae el código nuevo al checkout
docker compose up -d postgres         # asegura la BD arriba (la necesita el build para ISR)
docker build --network host \
  --build-arg 'DATABASE_URL=postgresql://blog_prod:TU_PASSWORD@localhost:5432/blog_prod' \
  --build-arg 'PAYLOAD_SECRET=TU_SECRET' \
  --build-arg 'NEXT_PUBLIC_SITE_URL=https://josetejero.com' \
  -t josetejero-blog:local .
docker compose up -d                  # recrea el contenedor app con la imagen nueva
docker compose logs -f app
```

### Bajar la app (sin perder datos)

- `docker compose stop app` — pausa el contenedor `app`; luego `docker compose start app` lo retoma.
- `docker compose down` — elimina los contenedores `app` + `postgres`, pero **conserva los volúmenes**
  (la BD y `payload_media` sobreviven). Sirve para un reinicio limpio antes de un rebuild.
- **`docker compose down -v` ⚠️ destruye los volúmenes** (BD y media). Úsalo solo si de verdad quieres
  borrar los datos y empezar de cero — no es parte del flujo normal de redeploy.

## Migraciones (cambios de schema posteriores)

En desarrollo, cuando el cambio de schema esté destinado a producción, genera su migración:

```bash
pnpm migrate:create nombre-de-cambio
```

Revisa el SQL generado y, en producción, aplica **antes** de dar por completo el deploy:

```bash
pnpm payload migrate
```

No dependas de seed ni auto-push en producción: el seed de dev es solo para `NODE_ENV !== 'production'`
y `push` está desactivado en prod.

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
