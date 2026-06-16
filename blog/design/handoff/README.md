# Handoff de Claude Design — Aleliz Blog

Bundle "Export to Claude Code" ya importado (fuente: `api.anthropic.com/v1/design/h/_mUEH6h0PTstFeWYhHignw`).
Es la **fuente de verdad visual**. No se edita; se consume.

## Contenido (`sistema-de-pantallas/`)
- `README.md` — instrucciones del propio handoff ("read the chat first").
- `chats/chat1.md` — transcripción con la **intención del usuario** (brief de 499 líneas + decisiones).
- `project/` — el prototipo en HTML/CSS/JS:
  - `aleliz.css` — **el design system completo** (tokens + clases de componentes). Fuente de los tokens.
  - `ab-kit.jsx`, `ab-kit2.jsx` — librería de componentes (iconos, header, cards, formularios…).
  - `ab-data.jsx` — contenido de ejemplo.
  - `ab-pages-1/2.jsx`, `ab-mobile.jsx`, `ab-system.jsx` — las 12 pantallas + estados + design system.
  - `ab-render.jsx`, `design-canvas.jsx`, `Aleliz Blog Canvas.html` — ensamblado del canvas.
  - `uploads/*.png` — capturas de referencia del blog anterior.

## Specs derivadas (ya extraídas)
- `../tokens.md` — tabla legible de tokens reales.
- `../component-inventory.md` — mapeo componente → clase CSS → estados.
- `../globals.css` — **token layer ejecutable**, listo para copiar a `src/app/globals.css` (Fase 2).

## Notas
- El prototipo está scoped bajo `.ab`. Al implementar en React+Tailwind: **reproducir el resultado
  visual**, no copiar la estructura del prototipo (lo dice el README del handoff).
- Marca del diseño = "Aleliz Blog"; pendiente decidir el branding final para josetejero.com.
