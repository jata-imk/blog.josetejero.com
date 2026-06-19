# 2026-06-18 — Product Architect — arquitectura del frontend para TOD-18

## Que hice

Cerre la decision arquitectonica del frontend publico del blog sin escribir implementacion:

- escribi el ADR `0006-estructura-frontend.md`
- actualice `docs/architecture/overview.md` con el arbol de carpetas, reglas de capas y mapa del
  inventario de componentes
- converti la tarea en un plan ejecutable para Engineer, Frontend y QA

## Por que Server Components por defecto

En App Router, un componente de servidor es el punto de partida correcto porque puede leer datos y
renderizar HTML sin enviar JavaScript extra al navegador. Para este blog eso encaja muy bien:

- la mayor parte de las pantallas son contenido, no aplicaciones ricas de interfaz
- el acceso a Payload ocurre en el servidor, cerca de la Local API
- se reduce el coste de hidratacion y se mantiene el frontend mas sencillo

`'use client'` solo entra cuando existe una interaccion real que lo justifica. En este proyecto los
casos claros son:

- boton de copiar en bloques de codigo
- menu movil
- estado activo del TOC mientras se hace scroll
- formulario de comentarios
- buscador si necesita reaccion inmediata al input

La regla practica es simple: si una pieza puede resolverse como render puro de datos ya disponibles,
debe quedarse en servidor.

## Por que aislar datos en `lib/data`

Payload ya es la capa de datos. Eso significa que no necesitamos inventar repositories ni una capa
de casos de uso para sentirnos "ordenados". Pero si dejamos que cada pagina llame `payload.find`
directamente, el acoplamiento se dispersa muy rapido.

`lib/data/*` resuelve ese problema con una capa minima:

- cada consulta importante tiene un nombre que expresa intencion (`getPostBySlug`, `getPosts`,
  `getSeriesWithPosts`)
- la logica de filtros, drafts, profundidad de relaciones y orden queda en un solo sitio
- las paginas consumen datos del dominio del blog, no detalles del API de Payload
- Engineer puede probar y evolucionar consultas sin tocar la capa de presentacion

Esta no es una arquitectura enterprise. Es una barrera pragmatica para mantener el codigo legible y
para que el board pueda ubicar rapido donde se obtienen datos y donde solo se renderizan.

## Limites deliberados

- no se introduce store global mientras no exista un problema real que lo exija
- no se persiste informacion derivable, como la posicion visible de un post dentro de una serie
- el render enriquecido (`CodeBlock`, tema oscuro, copiar, `Callout`) sigue siendo presentacion, no
  parte del schema de contenido

Ese limite es parte de la arquitectura: evita que el proyecto pague complejidad antes de necesitarla.
