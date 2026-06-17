# Playbook de la empresa (Paperclip)

Esta carpeta es el **guion versionado** de la empresa de agentes que construye el blog. **No es la
instancia de Paperclip** (el servidor/control plane que corre los latidos vive fuera del repo, en
su propia instalación). Aquí solo guardamos los prompts y los planes para poder reproducir y
auditar la empresa.

## Contenido
- `org.md` — quiénes son los agentes: rol, **modelo**, adapter, reporting line, carga.
- `skills.md` — qué **skill** instalar a cada agente y cómo (y por qué algunas no van globales).
- `roadmap.md` — las fases de ejecución (versión operable del plan).
- `agents/<rol>.AGENTS.md` — el prompt de cada agente. **Esto es lo que se pega** en
  `instructionsBundle.files["AGENTS.md"]` al crear el hire con la skill `paperclip-create-agent`.
- `agents/ceo.SOUL.md` — personalidad del CEO (el CEO es el único con archivo `SOUL.md` aparte;
  ver "Modelo de archivos" abajo).
- `first-tasks/*.md` — los prompts de las primeras tareas que José/CEO usan para arrancar.

## Modelo de archivos de Paperclip (importante)
Depende de **cómo se crea el agente**:

- **Agentes contratados** (Architect, Engineer, Frontend, QA — vía `+`/`paperclip-create-agent`):
  un solo **`AGENTS.md`** como bundle de instrucciones. No traen `SOUL/HEARTBEAT/TOOLS`. Su
  "heartbeat" lo toman de la **skill `paperclip` compartida** ("When you wake up, follow the
  Paperclip skill"). Por eso todo (carácter + reglas + ruteo) va dentro de su `agents/<rol>.AGENTS.md`.
- **CEO** (agente **raíz**, creado al crear la compañía): SÍ trae el set completo —
  `AGENTS.md` + `HEARTBEAT.md` + `SOUL.md` + `TOOLS.md`. Por eso en este playbook el CEO se divide
  en `agents/ceo.AGENTS.md` (instrucciones, fusionadas con el default) y `agents/ceo.SOUL.md`
  (personalidad).

### Cómo poblar los archivos del CEO
- **`AGENTS.md`** → **complementar** el default, no reemplazarlo a ciegas: conserva su mecánica
  (delegación, `request_confirmation`/flujo de plan, child-issues sin polling, skill
  `para-memory-files`), pero **sustituye su ruteo** (apunta a CTO/CMO/UXDesigner) por nuestro roster
  y añade las reglas del proyecto. Usa `agents/ceo.AGENTS.md`.
- **`HEARTBEAT.md`** → **dejar el default**. Respáldalo (`cp HEARTBEAT.md HEARTBEAT.default.md`) y a
  lo sumo *añade* prioridades; nunca quites pasos del protocolo.
- **`SOUL.md`** → **reescribir** con `agents/ceo.SOUL.md` (personalidad).
- **`TOOLS.md`** → **dejar el default** (salvo que quieras restringir acceso).

## Flujo para crear un agente
1. Abre `agents/<rol>.AGENTS.md`.
2. Usa la skill `paperclip-create-agent`: confirma identidad, descubre adapters/iconos, compara
   configs existentes.
3. Envía el hire con `instructionsBundle.files["AGENTS.md"]` = el contenido del archivo. **No** uses
   `adapterConfig.promptTemplate`.
4. El `cwd` de los agentes de código apunta a `../blog`.
