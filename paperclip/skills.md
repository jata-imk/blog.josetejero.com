# Skills por agente

Una **skill** es un folder con un `SKILL.md` que enseña un flujo al agente en runtime. Para agentes
Claude (`claude_local`) se instalan en `~/.claude/skills/` y Claude Code las descubre.

## Qué skill a cada agente

| Agente | Skills | Notas |
|---|---|---|
| **CEO** | `paperclip` (core), `paperclip-create-agent` | La core se instala con `local-cli`. `create-agent` solo si el board aprueba contrataciones. **NO** le pongas Frontend Design. |
| **Product Architect** | `paperclip` (core) | Planea y escribe ADRs; no necesita skills de UI. |
| **Engineer** | `paperclip` (core) | Boilerplate/backend. Skills de browser solo si una tarea lo exige. |
| **Frontend/Diseño** | `paperclip` (core) + **Frontend Design (Anthropic)** | La skill que arregla el "diseño plano". Instalar **solo en su entorno**. |
| **QA** | `paperclip` (core) + skill de browser/automatización | Para el gate visual (screenshots desktop+móvil). |

## Cómo instalar la core de Paperclip
Fuera de un heartbeat run, en el entorno del agente:
```bash
paperclipai agent local-cli <agent-id-o-shortname> --company-id <company-id>
```
Imprime las variables `PAPERCLIP_*` para copiar/pegar. **Nunca** corras `local-cli` dentro de un
heartbeat run gestionado por Paperclip — rompe el sistema.

Skill de gobernanza de contrataciones (para el CEO):
```bash
npx skills add https://github.com/paperclipai/paperclip --skill paperclip-create-agent
```

## Frontend Design: aislarla
Cada agente Claude corre como una sesión de Claude Code bajo un usuario/máquina. Si instalas
Frontend Design **global**, la heredan TODOS los agentes Claude (incluido el CEO) → conflictos.

- Mínimo viable: instálala **solo en la cuenta/entorno del Frontend**, no en la del CEO.
- Recomendado por Paperclip: **temp dir + symlink por agente** (enlazas solo las skills que ese
  agente necesita y pasas la ruta al runtime). Más aislamiento, más limpio en multi-agente.

```bash
# en el entorno del Frontend:
npx skills add <fuente-de-frontend-design>
# o manual: copiar el folder a ~/.claude/skills/frontend-design/
```
