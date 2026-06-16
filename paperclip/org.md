# Organización de la empresa

Empresa: **blog-josetejero**. Org plana, 5 agentes. Lógica de modelos: **repartir carga entre
proveedores** para no esperar cuotas (el cuello de botella es la cuota por proveedor, no el dinero).

## Roster

| Agente | Rol | Modelo | Adapter | Reporta a | Carga | Por qué ahí |
|---|---|---|---|---|---|---|
| **CEO** | coordinador | Claude Haiku 4.5 | `claude_local` | board (José) | mínima | Solo delega y verifica. Casi no consume cuota Claude. |
| **Product Architect** | arquitectura | GPT-5.4 | `codex_local` | CEO | media | Scoping + ADRs. Vive en cuota OpenAI, libera Claude. |
| **Engineer** | backend/boilerplate | DeepSeek v4 Pro | adapter DeepSeek | CEO | **pesada** | El grueso del código. Carga su propia cuota → no toca Claude ni OpenAI. |
| **Frontend/Diseño** | UI / handoff→código | Claude Sonnet 4.6 | `claude_local` | CEO | media | Lo mejor en React/Tailwind/design-systems. Aquí sí vale la cuota Claude. |
| **QA** | calidad | GPT-5.4 | `codex_local` | CEO | ligera | Revisa diffs y gate visual. Comparte cuota con Architect sin estorbar. |

Resultado: Claude solo en CEO (casi nada) + Frontend (lo que importa). DeepSeek carga el trabajo
pesado. GPT lleva planeación + QA. Tres carriles, nadie se atasca.

## Plantilla base de cada `AGENTS.md` (de `paperclip-create-agent`)
| Agente | Plantilla de origen |
|---|---|
| CEO | baseline-role-guide (charter de coordinación; no codea) |
| Architect | baseline-role-guide (charter de arquitectura + ADRs) |
| Engineer | `references/agents/coder.md` |
| Frontend | `references/agents/uxdesigner.md` (adjacente; conserva lentes visuales) |
| QA | `references/agents/qa.md` |

## Palanca para lo difícil
Para el importador (lo más peludo), si el Engineer-DeepSeek se traba, **sube su `model`
puntualmente a Claude Sonnet/Opus** y luego regrésalo. Así no necesitas un 6º agente "Senior" (YAGNI).
Solo clona un segundo Engineer si hay saturación real de trabajo en paralelo.
