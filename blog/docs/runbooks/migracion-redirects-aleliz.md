# Runbook: Redirects de aleliz.xyz a josetejero.com

## Objetivo

El blog se migró del dominio antiguo **aleliz.xyz** (sitio Astro) al nuevo
**josetejero.com** (Next.js). Las URLs viejas siguen indexadas en Google y compartidas en
enlaces externos; sin redirects, cada una daría 404 al visitarla, perdiendo el SEO acumulado y
rompiendo enlaces de terceros. Este runbook documenta cómo se generó el mapeo de URLs y cómo
subirlo a Cloudflare como **Bulk Redirect List**.

## Cómo se generó el mapeo

Se consultaron los **sitemaps** de ambos dominios (no se hizo scraping página por página):

- `aleliz.xyz` es Astro → expone `sitemap-index.xml` → apunta a `sitemap-0.xml`, con la lista
  completa de 21 URLs (slugs anidados, con `/` final).
- `josetejero.com` expone `sitemap.xml` directamente, con los slugs aplanados a `/blog/[slug]`.

Cada URL vieja se emparejó con su equivalente nueva por slug/contenido. La única ambigüedad
(la serie de 3 posts de Laravel, que en Astro estaban anidados bajo una URL padre) se resolvió
comparando el H1 y el contenido de origen y destino para confirmar el mapeo correcto.

Las páginas nuevas (`/categorias/*`, `/tags/*`, `/series/*`, y el post
`/blog/conectar-gmail-imap-smtp-openclaw`) son contenido que no existía en aleliz.xyz — no
necesitan redirect.

## Tabla de mapeo

| # | aleliz.xyz (origen) | josetejero.com (destino) |
|---|---|---|
| 1 | `/` | `/` |
| 2 | `/about/` | `/sobre-mi` |
| 3 | `/blog/` | `/blog` |
| 4 | `/blog/claves-ssh-y-creacion-de-usuarios-en-linux/` | `/blog/claves-ssh-y-creacion-de-usuarios-en-linux` |
| 5 | `/blog/configurar-laravel-con-jetstream-inertia-vue/` | `/blog/crear-un-proyecto-con-php-mysql-laravel-jetstream-inertia-vue-js` |
| 6 | `/blog/configurar-laravel-con-jetstream-inertia-vue/configurar-laravel-con-jetstream-inertia-y-vue/` | `/blog/crear-un-proyecto-con-php-mysql-laravel-jetstream-inertia-vue-js-librerias` |
| 7 | `/blog/configurar-laravel-con-jetstream-inertia-vue/instalar-herramientas-base/` | `/blog/crear-un-proyecto-con-php-mysql-laravel-jetstream-inertia-vue-js-herramientas-base` |
| 8 | `/blog/crear-proyecto-react/` | `/blog/guia-para-crear-proyecto-react-clean-architecture` |
| 9 | `/blog/git-merge-deploy/` | `/blog/git-merge-deploy-que-metodologia-seguir-para-ser-un-pro-devops` |
| 10 | `/blog/git-merge-deploy/branching-estrategico/` | `/blog/branching-estrategico` |
| 11 | `/blog/git-merge-deploy/branching-estrategico/flujo-basico-de-una-feature-usando-git-flow/` | `/blog/flujo-basico-de-una-feature-usando-git-flow-con-ejemplos-vanilla` |
| 12 | `/blog/git-merge-deploy/pull-or-merge-requests/` | `/blog/pull-requests-pr-merge-requests-mr` |
| 13 | `/blog/git-merge-deploy/pull-or-merge-requests/pr-mr-git-nativo-o-invencion-de-las-plataformas/` | `/blog/pull-requests-y-merge-requests-git-nativo-o-invencion-de-las-plataformas` |
| 14 | `/blog/git-merge-deploy/pull-or-merge-requests/pr-or-mr-vs-direct-merge/` | `/blog/diferencias-entre-merge-directo-y-usar-el-proceso-de-prmr` |
| 15 | `/blog/guia-rapida-de-cron-para-administradores-de-servidores-linux/` | `/blog/guia-rapida-de-cron-para-administradores-de-servidores-linux` |
| 16 | `/blog/guia-rapida-de-systemctl-para-administradores-de-servidores-linux/` | `/blog/guia-rapida-de-systemctl-para-administradores-de-servidores` |
| 17 | `/blog/openclaw/como-instalar-openclaw-en-una-vps/` | `/blog/como-instalar-openclaw-en-una-vps` |
| 18 | `/blog/openclaw/conectar-api-notion-openclaw/` | `/blog/conectar-api-notion-openclaw` |
| 19 | `/blog/openclaw/conectar-openclaw-a-whatsapp-y-telegram/` | `/blog/conectar-openclaw-a-whatsapp-y-telegram` |
| 20 | `/blog/openclaw/configurar-api-keys-openclaw/` | `/blog/configurar-api-keys-openclaw` |
| 21 | `/blog/openclaw/open-claw-introduccion/` | `/blog/open-claw-introduccion` |

## El archivo CSV

`blog/docs/redirects/aleliz-to-josetejero.csv` — formato oficial de Cloudflare Bulk Redirects
(`SOURCE_URL,TARGET_URL,STATUS_CODE,PRESERVE_QUERY_STRING,INCLUDE_SUBDOMAINS,SUBPATH_MATCHING,PRESERVE_PATH_SUFFIX`,
sin fila de cabecera — Cloudflare la rechaza si la incluye).

- **40 filas** — cada una de las 20 rutas de contenido (excluyendo la raíz) en dos variantes:
  con `/` final y sin ella, porque el match de origen es exacto y ambas formas circulan en
  enlaces reales. Todas con `301`, `preserve_query_string=TRUE`, y el resto de flags en `FALSE`.
- **1 fila catch-all** al final: `aleliz.xyz/` → `https://josetejero.com/`, con
  `include_subdomains=TRUE` (cubre también `www.aleliz.xyz`) y `subpath_matching=TRUE` (cubre
  la raíz y cualquier ruta no listada explícitamente). Esta fila reemplaza a la regla exacta de
  la home — **Cloudflare no permite dos reglas con el mismo `source_url` literal**, y como el
  catch-all con subpath matching ya incluye la raíz, la regla exacta de `/` sería un duplicado
  rechazado en la subida.

## Cómo subir el CSV a Cloudflare

Los Bulk Redirects viven a nivel de **cuenta** de Cloudflare, y requieren que `aleliz.xyz` siga
dado de alta en Cloudflare con el DNS en modo proxied (nube naranja) para que la regla se
ejecute — si el dominio ya no está en Cloudflare, esto no aplica y hay que resolverlo a nivel de
DNS/hosting antes.

1. Entra al [dashboard de Cloudflare](https://dash.cloudflare.com) → selecciona la cuenta que
   tiene `aleliz.xyz`.
2. Ve a **Rules → Redirect Rules → Bulk Redirects**.
3. **Create a Bulk Redirect List** → nómbrala (ej. `aleliz-to-josetejero`) → **Upload CSV** →
   selecciona `blog/docs/redirects/aleliz-to-josetejero.csv`.
4. Tras crear la lista, Cloudflare pedirá crear la **Bulk Redirect Rule** asociada (el paso que
   activa la lista sobre el tráfico real): dale un nombre, deja el expression por defecto
   (aplica a todas las requests) y actívala.
5. Guarda y despliega.

## Verificación

Tras subir y activar la regla, probar con `curl -I` una muestra representativa (no todas — 21
rutas es manejable a mano, pero esto cubre los casos de riesgo):

```bash
# Post renombrado y con slug aplanado
curl -I https://aleliz.xyz/blog/openclaw/open-claw-introduccion/
# esperado: HTTP/2 301, location: https://josetejero.com/blog/open-claw-introduccion

# Variante sin barra final
curl -I https://aleliz.xyz/about
# esperado: HTTP/2 301, location: https://josetejero.com/sobre-mi

# El caso ambiguo de la serie Laravel
curl -I "https://aleliz.xyz/blog/configurar-laravel-con-jetstream-inertia-vue/configurar-laravel-con-jetstream-inertia-y-vue/"
# esperado: location: .../crear-un-proyecto-con-php-mysql-laravel-jetstream-inertia-vue-js-librerias

# Catch-all: URL vieja no listada
curl -I https://aleliz.xyz/una-url-que-no-existe
# esperado: HTTP/2 301, location: https://josetejero.com/

# Home
curl -I https://aleliz.xyz/
# esperado: HTTP/2 301, location: https://josetejero.com/
```

En cada caso, confirmar además que el destino (`https://josetejero.com/...`) responde `200` —
un 301 que aterriza en un 404 es peor que no tener redirect, porque además pierde el "referrer"
en herramientas de diagnóstico.

## Mantenimiento

- Si en el futuro se renombra o mueve un post ya publicado en josetejero.com, hay que
  **actualizar también la fila correspondiente en este CSV** (el redirect debe seguir apuntando
  a la URL viva, no a la que ya no existe) y volver a subir la lista completa a Cloudflare
  (sobrescribe la lista existente, no hace falta borrarla primero).
- El catch-all cubre cualquier URL vieja no listada, pero **no sustituye** el mapeo específico:
  revisa esta tabla primero si aparece una URL vieja nueva que sí tenga contenido equivalente.
