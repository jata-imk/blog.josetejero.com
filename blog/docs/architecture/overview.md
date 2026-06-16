# Overview de arquitectura

> Borrador inicial. El Architect lo completa con diagramas cuando el scaffolding exista.

## El sistema de un vistazo

```
                 ┌─────────────────────────────────────────────┐
   navegador ──► │  Next.js (App Router)                        │
                 │  - páginas públicas (SSR/SSG)                │
                 │  - render de Lexical → React                │
                 │  - /admin (panel de Payload)                │
                 │  - Payload CMS v3 (mismo proceso)           │
                 └───────────────┬─────────────────────────────┘
                                 │
                          ┌──────▼──────┐
                          │ PostgreSQL  │  (gestionada por Payload)
                          └─────────────┘
```

- **Una sola app Next** contiene el sitio público y el admin de Payload.
- **Datos:** Postgres vía Payload. Contenido de posts = árbol Lexical (JSON).
- **Presentación separada de datos:** Shiki (resaltado de código), tema oscuro y botón copiar son
  render en el frontend, no se almacenan.
- **Deploy:** Docker (`output: 'standalone'`) detrás de Caddy + Cloudflare en un VPS. Ver `../runbooks/deploy.md`.

## Pendiente de detallar (Architect)
- Diagrama de componentes de render de Lexical.
- Estrategia de caché / revalidación de páginas.
- Estrategia del buscador (server-side vs client-side).
