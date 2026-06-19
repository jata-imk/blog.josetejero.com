# Roadmap de ejecución

Versión operable del plan. Cada fase deja ADR/agent-notes; el CEO no marca `done` sin documentación.

## Fase 0 — Preparación a mano (José) ✅ (la armó esta sesión)
- `git init` + estructura `paperclip/` + `blog/`.
- `blog/AGENTS.md`, modelo de datos, ADR 0001–0003, docs de arquitectura, runbooks.
- `blog/design/` con tokens y inventario (placeholders) + dónde va el handoff.
- Pendiente de José: **colocar el bundle del handoff** en `blog/design/handoff/` y rellenar `tokens.md`.

## Fase 1 — Levantar la empresa en Paperclip
1. Crear la company con un goal claro: *"Lanzar josetejero.com en Next.js + Payload, fiel al diseño
   aprobado, con CMS, series, comentarios moderados y buscador, self-hosted en el VPS."*
2. Crear los 5 agentes (ver `org.md`) pegando cada `agents/<rol>.AGENTS.md` en
   `instructionsBundle.files["AGENTS.md"]`. cwd de los de código = `../blog`.
3. Instalar skills (ver `skills.md`): core de Paperclip vía `local-cli`; Frontend Design solo en el
   entorno del Frontend.

## Fase 2 — Boilerplate (donde la IA es experta)
1. ✅ Scaffolding Next + Payload v3 + Postgres en Docker (Engineer) → `first-tasks/01-scaffolding.md`.
2. ✅ Colecciones del modelo de datos (Engineer) → `first-tasks/02-colecciones.md` + cierre
   (auto-slug, access por role, ADR 0005) → `first-tasks/02b-cierre-colecciones.md`.
3. **Fundación (bloquea 04-06):**
   - ✅ Tokens del handoff → `app/globals.css` + Tailwind v4 + next/font (Frontend) → `first-tasks/03-tokens.md`.
   - ✅ Estructura del frontend + ADR 0006 + `lib/data` (Architect/Engineer) → `first-tasks/03b-arquitectura.md`.
   - **03c — correcciones** (Frontend) → `first-tasks/03c-correcciones-tokens-componentes.md`:
     saca hardcodes a tokens, quita estilos inline, recorta variantes muertas. **Hacer antes de 04-06.**

   > ⚠️ **Re-scope:** la 03 entregó tokens **pero el Frontend adelantó también** el shell visual de toda
   > la home y del inventario de componentes (`components/ui`, `components/blocks`, post/series/comments).
   > Esos shells son **markup + CSS, sin lógica**: Callout sin variante `danger` ni bloque Lexical,
   > CodeBlock sin Shiki, `lib/lexical` vacío. Por eso 04-06 **reutilizan** esos shells y se centran en el
   > **núcleo funcional** (schema Lexical, Shiki, serializador, datos reales), no en re-maquetar.

4. Bloque `Callout` (Engineer define / Frontend renderiza, +variante `danger`) → `first-tasks/04-callout.md`.
5. `<CodeBlock>`: integrar Shiki sobre el chrome ya hecho (Frontend) → `first-tasks/05-codeblock.md`.
6. Serializador Lexical → React + datos reales vía `lib/data` + páginas derivadas → `first-tasks/06-lexical-render.md`.

> Asignación Fase 2: ejecución directa a **Engineer/Frontend**; la **03b va al Architect** porque
> define estructura/capas y deja ADR antes de que existan componentes. El resto del diseño y el
> modelo ya están decididos. Reserva al Architect también para el importador de Fase 3. Opcional:
> corre alguna tarea vía CEO para practicar la delegación.

## Fase 3 — Piezas peludas (vigilar de cerca)
7. Importador Astro/MD → Lexical (Architect planea; Engineer implementa; palanca de subir modelo).
8. Buscador (server-side sobre Postgres, o client-side Pagefind/Orama).
9. Comentarios + moderación (pending/approved/spam/rejected; crear público, leer solo approved).

## Fase 4 — Cierre
10. Dockerizar y desplegar al VPS (Engineer + `blog/docs/runbooks/deploy.md`).
11. QA pasa por todo (build, lint, gate visual) y verifica ADR/notas de cada fase.

## Señales para ajustar
- Si José solo revisa diffs y no entiende el Next.js → exigir mejores agent-notes (su meta #1 es aprender).
- Si un proveedor deja esperando → mover ese agente de modelo/adapter.
- Si el diseño sale plano → casi siempre los tokens no estaban como variables CSS reales.
