# 0039 — Hero vivo (Fase 3) y collage de tarjetas (Fase 4) del Cuaderno

- Estado: aceptada
- Fecha: 2026-09-14
- Decidido por: board (José), implementado por Claude Code

## Contexto

Con el kit de doodles (ADR 0038) listo, faltaba usarlo donde se nota: el hero de la home y las
tarjetas. Las fases 3 y 4 del plan en Notion pedían máquina de escribir, anotación con flecha,
una micro-interacción que siga al cursor, tarjetas inclinadas y badges con estilo de sello/sticker.

Restricciones: idioma Zine (ADR 0037, sin blur ni degradados), LCP y SEO intactos (el `h1` no puede
depender de JS), accesibilidad (lectores de pantalla y `prefers-reduced-motion`).

## Opciones consideradas

- **Máquina de escribir sobre el `h1`** — impacto máximo / esconde el título hasta hidratar, daña LCP
  y SEO. **Descartada.**
- **Máquina de escribir en la frase de temas** — el `h1` queda estático; la frase muestra la primera
  palabra en SSR y el lector de pantalla recibe la lista completa. **Elegida.**
- **Haz de luz difuso tras el cursor** (glow radial) — contradice "sin blur" del estilo Zine.
- **Linterna sobre la cuadrícula** — la misma pauta con más tinta revelada por una máscara radial en
  el cursor: sigue siendo "papel y trazo". **Elegida.**
- **Categorías como sello de goma** — se prototipó (doble borde, mayúsculas, rotado) y el board
  prefirió el estilo anterior con el color propio de cada categoría. **Revertida.**
- **Cinta washi en todas las miniaturas** — descartada: el board pidió la cinta solo en la tarjeta
  destacada y el filtro activo.

## Decisión

Fase 3 (home):
- `ChalkCircle` rosa animado alrededor de "José Alejandro" (sin margen extra y `nowrap` para no
  empujar el emoji ni partir el nombre).
- `DoodleSparkle`: sustituye el "✦" de "cuaderno de notas" y dos chispas sueltas junto al título.
- `DoodleArrow` animada apuntando a los CTA en lugar del emoji 👈 (oculta en móvil).
- `HeroTypewriter` (client): rota "desarrollo web / automatización / inteligencia artificial /
  backend / frontend" con resaltador y cursor de bloque. SSR = primera palabra completa;
  `aria-hidden` + texto `sr-only` con la lista; con reduced-motion se queda fija.
- `HeroLamp` (client): escucha el puntero en `.hero-zone` y escribe `--lamp-x/--lamp-y/--lamp-on` en
  `.paper-canvas`. La capa `.paper-canvas-lamp` repite la pauta 3 veces bajo una máscara radial de
  190 px. Solo `pointer: fine` y sin reduced-motion.
- `--scroll-y` pasa de `.paper-canvas-grid` a `.paper-canvas` para que lo hereden pauta y linterna.

Fase 4:
- `.tilt-set`: tarjetas de "Posts destacados" y "Series recomendadas" con `rotate` de −1°, 0.8° y
  −0.5° que vuelve a 0 en hover/focus. `rotate` es independiente del `transform` del hover Zine.
- Badge de serie como sticker violeta con borde de tinta y sombra dura.

## Consecuencias

- El título y la frase se renderizan en el servidor; la animación es mejora progresiva.
- Dos islas cliente pequeñas en la home (`HeroTypewriter`, `HeroLamp`), sin dependencias.
- La linterna depende de que `--paper-grid` exista; con `data-grid="none"` se oculta.
- En móvil el `h1` baja a 38 px (32 px ≤380 px) con más interlineado para que el círculo no roce la
  línea anterior.
