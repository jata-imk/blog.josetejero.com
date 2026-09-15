# Footer monumental (Fase 5 del Cuaderno)

- Fecha: 2026-09-14
- Agente: Claude Code
- Rama: `feat/cuaderno-fase-5-footer`
- ADR: `docs/adr/0040-footer-monumental.md`

## Qué se hizo

- `components/layout/Footer.tsx` rediseñado: bloque de tinta, cierre "¿construimos algo juntos?" con
  botón a email, firma manuscrita, columnas con encabezados a mano, redes estilo Zine y "JOSÉ TEJERO"
  monumental en contorno.
- Bug corregido: "Contacto" apuntaba a `/contacto` (404 en producción) → `mailto:`.
- Estilos en `globals.css` (sección "footer: contraportada del cuaderno") con tokens `--footer-*`;
  2 columnas en móvil y tablet.

## Conceptos útiles

- **Texto que llena el ancho exacto.** Un `<text>` SVG con `textLength="1000"` dentro de un
  `viewBox` de 1000 de ancho ocupa siempre el 100 % del SVG; como el SVG escala con `width: 100%`,
  la palabra se ajusta a cualquier pantalla sin calcular tamaños de fuente.
- **Contorno sin engordar.** `fill: none` + `stroke` con `vector-effect: non-scaling-stroke` mantiene
  la línea en 1.5 px aunque el SVG crezca.
- **Resaltador animable.** Los enlaces tienen un `background` degradado duro (transparente 58 % /
  amarillo) con `background-size: 0 100%`; en hover pasa a `100% 100%` y la franja "se pinta" de
  izquierda a derecha.

## Verificación

- `pnpm lint` y `pnpm exec tsc --noEmit`: correctos.
- Playwright: footer en `/series` a 1280 px claro/oscuro y 390 px; sin scroll horizontal.
