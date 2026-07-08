# 0031 — CI/CD con build hermético y deploy automático (GitHub Actions + GHCR)

- Estado: aceptada
- Fecha: 2026-07-08
- Decidido por: José (dirección) + Claude (diseño), sobre el punto 4 del roadmap de mejoras

## Contexto

El ADR [0021](./0021-deploy-vps-cloudpanel-docker-compose.md) designó GitHub Actions + GHCR como
camino preferente de build, pero nunca se implementó: cada deploy era manual y el build ocurría en
el VPS de producción (consumo de CPU/RAM sobre el sitio en vivo, sin rollback rápido, gotchas de
memoria). El obstáculo técnico era que `next build` prerenderiza páginas consultando Postgres
(home, listados, sitemap, RSS y `generateStaticParams` de `/blog/[slug]`), lo que exigía dar al
runner de CI acceso a la BD de producción.

## Opciones consideradas

- **Túnel SSH desde el runner a Postgres del VPS** — prerenderiza contenido real en build.
  Contras: secretos SSH y `DATABASE_URL` en CI, acoplamiento build↔producción, un modo de fallo
  más, y el gotcha de `--no-cache` persiste (contenido horneado en la imagen).
- **Postgres efímero en el runner + `payload migrate`** — sin tocar prod, pero prerenderiza vacío
  igualmente (BD con schema sin contenido) y suma ~30–60 s y complejidad de red por build. Todo el
  coste sin el beneficio.
- **Build hermético (`BUILD_WITHOUT_DB=1`) + revalidación on-demand** — el build no toca ninguna
  BD; los data-helpers devuelven vacío; un endpoint `POST /api/revalidate` (Bearer
  `REVALIDATE_SECRET`) + warm-up del pipeline regeneran el contenido segundos después del deploy.
- **`force-dynamic` en las rutas afectadas** — elimina el prerender pero también el caché ISR de
  las páginas más visitadas: TTFB peor permanente. Descartada.

## Decisión

1. **Build hermético**: la etapa `builder` del Dockerfile define `BUILD_WITHOUT_DB=1`;
   `lib/data/build-guard.ts` + guards en `getPosts`, `getPostsForSitemap`, `getCategories`,
   `getTags` y `getSeriesList` devuelven vacío bajo el flag. `DATABASE_URL` y `PAYLOAD_SECRET`
   dejan de ser build-args (placeholders internos → no quedan secretos en `docker history`).
2. **Pipeline en `.github/workflows/deploy.yml`**: push a `main` → lint → build + push a GHCR
   (tags `<sha>` + `latest`, cache de capas `type=gha`) → deploy por SSH al VPS
   (`APP_IMAGE` fijado al SHA exacto, `docker compose pull app && up -d`) → warm-up
   (revalidación + curl a páginas críticas y posts vía sitemap).
3. **Deploy por SHA, no por `latest`**: rollback = redesplegar un SHA anterior.
4. **Migraciones siguen siendo manuales y antes del merge** (ratifica el ADR
   [0027](./0027-migraciones-y-seed-para-produccion.md)): el pipeline no toca el schema.
5. **pnpm pineado** con `packageManager` en `package.json` (una sola fuente de verdad para
   corepack y `pnpm/action-setup`).

## Consecuencias

- El VPS deja de compilar; el deploy pasa de ~10 min manuales a un push.
- Cada deploy queda auditado como imagen ligada a un commit en GHCR; rollback en segundos.
- El gotcha de `--no-cache` desaparece del flujo normal: el contenido ya no se hornea en la
  imagen, llega por ISR/revalidación.
- Deuda asumida: ventana de ~10–30 s con páginas prerenderizadas vacías en cada deploy (hasta que
  corre el warm-up). Aceptable para un blog personal.
- Riesgo operativo: olvidar una migración manual antes de un merge con cambio de schema produce
  errores en runtime (no en build, que ya no ve la BD). Mitigado con el checklist del runbook
  [ci-cd.md](../runbooks/ci-cd.md).
- El flujo manual de deploy.md queda como plan B documentado.
