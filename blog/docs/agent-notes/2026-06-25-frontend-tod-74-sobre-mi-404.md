# TOD-74 — About + 404 implementados según ADR 0015

## Qué se hizo

- `public/documents/cv.pdf` — CV movido desde `app/CV.pdf` a ruta pública estable.
- `components/about/content.ts` — contenido tipado separado de la composición (bio, experiencia, skills, social URLs, ref al CV). Sin hardcodeos en JSX.
- `app/(frontend)/sobre-mi/page.tsx` — página About completa: hero 2-col, bio prose, timeline de experiencia, card CV con descarga + visor `<object>` nativo, skills agrupadas por área.
- `app/(frontend)/not-found.tsx` — rehecho con `.code-404` (número 150px gradiente), copy del handoff, Btn grad/secondary con iconos, hint de búsqueda.
- `components/ui/Skill.tsx` — añadido `iconHex` prop para colores de marca de tecnologías externas (brand colors no son tokens de sistema).
- `components/ui/Ic.tsx` — añadidos iconos: `download`, `mail`, `fileText`, `home`, `mapPin`, `briefcase`.
- `app/globals.css` — clase `.about-hero-grid` en responsive para colapsar el grid hero en móvil.

## Decisiones

**PDF viewer**: se usa `<object>` (fallback `<div>` con link) en lugar de `<iframe>`. Ambos son HTML nativo; `<object>` tiene mejor fallback semántico cuando el tipo MIME no está soportado.

**iconHex en SkillChip**: las imágenes de las skills tienen colores de marca de tecnologías externas (PHP morado, Python azul, etc.), no de nuestro design system. Se añadió un prop opt-in `iconHex` que solo afecta el fondo del icono; el chip en sí sigue usando las clases del sistema.

**Contenido en código**: confirma ADR 0015 opción C. El módulo `content.ts` actúa como la única fuente de verdad hasta que el board decida modelar esto en Payload.

## Social links

Los URLs sociales viven en `components/about/content.ts` y en `components/layout/Header.tsx` / `Footer.tsx`. Las tres pantallas nuevas apuntan al mismo dominio (`github.com/josetejero`, `x.com/josetejero`, `linkedin.com/in/josetejero`). Si cambian, solo hay dos archivos que actualizar.
