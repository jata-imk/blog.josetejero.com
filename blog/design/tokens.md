# Design tokens — Aleliz Blog (extraídos del handoff)

> Extraídos del `:root` y las clases de `handoff/sistema-de-pantallas/project/aleliz.css` (fuente de
> verdad). La versión ejecutable está en `design/globals.css` (se fusiona en `app/globals.css`).
> Estilo: editorial · técnico · minimal · **light + dark** (ADR 0028). Inter + JetBrains Mono.
> **Regla dura:** cero hardcodeo en componentes — siempre la variable/clase.

## Color

### Superficies
| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#ffffff` | fondo de página |
| `--bg-soft` | `#f8fafc` | fondo secundario / hover sutil |
| `--bg-soft-2` | `#f1f5f9` | fondo terciario / badges soft |

### Tinta (texto)
| Token | Valor | Uso |
|---|---|---|
| `--ink` | `#0f172a` | texto principal / headings |
| `--ink-2` | `#334155` | cuerpo de lectura |
| `--ink-3` | `#64748b` | texto secundario / metadata |
| `--muted` | `#94a3b8` | texto atenuado / placeholders |

### Líneas
| Token | Valor | Uso |
|---|---|---|
| `--line` | `#e9edf3` | bordes/divisores suaves |
| `--line-2` | `#e2e8f0` | bordes de inputs/cards |

### Acentos
| Token | Valor | Uso |
|---|---|---|
| `--blue` | `#2563eb` | primario (links, activo, focus) |
| `--blue-700` | `#1d4ed8` | hover/énfasis azul |
| `--violet` | `#7c3aed` | acento series / IA / backend |
| `--cyan` | `#06b6d4` | acento bases de datos |
| `--green` | `#10b981` | éxito / tip / devops |
| `--amber` | `#f59e0b` | advertencia / tutoriales / pendiente |
| `--rose` | `#e11d48` | error |

### Tints (fondos suaves de acento, precomputados sobre blanco)
`--blue-tint #eaf0fe` · `--violet-tint #f1eafe` · `--cyan-tint #e2f6fb` · `--green-tint #e3f7ef` ·
`--amber-tint #fdf2dd` · `--slate-tint #eef2f7`

### Gradiente (solo momentos clave: logo, badges destacado, CTA, 404, progreso de serie)
| Token | Valor |
|---|---|
| `--grad` | `linear-gradient(115deg, #2563eb 0%, #6d3aed 55%, #7c3aed 100%)` |
| `--grad-soft` | `linear-gradient(115deg, #eef3ff 0%, #f3edff 100%)` |

### Mapeo categoría → color (para `data-cat`)
`frontend`→azul `#2563eb` · `backend`→violeta `#7c3aed` · `bases-de-datos`→cyan `#0891b2` ·
`ia`→violeta `#7c3aed` · `devops`→verde `#059669` · `tutoriales`→ámbar `#d97706` ·
`opinion`→slate `#475569` (cada uno con su `--tint`).

## Tipografía
- **Sans:** `Inter` (con `font-feature-settings: 'cv02','cv03','cv04','cv11'`), fallback `system-ui, -apple-system, sans-serif`.
- **Mono:** `JetBrains Mono`.
- Pesos usados: 400, 450, 500, 600, 700, 800.

| Rol | Tamaño | Peso | Notas |
|---|---|---|---|
| Hero / display | ~42–52px | 800 | `letter-spacing: -.04em` |
| H1 post (`.ab-feat-title`) | 28px | 800 | `-.03em` |
| H2 prosa (`.ab-prose h2`) | 25px | 700 | `-.025em`, `margin-top:40px` |
| H3 prosa | 20px | 700 | `margin-top:30px` |
| Título card (`.ab-post-title`) | 17.5px | 700 | `line-height:1.3` |
| Body lectura (`.ab-prose`) | 17px | 400 | `line-height:1.75`, color `--ink-2` |
| Texto UI base | 14–15px | 500 | |
| Small / metadata | 12.5–14px | 500 | color `--ink-3`/`--muted` |
| Mono / código | 13.5px | 400–500 | `line-height:1.7` |

## Radios
`--r-sm 8px` · `--r 12px` · `--r-lg 16px` · `--r-xl 20px` · `--r-2xl 26px`

## Sombras (whisper-soft)
| Token | Valor |
|---|---|
| `--sh-1` | `0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.05)` |
| `--sh-2` | `0 2px 4px rgba(15,23,42,.04), 0 6px 18px rgba(15,23,42,.06)` |
| `--sh-3` | `0 10px 30px rgba(15,23,42,.08), 0 2px 6px rgba(15,23,42,.05)` |
| `--ring` | `0 0 0 3px rgba(37,99,235,.16)` (focus) |

## Espaciado
Escala base **4px**: 4 · 8 · 12 · 16 · 24 · 32 · 48.
Contenedores: `--wrap` 1120px (padding 40px), `--wrap-narrow` 760px (ancho de lectura). Header 64px (sticky, blur). Mobile padding 18px, header 56px.

## Notas de adaptación a josetejero.com
- **Branding (DECIDIDO):** la marca es **"José Tejero"**, no "Aleliz Blog". Ver `branding.md`. El
  bundle crudo en `handoff/` se deja intacto (fuente de verdad del diseño); la adaptación de marca
  se aplica al implementar los componentes.
- El copy de muestra menciona **Prisma**; en este proyecto Prisma está descartado (ADR 0001). Es solo
  texto de ejemplo del mockup, no afecta los tokens ni el diseño.
