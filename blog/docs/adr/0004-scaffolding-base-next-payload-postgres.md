# 0004 — Scaffolding base con Next App Router + Payload embebido + Postgres local

- Estado: aceptada
- Fecha: 2026-06-17
- Decidido por: Product Architect

## Contexto
El repositorio `blog/` hoy solo contiene documentación y handoff de diseño. La siguiente fase debe
crear el esqueleto ejecutable del proyecto respetando decisiones ya cerradas:

- una sola app **Next.js App Router**
- **Payload CMS v3** embebido en la misma app con admin en `/admin`
- **PostgreSQL** como base de datos de Payload
- gestor **pnpm**
- despliegue futuro con `output: 'standalone'`

Además, el scaffold debe convivir con la documentación existente del repo y dejar una base didáctica
para que José entienda dónde vive Payload dentro de Next. No necesitamos UI final todavía: en esta
fase solo debe quedar Tailwind v4 instalado y funcionando.

## Opciones consideradas
- **Usar `create-payload-app` como plantilla principal** — ventaja: es la vía más rápida para tener
  Next + Payload funcionando. Desventaja: parte de una plantilla más opinionada; luego habría que
  adaptar estructura, scripts y documentación al repo ya existente.
- **Crear primero la app Next y después instalar Payload manualmente** — ventaja: control explícito
  del layout del proyecto, del `next.config`, de los grupos de rutas y de los scripts locales.
  Desventaja: requiere más pasos manuales al inicio.

## Decisión
El scaffolding se implementará sobre una **app Next creada de forma explícita en `blog/`** y luego
se **integrará Payload manualmente** siguiendo la estructura oficial de Payload para App Router.

La implementación debe quedar así:

- `app/(payload)/...` para las rutas mínimas que Payload necesita.
- `app/(frontend)/...` para el sitio público y para aislarlo del admin desde el día uno.
- `payload.config.ts` en la raíz del proyecto `blog/`.
- `next.config.mjs` envuelto con `withPayload(...)` y con `output: 'standalone'`.
- `docker-compose.yml` para Postgres local de desarrollo.
- `.env.example` con variables no secretas documentadas.
- Desarrollo local con Postgres en modo sandbox; Payload puede usar su flujo recomendado de
  sincronización local sobre Postgres durante `pnpm dev`. Las migraciones quedan previstas en los
  scripts y en el README, pero no se diseña una pipeline compleja en esta fase.

## Consecuencias
- Más fácil: la estructura queda alineada con el modelo mental del proyecto, con separación clara
  entre frontend y Payload, y con documentación más didáctica para el board.
- Más fácil: evitamos meter librerías extra de datos o capas paralelas a Payload.
- Más difícil: el Engineer tendrá que cablear manualmente algunos archivos de integración de Payload
  en lugar de depender por completo de una plantilla generada.
- Más difícil: el primer scaffold llevará algo más de cuidado en `README`, variables de entorno y
  scripts, pero a cambio deja una base limpia para las siguientes tareas de diseño y colecciones.
