# Runbook: pipeline CI/CD (GitHub Actions + GHCR)

> ADR relacionado: [0033 — CI/CD con build hermético y deploy automático](../adr/0033-ci-cd-build-hermetico-y-deploy-automatico.md).
> Complementa a [deploy.md](./deploy.md), que conserva el flujo manual como plan B.

## Qué hace el pipeline y por qué

Antes de este pipeline, cada deploy era manual y el build ocurría **en el propio VPS**: entrar por
SSH, `git pull`, `docker build --network host` (compilando Next.js + Payload en el mismo servidor
que sirve el sitio en vivo) y `docker compose up -d`. Eso tenía tres problemas reales:

1. **El build castigaba producción**: compilar consume CPU/RAM y podía degradar el sitio en vivo.
2. **Sin rollback rápido**: si un deploy salía mal, no había imagen anterior a la que volver.
3. **Propenso a olvidos**: los gotchas (`--no-cache`, orden de migraciones, `--network host`)
   dependían de la memoria.

Ahora, cada `git push` a `main` dispara esta cadena en GitHub Actions:

```
push a main
   │
   ▼
┌────────┐   ┌──────────────┐   ┌──────────────┐   ┌────────────┐
│  lint  │ → │  build-push  │ → │    deploy    │ → │  warm-up   │
│ ESLint │   │ imagen → GHCR│   │ SSH al VPS:  │   │ revalidar +│
│        │   │ tags sha+lat.│   │ pull + up -d │   │ calentar   │
└────────┘   └──────────────┘   └──────────────┘   └────────────┘
```

- El VPS **nunca compila**: solo descarga la imagen ya construida y la arranca (segundos).
- Cada deploy queda como **imagen etiquetada con el SHA del commit** en GHCR → rollback = volver a
  un tag anterior.
- Los gotchas quedaron **codificados en el pipeline**, no en tu memoria.

El workflow vive en [`.github/workflows/deploy.yml`](../../../.github/workflows/deploy.yml)
(raíz del repo — GitHub solo busca workflows ahí, por eso no está dentro de `blog/`).

## El build hermético explicado

### El problema que resuelve

El build de Next.js **prerenderiza** páginas: durante `next build` ejecuta el código de la home,
los listados (`/categorias`, `/tags`, `/series`), el sitemap y el RSS, y guarda el HTML resultante
dentro de la imagen. Ese código consulta Payload → Postgres. Por eso el build manual en el VPS
necesitaba la BD de producción a mano, y un build en GitHub Actions habría necesitado un **túnel
SSH** desde el runner hasta tu Postgres (secretos SSH extra, más complejidad, un modo de fallo más).

### La solución: `BUILD_WITHOUT_DB=1`

La etapa `builder` del `Dockerfile` define `BUILD_WITHOUT_DB=1`. Los helpers de datos
(`lib/data/build-guard.ts` + guards en `posts.ts`, `categories.ts`, `tags.ts`, `series.ts`)
detectan el flag y **devuelven vacío sin intentar conectarse a ninguna BD**. Resultado: el build
termina sin red, sin túnel y sin secretos de base de datos. `DATABASE_URL` y `PAYLOAD_SECRET` en el
Dockerfile son ahora **placeholders** (Payload exige que existan para cargar su config, pero jamás
se usan) — bonus de seguridad: ya no quedan secretos reales grabados en `docker history`.

La etapa `runner` **no** define el flag, así que en producción la app consulta la BD normalmente.

### La consecuencia y su mitigación

La imagen sale del horno con home/listados/sitemap/RSS **vacíos** (HTML prerenderizado sin posts).
Sin mitigación, se servirían vacíos hasta que expirara el caché ISR (`revalidate = 3600`, hasta
1 hora). La mitigación tiene dos piezas:

1. **`POST /api/revalidate`** (`app/(frontend)/api/revalidate/route.ts`): endpoint protegido por
   `REVALIDATE_SECRET` (header `Authorization: Bearer ...`) que ejecuta `revalidatePath('/', 'layout')`
   — invalida todo el árbol de páginas — y `revalidatePath('/rss.xml')`.
2. **El job `warm-up`** del workflow lo llama justo después del deploy y luego visita las páginas
   críticas para que se regeneren con datos reales.

La ventana real de contenido vacío queda en **~10–30 segundos** por deploy. Las entradas
individuales (`/blog/[slug]`) no se prerenderizan en build (con el flag, `generateStaticParams`
devuelve `[]`): se generan en el primer request y quedan cacheadas — el warm-up también las
pre-genera leyendo el sitemap.

## Anatomía de `deploy.yml`, job por job

### Disparadores (`on:`)

- `push` a `main`, solo si cambió algo bajo `blog/` o el propio workflow (`paths:`). Un cambio que
  solo toca el README de la raíz no gasta un build.
- `workflow_dispatch`: botón "Run workflow" en la pestaña Actions — sirve para redeplegar a mano o
  hacer rollback (ver abajo).
- `concurrency: deploy-prod` con `cancel-in-progress: false`: nunca corren dos deploys a la vez ni
  se cancela uno a medias; si haces dos pushes seguidos, el segundo espera.

### Job 1: `lint`

Instala dependencias (`pnpm install --frozen-lockfile`, la versión de pnpm sale del campo
`packageManager` de `blog/package.json` — una sola fuente de verdad) y corre `pnpm lint`. Si ESLint
falla, el pipeline se detiene aquí: no se construye ni se despliega nada roto. El typecheck real
ocurre dentro de `next build` en el siguiente job.

### Job 2: `build-push`

1. `docker/setup-buildx-action` prepara el builder.
2. `docker/login-action` se autentica en GHCR con el `GITHUB_TOKEN` automático del workflow
   (con `permissions: packages: write` declarado) — no hace falta ningún PAT para publicar.
3. `docker/build-push-action` construye `blog/Dockerfile` con contexto `./blog` y publica dos tags:
   - `ghcr.io/<owner>/josetejero-blog:<sha-del-commit>` — el tag inmutable que se despliega.
   - `ghcr.io/<owner>/josetejero-blog:latest` — puntero de conveniencia al último build.
4. `cache-from/to: type=gha`: las capas de Docker (deps de pnpm, etc.) se cachean entre runs —
   builds mucho más rápidos cuando solo cambia código de la app.

Únicos build-args: `NEXT_PUBLIC_SITE_URL` y `NEXT_PUBLIC_GA_ID`. Son públicos por definición (Next
los inserta en el HTML/JS que ve cualquier visitante), por eso pueden viajar como build-args sin
riesgo.

### Job 3: `deploy`

Entra por SSH al VPS (`appleboy/ssh-action` con `VPS_HOST`/`VPS_USER`/`VPS_SSH_KEY`) y ejecuta:

```bash
cd /var/www/html/blog-prod/blog
export APP_IMAGE=ghcr.io/<owner>/josetejero-blog:<sha>   # SHA exacto, no :latest
docker compose pull app
docker compose up -d
docker image prune -f
```

Se despliega **por SHA exacto**, no por `:latest`: así el deploy es determinista y el rollback es
trivial. El `export APP_IMAGE=...` prevalece sobre el valor del `.env` del VPS (que mantiene
`:latest` solo como fallback para arranques manuales). El `prune -f` limpia imágenes dangling para
que el disco del VPS no crezca sin límite.

### Job 4: `warm-up`

1. Espera a que `https://josetejero.com/` responda (hasta 150 s).
2. `POST /api/revalidate` con el `REVALIDATE_SECRET` → invalida el caché ISR vacío.
3. Visita `/`, `/blog`, `/categorias`, `/tags`, `/series`, `/sitemap.xml`, `/rss.xml` para
   regenerarlas ya, y lee el sitemap recién regenerado para pre-generar cada entrada del blog.

## Secrets y variables

| Nombre | Tipo | Dónde vive | Para qué |
|---|---|---|---|
| `VPS_HOST` | Secret | GitHub → Settings → Secrets → Actions | IP o hostname del VPS |
| `VPS_USER` | Secret | GitHub Actions | Usuario SSH de deploy (en el grupo `docker`) |
| `VPS_SSH_KEY` | Secret | GitHub Actions | Clave **privada** ed25519 dedicada al pipeline |
| `REVALIDATE_SECRET` | Secret | GitHub Actions **y** `.env` del VPS (mismo valor) | Autoriza `POST /api/revalidate` |
| `NEXT_PUBLIC_GA_ID` | Variable (no secret) | GitHub → Settings → Variables → Actions | Measurement ID de GA4; público, va inlined en el bundle |
| `GITHUB_TOKEN` | Automático | Lo genera GitHub en cada run | Push de la imagen a GHCR |

En el VPS, `.env` de prod añade `REVALIDATE_SECRET=...` (ver `.env.example`). Generar el valor con
`openssl rand -hex 32`.

## Configuración inicial (una sola vez)

1. **Clave SSH dedicada** (en tu PC): `ssh-keygen -t ed25519 -f blog-deploy -C "gh-actions-blog"`.
   - Pública → `~/.ssh/authorized_keys` del usuario de deploy en el VPS.
   - Privada → secret `VPS_SSH_KEY` en GitHub. No reutilices tu clave personal.
2. **Usuario de deploy en el grupo docker** (VPS): `sudo usermod -aG docker <usuario>`.
3. **Secrets/variables en GitHub** según la tabla anterior.
4. **`REVALIDATE_SECRET` en el `.env` del VPS** + `git pull` en el checkout de prod para traer el
   `docker-compose.yml` que lo inyecta al contenedor; luego `docker compose up -d` para recrearlo.
5. **Visibilidad del package en GHCR**: el primer run crea el package
   `ghcr.io/<owner>/josetejero-blog`, **privado** por defecto. Para que el VPS pueda hacer pull:
   - Crea un PAT (classic) con scope `read:packages`.
   - En el VPS: `docker login ghcr.io -u <tu-usuario> -p <PAT>` (persiste en `~/.docker/config.json`).
   - Alternativa: hacer el package público (Package → Settings → Change visibility) y saltarte el login.
6. **Vincular el package al repo** (tras el primer push): Package → Settings → Manage Actions
   access → asegurar que el repo tiene rol Write (normalmente queda vinculado solo porque el push
   salió de este repo).

## Migraciones: siguen siendo manuales y ANTES del merge

El pipeline **no corre migraciones** (decisión del ADR 0033, ratifica el
[ADR 0027](../adr/0027-migraciones-y-seed-para-produccion.md)). Si tu cambio incluye una migración
de schema (`migrations/` nuevo), el orden es:

1. **Antes de pushear a `main`**: correr la migración contra la BD de prod desde tu PC por túnel
   SSH, exactamente como documenta [deploy.md → Migraciones](./deploy.md) (recordatorio:
   `NODE_ENV=production` + `DATABASE_URL` al puerto del túnel, nunca el host `postgres`).
2. Push a `main` → el pipeline despliega la app que ya encuentra el schema nuevo.

> **¿Qué pasa si lo olvidas?** El build en Actions NO falla (es hermético, no ve la BD). El fallo
> aparece en runtime: la app nueva loguea errores de columnas/tablas inexistentes y las páginas que
> tocan ese schema devuelven error. Solución: correr la migración pendiente y llamar al endpoint de
> revalidación (o esperar el próximo ciclo ISR).

## Rollback

Cada deploy queda como `ghcr.io/<owner>/josetejero-blog:<sha>`. Para volver a una versión anterior:

**Opción A — manual por SSH (más rápida):**

```bash
cd /var/www/html/blog-prod/blog
export APP_IMAGE=ghcr.io/<owner>/josetejero-blog:<sha-bueno-anterior>
docker compose pull app && docker compose up -d
# regenerar el caché ISR de inmediato:
curl -X POST https://josetejero.com/api/revalidate -H "Authorization: Bearer <REVALIDATE_SECRET>"
```

El SHA se saca de la lista de commits en GitHub o de la pestaña Actions (cada run muestra su commit).

**Opción B — re-ejecutar el pipeline**: en Actions → Build & Deploy → "Re-run all jobs" sobre el
run del commit bueno. Reconstruye (con cache, rápido) y redespliega ese SHA.

Si el rollback es por una migración fallida, primero resuelve la BD (las migraciones de Payload
tienen `down`, ver ADR 0027) — la imagen vieja espera el schema viejo.

## Troubleshooting

| Síntoma | Causa probable | Solución |
|---|---|---|
| `deploy` falla con `pull access denied` | Package privado y el VPS sin login en GHCR | `docker login ghcr.io` en el VPS con PAT `read:packages` (ver configuración inicial) |
| `build-push` falla con `denied: permission_denied` al pushear | Package desvinculado del repo o sin permiso Write | Package → Settings → Manage Actions access |
| Home/listados vacíos tras un deploy | El warm-up falló o `REVALIDATE_SECRET` no coincide | Revisar el job `warm-up`; probar a mano el `curl -X POST .../api/revalidate` (401 = secret mal, 503 = falta en el `.env` del VPS) |
| `warm-up` da 401 | `REVALIDATE_SECRET` distinto en GitHub y en el `.env` del VPS | Igualar ambos valores y `docker compose up -d` para recargar el env |
| `lint` falla por versión de pnpm | `packageManager` de `package.json` desincronizado con el lockfile | Regenerar lockfile o ajustar el pin |
| Build lentísimo de repente | Cache de GitHub Actions expirado (7 días sin uso) | Nada que hacer: el siguiente run vuelve a ser rápido |
| El contenido nuevo (posts) no aparece | No es cosa del pipeline: ISR regenera cada hora | Esperar el ciclo, o `curl -X POST .../api/revalidate` para forzarlo |
| Dos pushes seguidos y el segundo "no arranca" | `concurrency` encola los deploys | Normal: esperará a que termine el primero |

> **Nota sobre el gotcha histórico de `--no-cache`** (deploy.md): aplicaba porque el build horneaba
> el contenido de la BD dentro de la imagen. Con el build hermético ya **no aplica al pipeline** —
> el contenido nunca se hornea; llega por ISR/revalidación en runtime. El gotcha sigue vigente solo
> para el flujo manual plan B de deploy.md.
