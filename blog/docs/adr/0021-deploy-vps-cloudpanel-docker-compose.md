# 0021 — Deploy en VPS con CloudPanel/Nginx y Docker Compose

- Estado: aceptada
- Fecha: 2026-06-28
- Decidido por: Board + Codex

## Contexto

El proyecto ya está definido como una sola app Next.js + Payload CMS v3 con PostgreSQL y
`output: 'standalone'`. La decisión anterior hablaba de VPS con Docker, Caddy y Cloudflare,
pero el servidor real tendrá Debian 12, 8 GB RAM, 4 vCPU y CloudPanel instalado. CloudPanel
ya trae Nginx, por lo que Caddy duplicaría responsabilidades. Cloudflare queda fuera por ahora.

La PC de desarrollo no tiene Docker y no conviene instalarlo por presión de almacenamiento. Aun
así, producción debe ser reproducible y fácil de reconstruir en el VPS final.

## Opciones consideradas

- CloudPanel Node.js/PM2 + PostgreSQL nativo — integración directa con CloudPanel y menos Docker,
  pero el runtime queda más acoplado al panel y el deploy es menos portable.
- Node/systemd + PostgreSQL nativo — simple y eficiente, pero exige más mantenimiento manual del
  runtime, logs, reinicios y upgrades.
- Docker solo para PostgreSQL — evita instalar Postgres nativo, pero mezcla dos modelos operativos
  y deja la app fuera del entorno reproducible.
- Docker Compose para app + PostgreSQL, con CloudPanel/Nginx delante — mantiene app y base de
  datos en un contrato reproducible, mientras CloudPanel se limita a HTTP/TLS/reverse proxy.

## Decisión

El proyecto mantendrá **un solo `docker-compose.yml`**. El servicio `postgres` sirve para desarrollo
local en máquinas con Docker. El servicio `app` vive bajo el profile `prod`, por lo que producción
levanta `app` + `postgres` con `COMPOSE_PROFILES=prod`.

CloudPanel mantiene Nginx y hace reverse proxy a la app en `127.0.0.1:<puerto-app>`. PostgreSQL no
se expone públicamente; la app en producción se conecta por la red interna de Docker.

El frontend público usará **ISR** con revalidación horaria como base. La ruta `/blog/[slug]` mantiene
`generateStaticParams` para prerenderizar posts publicados durante el build, y deja `dynamicParams`
activo para que slugs no generados puedan resolverse on-demand.

El build de la imagen se hará preferentemente en GitHub Actions. El VPS consumirá la imagen mediante
`APP_IMAGE` y `docker compose pull`, evitando que el servidor de producción tenga que compilar la
app o resolver acceso de build hacia la base de datos.

Desarrollo local puede correr de dos formas: con Docker solo para PostgreSQL, o sin Docker usando
una base PostgreSQL remota de desarrollo en el VPS. El acceso remoto debe hacerse por **túnel SSH**
salvo que exista una razón explícita para abrir un puerto restringido por firewall. La base de
desarrollo y la base de producción deben ser distintas, con usuarios y secretos distintos.

Si dev y prod conviven en el mismo VPS, deben vivir en clones separados y con `COMPOSE_PROJECT_NAME`
distinto para separar contenedores, redes y volúmenes. Convención:

- `/var/www/html/blog-dev` con `COMPOSE_PROJECT_NAME=jt_blog_dev` y Postgres en `127.0.0.1:5433`.
- `/var/www/html/blog-prod` con `COMPOSE_PROJECT_NAME=jt_blog_prod`, profile `prod` y Postgres
  interno para la app.

## Consecuencias

- Más fácil: producción queda reproducible y portable, sin depender del runtime Node configurado
  por CloudPanel.
- Más fácil: la PC local no necesita Docker; si otra máquina sí tiene Docker, puede usarlo solo para
  PostgreSQL sin otro compose paralelo.
- Más fácil: CloudPanel se usa donde aporta valor inmediato: Nginx, sitio, TLS y panel operativo.
- Más difícil: hay que mantener Docker, volúmenes persistentes, backups y una estrategia clara de
  migraciones.
- Más difícil: el build de producción necesita acceso controlado a PostgreSQL para prerenderizar
  contenido con ISR.
- Más difícil: hace falta publicar una imagen de app en un registry antes del deploy definitivo.
- Deuda asumida: Cloudflare se documentará más adelante cuando se decida activar proxy/CDN.
