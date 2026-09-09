# 2026-09-09 — Engineer — Fix: navegación de serie decía "Próximamente" en posts ya publicados

## Qué hice

En el bloque de serie que sale **dentro de un post** (`SeriesNav`), toda entrega
posterior a la que se estaba leyendo aparecía como **"Próximamente"** y sin
enlace — aunque ya estuviera publicada. Cambié el cálculo de estado para que
distinga *posición del lector* de *estado de publicación*, y para que todas las
entregas publicadas sean navegables. Tarea de Notion:
"Corregir navegación de series: posts publicados aparecen como 'Próximamente'".

## Por qué (para quien está aprendiendo el stack)

### Las dos "vistas" de una serie

Una serie se enseña en dos sitios distintos, y **responden preguntas distintas**:

1. **`/series/[slug]`** — la página de la serie. Pregunta: *¿cuánto de esta serie
   está publicado?* Es avance **editorial**. Lo calcula `getSeriesWithPosts`:
   el último post publicado es `current`, los anteriores `done`. Punto. Ese
   contrato lo fijó ADR 0014 §5.

2. **`SeriesNav`** — el recuadro que aparece embebido cuando lees un post de la
   serie. Pregunta: *¿dónde voy yo y a qué otras entregas puedo saltar?* Es
   **posición de lectura**, no avance editorial.

El bug nació de usar la lógica de una para la otra.

### El bug, en concreto

`SeriesNav` recibe su lista de posts de `getPostsInSeries(seriesId)`. Esa función
hace una consulta a Payload con `where: { status: { equals: 'published' } }` — o
sea, **solo devuelve posts publicados; los borradores nunca salen**. Eso es
importante: significa que *cada* post que `SeriesNav` tiene en la mano ya está
publicado y ya es navegable.

Pero el componente decidía el estado de cada paso solo por su índice:

```tsx
const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'soon'
href={state !== 'soon' ? `/blog/${post.slug}` : undefined}
```

Traducción: "todo lo que viene después del post que estás leyendo es `soon`" — y
`soon` se pinta como "Próximamente" y **se le quita el `href`**, así que deja de
ser un enlace. Resultado: entregas publicadas, que en la página `/series/[slug]`
salían perfectamente enlazadas, dentro del post se anunciaban como si no
existieran todavía. Las dos vistas de la misma serie se contradecían.

Y había un caso peor: si `currentIndex` daba `-1` (el post actual no está en la
lista, p. ej. un post recién despublicado), **todos** los pasos caían en `soon` y
el recuadro entero se quedaba sin un solo enlace.

### El arreglo

La regla de estado se sacó del JSX a una **función pura** en
`lib/data/series.ts`:

```ts
export function seriesStepStatus(index: number, currentIndex: number): SeriesStepStatus {
  if (currentIndex < 0) return 'available'
  if (index < currentIndex) return 'done'
  if (index === currentIndex) return 'current'
  return index === currentIndex + 1 ? 'next' : 'available'
}
```

- Nunca devuelve `soon`. El tipo `SeriesStepStatus` lo sigue incluyendo, pero
  como estado *reservado* para el día en que el CMS guarde entregas planeadas
  como dato real (coherente con ADR 0014 §5). Hoy no lo emite nadie.
- Dos estados nuevos: `next` ("Siguiente en la serie", para empujar a continuar)
  y `available` ("Disponible", para el resto).
- `SeriesNav` ahora pasa `href` **siempre** — no hay estado sin enlace, porque no
  hay post sin publicar en la lista.

**Por qué función pura y no un `useMemo` o lógica inline:** el principio del
proyecto es *separar datos de presentación*. La regla "en qué estado está el
paso N" es lógica de dominio; el `<div className="ab-step ...">` es
presentación. Separadas, la regla se puede razonar (y algún día testear, cuando
haya framework de tests) sin renderizar nada. `lib/data/series.ts` ya es
`server-only` y `SeriesNav` es un Server Component, así que no hizo falta un
módulo aparte.

### La barra de progreso

De paso: `SeriesNav` calculaba el progreso como `currentIndex / total`. Leyendo
el último post de 5, eso da `4/5 = 80%` — nunca llegaba a 100 aunque hubieras
leído toda la serie. Ahora es `(currentIndex + 1) / total`: el post actual
cuenta como leído, el último marca 100%. Es progreso *de lectura*. El progreso
de `/series/[slug]` es otra cuenta distinta (cobertura editorial) y no se tocó.

## Archivos tocados

| Archivo | Cambio |
|---|---|
| `lib/data/series.ts` | + función pura `seriesStepStatus`; `SeriesStepStatus` ampliado a `done\|current\|next\|available\|soon`; comentarios que separan el contrato de `SeriesNav` del de `/series/[slug]` |
| `lib/data/index.ts` | exporta `seriesStepStatus` desde el barrel |
| `components/series/SeriesNav.tsx` | usa `seriesStepStatus(i, currentIndex)`; `href` siempre presente; progreso `(currentIndex+1)/total` |
| `components/series/SeriesStep.tsx` | `StepState` reemplazado por `SeriesStepStatus` importado (fuente única); etiquetas vía mapa `STEP_LABEL` |
| `app/globals.css` | + estilos `.ab-step.next` / `.ab-step.available` con tokens existentes; `.ab-step.soon` intacto |
| `docs/adr/0034-estados-de-navegacion-de-serie-dentro-del-post.md` | ADR nuevo (complementa ADR 0014 §5) |

## Fuera de alcance

- `getSeriesNavigationContext` (`lib/data/series.ts`) sigue siendo código muerto
  (no lo llama nadie; la página del post deriva prev/next por su cuenta). No se
  tocó; si se quiere borrar, va en tarea propia.
- No se instaló framework de tests. La verificación fue con Playwright contra
  `pnpm build && pnpm start` y luego en producción.

## Verificación

- `pnpm lint` y `npx tsc --noEmit`: limpios.
- Pendiente de correr por el board / QA con Playwright sobre el sitio servido:
  primer post de la serie muestra las entregas siguientes como "Siguiente en la
  serie" / "Disponible" y todas abren; último post marca 100%; `/series/[slug]`
  no cambia; contraste de los estados nuevos en claro y oscuro; un borrador de la
  serie no aparece en la navegación.
