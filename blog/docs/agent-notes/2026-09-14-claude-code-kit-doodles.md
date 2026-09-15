# Kit de Trazos & Doodles (Fase 2 del Cuaderno)

- Fecha: 2026-09-14
- Agente: Claude Code
- Rama: `feat/doodles-kit`
- ADR: `docs/adr/0038-kit-de-trazos-y-doodles.md`

## Qué se hizo

- `components/ui/Doodles.tsx`: `ChalkUnderline`, `ChalkCircle`, `DoodleArrow`, `DoodleSparkle`,
  `WashiTape`.
- Tokens `--chalk-*` a paleta riso (claro/oscuro) + `--chalk-ink`.
- CSS del kit en `globals.css`, **antes** de la capa Zine (que debe seguir siendo lo último).
- Colocación: cinta en card destacada de /blog, en la primera card destacada de la home y en el
  filtro activo; subrayados en títulos de sección (home) y `h1` de /blog, /series, /categorías.
- `PostCard` gana la prop `tape`.

## Conceptos útiles

- **`currentColor`**: el SVG pinta con el `color` CSS del elemento. Así un mismo trazo sirve para
  todos los tonos y temas: la clase `.doodle-tone-blue` pone `color: var(--chalk-blue)` y el tema
  oscuro redefine el token.
- **Estirar sin engordar el trazo**: el subrayado se dibuja en un lienzo 200×12 y se estira al ancho
  del texto con `preserveAspectRatio="none"`. Eso deformaría el grosor, así que cada `path` lleva
  `vector-effect="non-scaling-stroke"`: el trazo mide 2 px siempre.
- **Animación de "dibujado"**: `pathLength="1"` normaliza la longitud del trazo; con
  `stroke-dasharray: 1` y `stroke-dashoffset` de 1 → 0 el trazo aparece de principio a fin.
- **Cinta con máscara**: la silueta rasgada es un SVG usado como `mask-image` estirado a la caja; el
  color es un `background` liso translúcido (`color-mix` con `currentColor`). Sin `<pattern>` no hay
  ids que colisionen.

## Decisiones del board durante la tarea

- Cinta washi **lisa** (se quitó un rayado diagonal del primer prototipo).
- Nada de doodles dentro del cuerpo de los posts.
- Sí a subrayados en títulos de sección además de las cintas.

## Verificación

- `pnpm lint` y `pnpm exec tsc --noEmit`: correctos.
- Página temporal de muestra (no commiteada) para revisar los 6 tonos, variantes y animación en claro
  y oscuro.
- Playwright en `/`, `/blog`, `/series`: claro, oscuro y 390 px; sin scroll horizontal.
- Ajustes tras revisión visual: subrayado más pegado al texto, círculo sin invadir palabras vecinas,
  rasgado más marcado y cinta más opaca en oscuro (el amarillo se veía oliva).
