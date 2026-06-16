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
- `first-tasks/*.md` — los prompts de las primeras tareas que José/CEO usan para arrancar.

## Modelo de archivos de Paperclip (importante)
La versión instalada de Paperclip usa **un solo `AGENTS.md` por agente** como bundle de
instrucciones. **No existen `SOUL.md`, `HEARTBEAT.md` ni `TOOLS.md` por agente.** El procedimiento
de "heartbeat" vive en la **skill `paperclip` compartida** ("When you wake up, follow the Paperclip
skill"). Por eso todo el carácter + reglas de cada empleado va dentro de su `agents/<rol>.AGENTS.md`.

## Flujo para crear un agente
1. Abre `agents/<rol>.AGENTS.md`.
2. Usa la skill `paperclip-create-agent`: confirma identidad, descubre adapters/iconos, compara
   configs existentes.
3. Envía el hire con `instructionsBundle.files["AGENTS.md"]` = el contenido del archivo. **No** uses
   `adapterConfig.promptTemplate`.
4. El `cwd` de los agentes de código apunta a `../blog`.
