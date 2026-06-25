# 0017 — 404 global con `global-not-found` y shell público explícito

- Estado: aceptada
- Fecha: 2026-06-25
- Decidido por: Product Architect

## Contexto
El proyecto separó los estilos globales del frontend y del admin para que Tailwind no rompa la UI
de Payload. Como consecuencia, `app/layout.tsx` quedó mínimo y ya no carga `globals.css` ni el shell
del sitio.

Esto reabrió un problema en la 404 pública: las URLs inexistentes del sitio se resuelven por
`app/not-found.tsx`, que hoy vive fuera del route group `(frontend)`. En producción (`pnpm build` +
`pnpm start`), esa ruta global no hereda el layout del frontend y la pantalla aparece sin estilos,
sin tipografías y sin la composición aprobada.

Necesitamos conservar dos invariantes al mismo tiempo:

- el admin de Payload no puede volver a recibir Tailwind desde `app/layout.tsx`
- la 404 pública para URLs no resueltas debe verse igual que el resto del sitio

## Opciones consideradas
- Mantener `app/not-found.tsx` y volver a cargar `globals.css` desde `app/layout.tsx` o desde el root
  layout.
  Pros: cambio pequeño en apariencia.
  Contras: reintroduce el mismo acoplamiento CSS que ya rompió Payload; la causa raíz no cambia.
- Mantener `app/not-found.tsx` y duplicar dentro de esa pantalla todos los estilos críticos.
  Pros: evita tocar el layout raíz.
  Contras: duplica tokens, tipografías y shell; convierte la 404 en una excepción frágil.
- Usar `app/global-not-found.tsx` para URLs no resueltas y dejar `app/(frontend)/not-found.tsx` como
  manejo segmentado de `notFound()`.
  Pros: encaja con la semántica actual de Next para 404 globales, mantiene aislado el admin y hace
  explícitas las dependencias de estilos/fuentes del 404 global.
  Contras: depende de una flag experimental de Next y exige declarar shell/estilos de forma
  explícita en esa pantalla.

## Decisión
Adoptamos la tercera opción.

La convención a partir de este issue es:

- `app/global-not-found.tsx` será la 404 global para URLs que no matchean ninguna ruta del app.
- Esa pantalla importará de forma explícita `globals.css` y `fonts.ts`, y renderizará el shell
  público necesario (`Header`, `Footer`, body/html y clases base del sitio).
- `app/(frontend)/not-found.tsx` seguirá siendo la 404 segmentada para `notFound()` lanzados desde
  páginas públicas existentes.
- `app/layout.tsx` no volverá a cargar Tailwind ni el shell del frontend. Su papel sigue siendo
  mínimo para no mezclar las capas del frontend y Payload.
- `app/not-found.tsx` deja de ser la fuente de verdad para la 404 pública global; si permanece, no
  debe competir con la convención anterior.

## Consecuencias
- Más fácil: la 404 de URLs inexistentes y la 404 de `notFound()` en frontend dejan de depender de
  una composición implícita del root layout.
- Más fácil: se conserva el aislamiento CSS entre frontend y Payload, que ya es una decisión cerrada
  del proyecto.
- Más difícil: la 404 global debe declarar explícitamente sus dependencias visuales en vez de
  “heredarlas”.
- Deuda aceptada: usamos una capacidad experimental de Next porque resuelve exactamente este borde
  sin reabrir la arquitectura del layout raíz. Si Next cambia esta API, el fallback aceptable será
  revisar la estrategia global de layouts, no volver a inyectar Tailwind en `app/layout.tsx`.
