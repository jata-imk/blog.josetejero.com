# 2026-06-28 — Codex — deploy VPS con CloudPanel y Docker Compose

## Qué cambió

Actualicé el contexto del proyecto para reflejar el stack real de producción: VPS Debian 12 con
CloudPanel/Nginx y Docker Compose para la app Next/Payload + PostgreSQL. Caddy queda descartado y
Cloudflare queda pendiente.

También añadí los archivos base para operar ese stack:

- `Dockerfile` para construir la app con `output: 'standalone'`.
- `docker-compose.yml` único con `postgres` para dev y `app` bajo profile `prod`.
- `.env.example` ampliado para documentar dev con Docker, dev sin Docker y producción.
- `.gitignore` y `.dockerignore` para evitar subir secretos, dependencias y artefactos locales.

Además, el segmento público de Next queda con ISR (`revalidate = 3600`) y la ruta de post mantiene
`generateStaticParams`, porque SEO es prioridad. El build de producción debe tener acceso a la BD
por túnel SSH o red segura para prerenderizar posts publicados.

Como el build irá en GitHub Actions, el compose de producción acepta `APP_IMAGE`. El VPS queda como
runtime: descarga la imagen publicada y levanta los contenedores, en lugar de compilar la app allí.

La convivencia dev/prod en el mismo VPS queda documentada con clones separados en `/var/www/html`
y `COMPOSE_PROJECT_NAME` distinto. Dev levanta solo PostgreSQL en `127.0.0.1:5433`; prod usa el
profile `prod`.

## Por qué

La PC local no tiene Docker y no conviene instalarlo por espacio. Eso no impide usar Docker en
producción: local y producción pueden tener runtimes distintos siempre que compartan el contrato de
variables (`DATABASE_URL`, `PAYLOAD_SECRET`) y el mismo código.

El flujo recomendado ahora es:

1. En local: `pnpm dev`.
2. La base de desarrollo vive en el VPS.
3. La conexión local a la base se hace por túnel SSH.
4. Producción usa otra base distinta dentro de Docker Compose.

La separación entre `blog_dev` y `blog_prod` es importante porque Payload ejecuta lógica de
desarrollo cuando `NODE_ENV !== 'production'`; por eso `pnpm dev` nunca debe apuntar a la base real
del sitio.

También importa separar entornos: el mismo `docker-compose.yml` sirve para dev con solo Postgres y
para prod con app + Postgres gracias a profiles. Esto evita duplicar archivos Compose que casi hacen
lo mismo.

## Concepto didáctico

CloudPanel y Docker no compiten aquí. CloudPanel controla la entrada HTTP con Nginx: dominio, TLS y
reverse proxy. Docker Compose controla el runtime de la aplicación: contenedor de Next/Payload,
contenedor de PostgreSQL y volúmenes persistentes.

Nginx solo ve `http://127.0.0.1:3000`. Dentro de Docker, la app ve PostgreSQL como `postgres:5432`.
La PC de desarrollo no ve directamente ese contenedor; entra por SSH tunnel para no abrir la base
de datos a Internet.
