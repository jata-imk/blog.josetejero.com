# Runbook: deploy al VPS

> Borrador. El Engineer lo completa con comandos reales en la Fase 4.

## Objetivo
Desplegar la app Next + Payload al VPS, detrás de Caddy + Cloudflare.

## Esquema
- Build de Next con `output: 'standalone'`.
- Imagen Docker de la app + servicio Postgres (docker-compose).
- **Caddy** como reverse proxy con TLS automático.
- **Cloudflare** delante (DNS + CDN/proxy).

## Pasos (a completar)
1. Variables de entorno (`DATABASE_URL`, `PAYLOAD_SECRET`, etc.) — nunca en el repo.
2. `docker compose build && docker compose up -d`.
3. Migraciones de Payload.
4. Configurar Caddyfile (dominio josetejero.com → app).
5. Verificar TLS y que `/admin` carga.

## Checklist post-deploy (QA)
- Home, post, serie, tag, categoría renderizan.
- `/admin` accesible y login funciona.
- Imágenes y código se ven fieles al diseño.
