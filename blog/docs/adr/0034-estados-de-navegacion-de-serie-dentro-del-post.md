# 0034 — Estados de navegación de serie dentro del post

- Estado: aceptada
- Fecha: 2026-09-09
- Decidido por: Engineer (fix), board (José)

## Contexto

Una serie se presenta en dos superficies distintas:

1. **`/series/[slug]`** — la página índice de la serie. Muestra el *avance editorial*:
   cuánto contenido de la serie está publicado. La calcula `getSeriesWithPosts`
   y su contrato lo fija ADR 0014 §5: los posts publicados anteriores al último
   son `done`, el último publicado es `current`, y `soon` **no se sintetiza**
   (solo existiría si el CMS modelara entregas planeadas como dato real).

2. **`SeriesNav`** — el bloque que aparece *dentro* de un post, listando las
   entregas de su serie. Debe expresar otra cosa: *dónde está el lector* en la
   serie y a qué otras entregas puede saltar.

El bug (tarea Notion del 2026-09-07): `SeriesNav` calculaba el estado de cada
paso **solo por su posición respecto al post actual** — `i < current → done`,
`i === current → current`, `i > current → soon`. Todo lo posterior al post que
se está leyendo salía como **"Próximamente"** y *sin enlace*.

Pero `getPostsInSeries` — la consulta que alimenta `SeriesNav` — ya filtra
`status: published`. Los posts marcados `soon` eran, sin excepción, entregas
**ya publicadas y navegables**. El lector no podía abrirlas desde el post, y la
misma serie se contradecía entre sus dos superficies (en `/series/[slug]` esos
mismos posts salían enlazables). Además, `SeriesNav` incumplía la regla de
ADR 0014 §5: sintetizaba `soon` a partir de datos que no lo justificaban.

Bug secundario: si el post actual no aparecía en la lista (`currentIndex === -1`),
**todos** los pasos caían en `soon` y el bloque entero quedaba sin enlaces.

## Opciones consideradas

- **A — Reutilizar el vocabulario editorial (`done`/`current`) también en
  `SeriesNav`.** Simple, pero pierde la información de posición del lector: no
  hay forma de marcar "vas por aquí" ni de empujar a la siguiente entrega.
- **B — Mantener `soon` para lo posterior, pero con enlace.** Corrige la
  navegabilidad pero deja la etiqueta "Próximamente" mintiendo sobre contenido
  que sí existe, y sigue sintetizando `soon` contra ADR 0014 §5.
- **C — Vocabulario propio para `SeriesNav`, derivado de la posición de lectura,
  sin `soon`.** Separa explícitamente *posición de lectura* de *estado de
  publicación*. Más estados en el tipo, pero cada superficie usa el suyo.

## Decisión

**Opción C.** `SeriesStepStatus` se amplía a
`'done' | 'current' | 'next' | 'available' | 'soon'`, y una función pura
`seriesStepStatus(index, currentIndex)` (en `lib/data/series.ts`) deriva el
estado que usa `SeriesNav` desde la posición del lector:

| Situación | Estado | Etiqueta |
|---|---|---|
| Antes del post actual | `done` | Completado |
| El post actual | `current` | En progreso |
| El inmediatamente siguiente | `next` | Siguiente en la serie |
| Cualquier otro posterior | `available` | Disponible |
| Post actual no está en la lista (`currentIndex < 0`) | `available` | Disponible |

- **Ningún estado de `SeriesNav` suprime el enlace.** Todos los posts que recibe
  están publicados, así que todos son navegables. La guarda `state !== 'soon'` de
  `SeriesStep` se conserva por seguridad, pero `soon` ya no se produce.
- **`soon` / "Próximamente" queda en el tipo pero sin emisor.** Se reserva para
  el día en que el CMS persista entregas planeadas como dato real — coherente con
  ADR 0014 §5, que este ADR **complementa, no revoca**.
- **`getSeriesWithPosts` y `/series/[slug]` no se tocan.** Su contrato editorial
  (`done`/`current`) sigue vigente tal cual.
- **Progreso de `SeriesNav`:** pasa de `currentIndex / total` a
  `(currentIndex + 1) / total`. Es progreso de *lectura* (el post actual cuenta
  como leído), así que el último post de la serie llega al 100%. El progreso de
  `/series/[slug]` es otro cálculo (cobertura editorial) y no cambia.

## Consecuencias

- **Más fácil:** desde cualquier post se navega a cualquier entrega publicada de
  la serie; las dos superficies dejan de contradecirse; la regla de
  presentación vive en una función pura testeable, fuera del JSX.
- **Más difícil / deuda:** `SeriesStepStatus` tiene ahora un miembro (`soon`) que
  nadie emite — hay que recordar que es intencional (documentado aquí y en el
  comentario del tipo). Si algún día se modelan entregas planeadas, este es el
  enganche.
- **Sin tests automatizados:** el proyecto no tiene framework de test (decisión
  vigente). `seriesStepStatus` se dejó como función pura para poder cubrirla el
  día que lo haya; por ahora se verificó con Playwright contra el sitio servido
  y en producción.
- **CSS:** `.ab-step.next` / `.ab-step.available` se estilan con tokens
  existentes (`--bg-soft-2`, `--ink-2`, `--violet-tint`), sin opacidad reducida
  (no son pendientes). `.ab-step.soon` se conserva por si el estado revive.
