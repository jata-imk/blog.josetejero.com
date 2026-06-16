# blog.josetejero.com

Monorepo del rediseño del blog/portafolio de José Tejero. Dos partes:

- **`blog/`** — la app real: Next.js (App Router) + Payload CMS v3 + Lexical + Tailwind + Postgres.
  Es donde codean los agentes (su `cwd`). Su contexto canónico está en `blog/AGENTS.md`.
- **`paperclip/`** — el **playbook** de la empresa de agentes Paperclip que construye el blog:
  organización, skills, roadmap, prompts de cada agente y primeras tareas. **No** es la instancia/
  control plane de Paperclip (eso corre fuera del repo).

## Por dónde empezar
1. Lee `paperclip/README.md` (cómo está montada la empresa) y `paperclip/roadmap.md` (las fases).
2. Lee `blog/AGENTS.md` (el proyecto y sus decisiones cerradas).
3. José: coloca el bundle "Handoff a Claude Code" en `blog/design/handoff/` y rellena
   `blog/design/tokens.md`. Luego arranca la Fase 1 (crear la company y los agentes).

## Plan completo
`C:\Users\jose.tejero\.claude\plans\lee-el-unico-archivo-cheeky-trinket.md`

El documento original de la guía vive en `paperclip-empresa-blog-guia-completa.md` (referencia
histórica; ojo: su modelo de archivos por agente — SOUL/HEARTBEAT/TOOLS — NO aplica a la versión de
Paperclip instalada, que usa un solo `AGENTS.md` por agente).
