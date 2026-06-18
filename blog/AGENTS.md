# Proyecto: blog/portafolio de José Tejero

> Este es el **contexto canónico del proyecto**. Cualquier agente de código que entre a `blog/` lo
> lee primero. No lo confundas con los `AGENTS.md` de cada agente (esos viven en `../paperclip/agents/`
> y describen al *empleado*; este describe el *proyecto*).

## Qué es

Blog personal que también es portafolio, en **josetejero.com**. Rediseño del blog anterior
(`blog.aleliz.xyz`, hecho en Astro + Markdown). Contenido técnico para público dev: imágenes,
diagramas, código. El diseño viene de **Claude Design** y se entrega como bundle
**"Handoff a Claude Code"** en `blog/design/handoff/`.

## Stack (DECISIONES CERRADAS — no reabrir sin ADR)

- **Next.js (App Router)** + **Payload CMS v3** dentro de la misma app Next (admin en `/admin`).
- **PostgreSQL** gestionada por Payload. La capa de datos es la de Payload. **PRISMA DESCARTADO.**
- Cuerpo de los posts = **rich text Lexical**. **Tailwind CSS** para estilos. Gestor: **pnpm**.
- Self-hosted en **VPS** (Docker + Caddy + Cloudflare, `output: 'standalone'`).
- Único **bloque custom = `Callout`** (variant `note|tip|warning|danger`, `title`, `content` richText anidado).
- **Código** = nodo built-in de Lexical; **Shiki + botón copiar son RENDER** (frontend), no un bloque.
- **Imágenes/SVG** = upload nativo de Lexical (colección `Media`). SVG como `<img>`, no inline.

## Principios

YAGNI, DRY, fuente única de la verdad (derivar, no duplicar). **Separar datos de presentación.**
Un solo framework. Nada de arquitectura de astronauta. Código idiomático y limpio; si una función
crece monstruosa, pártela.

## Reglas para agentes (no negociables)

- Antes de cualquier decisión de arquitectura: escribe un **ADR** en `docs/adr/` (usa `template.md`).
- Al terminar una tarea no trivial: deja una **nota** en `docs/agent-notes/` con el formato
  `YYYY-MM-DD-<agente>-<tarea>.md`, explicando **qué hiciste y por qué** (no solo el código).
  → El board (José) **no escribe código**; aprende leyendo estas notas y los ADR. Si una pieza es
  didáctica (App Router, Server vs Client Components, render de Lexical, `<CodeBlock>`), la nota
  debe explicar el concepto con claridad suficiente para alguien que está aprendiendo Next.js.
- Respeta los **design tokens** (`app/globals.css` + config de Tailwind) — son la fuente de
  verdad visual. **Cero valores hardcodeados** de color/espaciado/tipografía.
- Si algo no está decidido aquí, **escala** al Architect/CEO. No improvises arquitectura.
- No marques `done` sin que QA pueda revisar y sin haber dejado rastro (ADR/nota).

## Modelo de datos

Ver `docs/architecture/data-model.md` (colecciones Users, Posts, Series, Categories, Tags,
Comments, Media). El post **NUNCA** almacena su posición en la serie — se deriva del join.

## Cómo correr en local

Ver `README.md` (se completa cuando el Engineer haga el scaffolding en la Fase 2).
