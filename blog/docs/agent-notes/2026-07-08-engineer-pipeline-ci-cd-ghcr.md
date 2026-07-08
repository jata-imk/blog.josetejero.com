# 2026-07-08 — Pipeline CI/CD: build hermético + GitHub Actions + GHCR (punto 4 del roadmap)

## Qué se hizo

Implementación completa del punto 4 del roadmap (ADR 0031, concreta el camino preferente del
ADR 0021):

- **Build hermético**: `lib/data/build-guard.ts` (flag `BUILD_WITHOUT_DB`) + guards de retorno
  vacío en `getPosts`, `getPostsForSitemap` (posts.ts), `getCategories`, `getTags`,
  `getSeriesList`. Con el flag activo, `getPayload()` nunca se invoca en build → `next build`
  funciona sin ninguna BD.
- **`app/(frontend)/api/revalidate/route.ts`**: POST protegido por `REVALIDATE_SECRET`
  (Bearer, comparación timing-safe); `revalidatePath('/', 'layout')` + `revalidatePath('/rss.xml')`.
  503 si el secret no está configurado.
- **Dockerfile**: `BUILD_WITHOUT_DB=1` en builder; `DATABASE_URL`/`PAYLOAD_SECRET` pasan de
  build-args a placeholders ENV (ya no quedan secretos en `docker history`);
  `COREPACK_ENABLE_DOWNLOAD_PROMPT=0` en base.
- **docker-compose.yml**: fuera los build-args sensibles; `REVALIDATE_SECRET` añadido al
  environment del servicio `app`. `.env.example` documenta la variable.
- **`package.json`**: `packageManager: pnpm@11.5.3` (fuente única para corepack y CI).
- **`.github/workflows/deploy.yml`** (raíz del repo): lint → build-push (GHCR, tags sha+latest,
  cache gha) → deploy SSH (por SHA exacto) → warm-up (revalidate + curl de páginas críticas +
  posts vía sitemap). Concurrency `deploy-prod` sin cancelación.
- **Docs**: runbook nuevo `docs/runbooks/ci-cd.md` (didáctico, con setup inicial y
  troubleshooting); `deploy.md` actualizado (túnel SSH para build obsoleto, plan B hermético,
  gotcha `--no-cache` marcado obsoleto); ADR 0031.

## Verificación

- `pnpm lint` limpio.
- `next build` local con `BUILD_WITHOUT_DB=1` y credenciales placeholder, **sin BD disponible**:
  completó OK (18 páginas estáticas, `/api/revalidate` registrado como dinámico). Antes fallaba
  con conexión rechazada.
- Pendiente al primer push a main: run completo del workflow (requiere secrets configurados —
  ver checklist en ci-cd.md).

## Gotchas para el futuro

- El flag `BUILD_WITHOUT_DB` SOLO debe existir en la etapa builder del Dockerfile. Si alguien lo
  define en runtime, el sitio entero devuelve vacío.
- Cualquier página estática nueva que consulte Payload en el prerender necesita usar helpers con
  guard (o añadirle guard al helper nuevo), si no, el build hermético vuelve a fallar.
- Las migraciones NO las corre el pipeline: manuales, antes del merge (ADR 0027).
