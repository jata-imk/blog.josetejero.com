# TOD-51: Corregir overflow horizontal en móvil (header)

## Diagnóstico

`.site-header-in` es un flex-row con 3 hijos: logo, `.site-nav` (5 links × ~100px), y div de iconos sociales (3 × 36px).
En viewport 390px con padding 18px el contenido disponible es ~354px; el nav solo ya necesita ~500px.

El diseño móvil aprobado (`ab-mobile.jsx`) muestra logo + burger: el nav completo no aparece en móvil.

## Fix aplicado

1. Añadida clase `header-social` al div de iconos en `Header.tsx` (elimina el `style` inline que habría anulado el media query).
2. En `globals.css`:
   - Definición de `.header-social` con `display:flex` en la capa base.
   - En `@media (max-width: 768px)`: `.site-nav, .header-social { display: none; }`.

## Lo que queda (follow-up)

El diseño especifica un hamburger button en móvil. No se implementó en este issue para respetar el scope. Candidato a TOD independiente.
