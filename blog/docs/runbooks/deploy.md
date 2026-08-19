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

**Este es el flujo principal y ya está implementado** (ADR
[0033](../adr/0033-ci-cd-build-hermetico-y-deploy-automatico.md)): cada push a `main` construye la
imagen en GitHub Actions, la publica en GHCR y despliega al VPS por SSH. El pipeline completo,
su configuración (secrets, GHCR, clave SSH) y el troubleshooting están documentados en
**[ci-cd.md](./ci-cd.md)**.

El build es **hermético**: gracias al flag `BUILD_WITHOUT_DB=1` del `Dockerfile`, ya **no necesita
acceso a PostgreSQL** — ni túnel SSH ni `DATABASE_URL` real. El diseño anterior (túnel SSH desde el
runner hasta la BD del VPS) quedó obsoleto. Las páginas prerenderizadas nacen vacías en la imagen y
el job de warm-up del pipeline las regenera segundos después del deploy vía `POST /api/revalidate`.

## Build en el VPS (alternativa sin CI)

El ADR [0021](../adr/0021-deploy-vps-cloudpanel-docker-compose.md) marca CI/GHCR como camino
**preferente**, pero no lo obliga. Si no quieres montar GitHub Actions ni un registry, puedes
construir la imagen **en el mismo VPS**, porque ahí PostgreSQL ya está a mano (publicado en
`127.0.0.1:5432`).

> **El build ya no toca la BD** (build hermético, ADR 0033). Los gotchas históricos de
> `--network host` y `ENOTFOUND postgres` quedaron obsoletos: el `Dockerfile` define
> `BUILD_WITHOUT_DB=1` y ya no acepta `DATABASE_URL`/`PAYLOAD_SECRET` como build-args. El build
> funciona igual en el VPS, en tu PC o en CI, sin red y sin túnel.

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

# 2. SOLO si hay migraciones nuevas: migra ANTES de arrancar la app nueva
#    (NODE_ENV=production obligatorio — ver sección Migraciones)
NODE_ENV=production DATABASE_URL='postgresql://USUARIO:PASS@localhost:5432/DB' pnpm payload migrate

# 3. Construye la imagen — build hermético: sin --network host, sin credenciales de BD
docker build \
  --build-arg 'NEXT_PUBLIC_SITE_URL=https://josetejero.com' \
  --build-arg 'NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX' \
  -t josetejero-blog:local .

# 4. Arranca la app (usa la imagen recién construida)
docker compose up -d

# 5. Regenera el caché ISR — la imagen hermética nace con home/listados/sitemap/RSS vacíos
curl -X POST https://josetejero.com/api/revalidate -H "Authorization: Bearer TU_REVALIDATE_SECRET"
```

> **Gotcha de shell: contraseñas con `&`, `*`, `$`.** En bash, `&` significa "ejecuta en segundo
> plano" y `*` es comodín, así que una contraseña sin comillas **parte el comando** y produce el
> engañoso `docker: 'docker buildx build' requires 1 argument` (se pierde el `.` del contexto).
> **Entrecomilla siempre con comillas simples** toda `DATABASE_URL` y todo `--build-arg` que lleve
> la contraseña, tal como se muestra arriba.

> **El build NO debe sembrar datos de prueba en la BD.** El `onInit` de `payload.config.ts` corre
> `seedDev()` (usuarios `*@test.local`, posts de ejemplo, catálogos) salvo que
> `NODE_ENV === 'production'`. Con el build hermético este riesgo desapareció **durante el build**
> (no hay conexión posible), pero la etapa `builder` conserva `ENV NODE_ENV=production` como
> defensa en profundidad, y el riesgo sigue vivo al correr el **CLI de Payload** (migrate/seed)
> desde tu PC — ver la nota de `NODE_ENV=production` en la sección de migraciones.

> **El gotcha histórico de `--no-cache` para "reflejar contenido nuevo" quedó obsoleto.** Con el
> build hermético el contenido de la BD **nunca se hornea en la imagen**: llega en runtime vía ISR
> y el endpoint de revalidación. Para que aparezca contenido nuevo NO hay que rebuildear nada —
> basta `curl -X POST https://josetejero.com/api/revalidate -H "Authorization: Bearer ..."` o
> esperar el ciclo ISR de 1 h. `--no-cache` solo tendría sentido hoy ante una capa de Docker
> corrupta, no por contenido.

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

**El build del pipeline ya NO necesita PostgreSQL** (build hermético, ADR 0033): con
`BUILD_WITHOUT_DB=1` los helpers de datos devuelven vacío en build y el warm-up post-deploy
regenera todo vía `POST /api/revalidate` (ver [ci-cd.md](./ci-cd.md)). El `Dockerfile` ya no acepta
`DATABASE_URL` ni `PAYLOAD_SECRET` como build-args — usa placeholders internos.

Esto aplica a **cualquier** `docker build` con este `Dockerfile`, incluido el build manual en el
VPS (plan B): la imagen siempre sale con las páginas prerenderizadas vacías, y se rellenan al
llamar `POST /api/revalidate` (o al expirar el ciclo ISR de 1 h).

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

> **Este flujo manual es el plan B.** El camino normal es el pipeline: push a `main` y GitHub
> Actions hace build + deploy solo (ver [ci-cd.md](./ci-cd.md)). Lo único que sigue siendo manual
> con el pipeline es el paso 0 (migraciones, ANTES del merge). Usa esta sección solo si Actions o
> GHCR no están disponibles.

Tras el primer deploy, cada nuevo cambio de código sigue este flujo. No hace falta bajar la app: un
rebuild + `docker compose up -d` recrea el contenedor `app` porque cambió la imagen.

```powershell
# 0. SOLO si el cambio toca el schema — migra ANTES de arrancar la app nueva
#    (la app nueva espera el schema nuevo). Desde tu PC (PowerShell) por
#    túnel — NODE_ENV=production obligatorio, ver nota arriba:
$env:NODE_ENV = 'production'
$env:DATABASE_URL = 'postgresql://blog_prod:TU_PASSWORD@localhost:5432/blog_prod'
pnpm payload migrate
```

```bash
# --- en el VPS ---
cd /var/www/html/blog-prod/blog
git pull                              # trae el código nuevo al checkout
docker build \
  --build-arg 'NEXT_PUBLIC_SITE_URL=https://josetejero.com' \
  --build-arg 'NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX' \
  -t josetejero-blog:local .          # build hermético: no necesita la BD
docker compose up -d                  # recrea el contenedor app con la imagen nueva
docker compose logs -f app
# la imagen nace con páginas vacías — regenera el caché ISR:
curl -X POST https://josetejero.com/api/revalidate -H "Authorization: Bearer TU_REVALIDATE_SECRET"
```

### Bajar la app (sin perder datos)

- `docker compose stop app` — pausa el contenedor `app`; luego `docker compose start app` lo retoma.
- `docker compose down` — elimina los contenedores `app` + `postgres`, pero **conserva los volúmenes**
  (la BD y `payload_media` sobreviven). Sirve para un reinicio limpio antes de un rebuild.
- **`docker compose down -v` ⚠️ destruye los volúmenes** (BD y media). Úsalo solo si de verdad quieres
  borrar los datos y empezar de cero — no es parte del flujo normal de redeploy.

## Limpieza y mantenimiento de Docker

Cada `docker build` (sobre todo con `--no-cache`, que ahora es rutina — ver gotcha arriba) dispara la
imagen anterior con el mismo tag a **dangling** (`<none>:<none>`): pierde el tag pero el layer sigue
ocupando disco en el VPS. Sin limpieza periódica, se acumula.

### Inspeccionar antes de borrar

```bash
docker system df    # resumen: cuánto pesa cada categoría (imágenes, contenedores, volúmenes, build cache)
docker images        # imágenes, incluidas las <none>
docker ps -a          # contenedores, incluidos los parados
docker volume ls      # volúmenes
df -h                 # espacio real en disco del VPS
```

### Limpieza segura — correr después de cada rebuild

```bash
docker image prune -f       # borra SOLO imágenes dangling (<none>); nunca toca imágenes con tag/uso activo
docker builder prune -f     # limpia el cache de build acumulado
docker container prune -f   # borra contenedores parados; no toca los que están corriendo
```
Ninguno de los tres toca datos — son seguros de correr siempre.

### Volúmenes — cómo funcionan en este proyecto

`docker-compose.yml` declara **named volumes**: `pgdata` y `payload_media`. Viven en
`/var/lib/docker/volumes/...` en el VPS, **independientes del ciclo de vida de imágenes y contenedores**:

- Reconstruir la imagen (`docker build`, con o sin `--no-cache`) → no los toca.
- `docker compose up -d --force-recreate` → recrea contenedores, monta los MISMOS volúmenes, datos intactos.
- `docker compose down` → borra contenedores, **conserva** volúmenes.
- `docker compose down -v` → **destruye** los volúmenes del proyecto (única operación normal que los borra).
- `docker volume prune` → borra volúmenes **no referenciados por ningún contenedor** (ni corriendo ni
  parado). Mientras existan los contenedores `app`/`postgres` (aunque estén parados), `pgdata` y
  `payload_media` siguen "en uso" y no se tocan. Seguro correrlo, aunque normalmente no libera nada en
  este proyecto.

> ⚠️ **Nunca combines `--volumes` con un prune sin revisar `docker volume ls` antes.**
> `docker system prune -a --volumes` o `docker volume prune -a` **sí pueden borrar datos reales** si en
> ese momento los contenedores están abajo. Siempre confirma que `pgdata`/`payload_media` no aparecen
> como huérfanos antes de correr cualquier prune con `--volumes`.

### Rutina recomendada tras cada deploy/rebuild

```bash
docker image prune -f
docker builder prune -f
docker container prune -f
docker system df   # confirma que bajó el uso
```

Backup **antes** de cualquier operación que toque volúmenes (ver sección Backups más abajo):
```bash
docker compose exec postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup.sql
```

Si los logs de `docker compose logs app` empiezan a pesar mucho (sin rotación por defecto con el driver
`json-file`), agrega rotación al servicio `app` en `docker-compose.yml`:
```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
```

## Migraciones (cambios de schema posteriores)

En desarrollo, cuando el cambio de schema esté destinado a producción, genera su migración:

```bash
pnpm migrate:create nombre-de-cambio
```

Revisa el SQL generado y **aplícalo a producción ANTES de mergear a `main`**. Con el pipeline
activo (ADR [0033](../adr/0033-ci-cd-build-hermetico-y-deploy-automatico.md)), el push a `main`
despliega la imagen nueva en minutos: si la migración no está aplicada, la app nueva arranca contra
un schema viejo y las páginas que tocan ese schema fallan **en runtime**. El build no te avisa,
porque es hermético y no ve la BD. Ver [ci-cd.md → Migraciones](./ci-cd.md).

El CLI se corre desde tu PC por túnel SSH (o desde el host del VPS si tiene Node), nunca dentro del
contenedor `app`: es `standalone` y no incluye el CLI de Payload.

```powershell
# --- tu PC (PowerShell), con el túnel SSH abierto contra el Postgres de prod ---
$env:NODE_ENV = 'production'
$env:DATABASE_URL = 'postgresql://USUARIO:PASS@localhost:5432/BASE'

pnpm payload migrate:status   # a qué BD apuntas y qué falta por aplicar
pnpm payload migrate
pnpm payload migrate:status   # todas aplicadas
```

> **`migrate:status` antes de `migrate`, siempre.** Es la forma barata de comprobar que la variable
> de sesión ganó sobre el `.env` (que apunta a la BD de dev) **antes** de escribir en prod. Si la
> lista no cuadra con lo que esperas de producción, para y revisa el túnel.

> **`NODE_ENV=production` es obligatorio.** Sin él, el `onInit` de `payload.config.ts` corre
> `seedDev()` y siembra usuarios `*@test.local` y posts falsos en la base a la que apuntes — prod
> incluida. Ver ADR [0027](../adr/0027-migraciones-y-seed-para-produccion.md).

> **El aviso "you've run Payload in dev mode… data loss will occur" sale siempre en esta BD.**
> Payload lo lanza cuando encuentra en `payload_migrations` la fila centinela `name = 'dev'`,
> `batch = -1`, que deja el `push` del modo dev. En la base de producción existe desde el
> 2026-07-03 (residuo del primer arranque sin `NODE_ENV=production`), así que el aviso aparece en
> cada migración y **no dice nada sobre el SQL que vas a correr**: el texto es genérico. Antes de
> responder `yes`: lee el SQL de la migración pendiente, confirma con `migrate:status` que apuntas
> a prod, y ten el backup hecho. Borrar esa fila (`DELETE FROM payload_migrations WHERE name = 'dev'`)
> silencia el aviso para siempre; es solo un centinela, pero es tocar prod a mano.

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
