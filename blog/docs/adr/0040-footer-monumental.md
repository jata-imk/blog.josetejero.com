# 0040 — Footer monumental: la contraportada del cuaderno

- Estado: aceptada
- Fecha: 2026-09-14
- Decidido por: board (José), implementado por Claude Code

## Contexto

Fase 5 (última) del rediseño "Cuaderno del Ingeniero". El footer original era un bloque gris claro con
tres columnas, sin personalidad, y tenía un enlace roto: "Contacto" apuntaba a `/contacto`, que no
existe (404 en producción).

## Opciones consideradas

- **Mantener fondo claro y solo agregar doodles** — cambio mínimo / no "cierra" la página; el footer
  se confunde con el contenido.
- **Invertir el tema en modo oscuro (footer claro)** — contraste llamativo / la cinta, la firma y el
  resaltador amarillos pierden contraste sobre claro.
- **Bloque de tinta oscuro en ambos temas ("contraportada")** — cierre claro, el amarillo resaltador
  funciona siempre, y la tipografía monumental en contorno se lee como marca de agua.
- **Texto monumental con `font-size` en `vw`** — se desborda o queda corto según el ancho y la fuente.
- **SVG con `textLength` + `lengthAdjust="spacingAndGlyphs"`** — ocupa exactamente el ancho a
  cualquier tamaño de pantalla.

## Decisión

- Footer con tokens propios (`--footer-bg/ink/muted/line/hl/monument`), oscuro en ambos temas
  (`#0f172a` claro, `#020617` oscuro), separado por el borde Zine.
- Cierre personal: "¿construimos algo juntos?" en Caveat con `DoodleSparkle` + botón "Escríbeme"
  (resaltador, sombra dura, `DoodleArrow`) hacia `mailto:` — el mismo contacto que ya usa "Sobre mí".
- Columnas: marca + descripción + firma manuscrita (Caveat con `ChalkUnderline` doble amarillo);
  "explorar", "el sitio" y "en otras libretas" con encabezados a mano; enlaces con resaltador que se
  despliega en hover/focus; redes como botones Zine con sombra amarilla.
- "JOSÉ TEJERO" monumental en contorno (SVG `aria-hidden`), cortado por el borde inferior.
- "Contacto" pasa de `/contacto` (404) a `mailto:`.
- Cabecera móvil muestra solo la marca "J" (hecho en ADR 0039, relacionado).

## Consecuencias

- La firma es tipográfica (Caveat), no un trazo SVG de firma real: coherente con el resto de
  anotaciones y sin paths hechos a mano difíciles de mantener.
- Si se crea una página `/contacto` en el futuro, cambiar `CONTACT_EMAIL` en `Footer.tsx`.
- El footer ya no usa los tokens de superficie del tema; cualquier componente nuevo dentro de él debe
  usar `--footer-*`.
