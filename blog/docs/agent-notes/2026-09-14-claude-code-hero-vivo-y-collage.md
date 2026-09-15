# Hero vivo y collage (Fases 3 y 4 del Cuaderno)

- Fecha: 2026-09-14
- Agente: Claude Code
- Rama: `feat/cuaderno-fase-3-4`
- ADR: `docs/adr/0039-hero-vivo-y-collage.md`

## Qué se hizo

- Hero: círculo a mano en el nombre, chispas, flecha hacia los CTA, máquina de escribir en la frase
  de temas y linterna que marca la cuadrícula bajo el cursor.
- Tarjetas destacadas y de series con inclinación sutil que se endereza en hover.
- Badge "Serie" como sticker.
- Nuevos: `components/home/HeroTypewriter.tsx`, `components/home/HeroLamp.tsx`; capa
  `.paper-canvas-lamp` en `PaperBackground`.

## Conceptos útiles

- **Mejora progresiva con Server + Client Components.** La home es un Server Component; solo la
  máquina de escribir y la linterna son islas `'use client'`. El HTML inicial ya trae el título, el
  círculo y la primera palabra: si el JS tarda o falla, la página se ve completa.
- **Evitar saltos al hidratar.** El estado inicial del typewriter coincide con lo que renderizó el
  servidor (primera palabra completa); la animación empieza después, en `useEffect`.
- **Accesibilidad de la animación.** El texto que cambia es `aria-hidden`; un `sr-only` da la lista
  completa una sola vez. `prefers-reduced-motion` detiene typewriter, linterna y dibujado de trazos.
- **Una variable, varios hijos.** Escribir `--scroll-y` en `.paper-canvas` hace que pauta y linterna
  la hereden; sigue siendo un subárbol mínimo, no `:root`.
- **`rotate` vs `transform`.** CSS tiene `rotate`, `scale` y `translate` como propiedades separadas.
  La inclinación usa `rotate` y el hover Zine usa `transform: translate(...)`: se combinan sin pisarse.

## Cambios por feedback del board

- Categorías: se probó "sello de goma" y se revirtió a su tinte con color por categoría.
- Sin cinta en todas las miniaturas (solo destacada y filtro activo, ADR 0038).

## Verificación

- `pnpm lint` y `pnpm exec tsc --noEmit`: correctos.
- Playwright: hero en claro/oscuro (typewriter avanzando, `--lamp-on` activo al mover el mouse),
  tarjetas inclinadas, series, móvil 390 px y 340 px sin scroll horizontal.
