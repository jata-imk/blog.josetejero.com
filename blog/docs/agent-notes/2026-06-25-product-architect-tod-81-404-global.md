# TOD-81 — arquitectura para 404 pública en producción

## Qué hice
- Revisé el issue `TOD-81`, la estructura actual de `app/layout.tsx`, `app/not-found.tsx` y
  `app/(frontend)/not-found.tsx`.
- Contrasté la semántica esperada con la documentación oficial actual de Next.js sobre
  `not-found` y `global-not-found`.
- Escribí el ADR 0017 para fijar cómo debe resolverse la 404 global sin romper el aislamiento CSS
  entre frontend y Payload.
- Preparé el reparto para implementación en Engineer con criterios de aceptación verificables en
  producción.

## Causa raíz
La 404 que se ve al abrir una URL inexistente no está entrando por el layout del route group
`(frontend)`, sino por la superficie global del app.

Eso importa porque el proyecto separó intencionalmente los estilos:

- `app/(frontend)/layout.tsx` carga `globals.css` y las fonts del sitio
- `app/layout.tsx` quedó mínimo para que Tailwind no toque `/admin`

Resultado: el `404` global renderiza markup con clases como `btn`, `btn-grad` o `code-404`, pero
sin el CSS que define esas clases. En dev esto puede pasar más desapercibido; en `next start` queda
claro porque la ruta no resuelta entra por la convención global y no por el shell público.

## Decisión
No vamos a “arreglar” esto volviendo a importar Tailwind en `app/layout.tsx`, porque eso repetiría
el bug ya resuelto del admin de Payload.

La solución correcta para este repo es:

- 404 de URL inexistente: `app/global-not-found.tsx`
- 404 por `notFound()` dentro de rutas públicas: `app/(frontend)/not-found.tsx`
- root layout: seguir mínimo, sin CSS global del frontend

## Por qué
Esto mantiene dos decisiones compatibles entre sí:

1. Payload queda aislado de Tailwind.
2. La 404 pública vuelve a tener shell, tipografía y tokens del sitio en producción.

## Siguiente acción
- Crear subtarea para Engineer que active `globalNotFound`, implemente `app/global-not-found.tsx`,
  elimine la ambigüedad con `app/not-found.tsx` y valide:
  - URL inexistente con `pnpm build` + `pnpm start`
  - `notFound()` de rutas públicas
  - `/admin` sin regresión visual
