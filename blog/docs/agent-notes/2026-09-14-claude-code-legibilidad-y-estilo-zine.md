# Legibilidad del Cuaderno + estilo Zine

- Fecha: 2026-09-14
- Agente: Claude Code
- Rama: `design/legibilidad-cuaderno`
- ADR: `docs/adr/0037-legibilidad-hoja-de-lectura-y-estilo-zine.md`
- Comparativa visual (antes/después y direcciones A/B/C): artifact "Cuaderno legible"

## Cómo se decidió (método)

En vez de editar el CSS a ciegas, se prototipó con Playwright **inyectando hojas de estilo** sobre
el sitio real (`page.addStyleTag`). Así se compararon variantes en minutos, en claro, oscuro, móvil
y tablet, sin ensuciar el repo. Solo lo elegido pasó a `globals.css`.

## Por qué no se leía (conceptos)

- **Batido entre pauta e interlineado.** Una cuadrícula de 28 px con renglones de ~30 px hace que
  cada pocas líneas la raya caiga encima del texto. Bajar el alfa al 10 % y marcar solo cada 5
  cuadros conserva el "papel de ingeniería" sin que el ojo lo lea como tachado.
- **Máscara al revés.** `mask-image` define dónde se ve una capa. La radial original era opaca en
  el centro. El carril de lectura usa un `linear-gradient` horizontal: 35 % en la columna central,
  100 % en los márgenes.
- **Hoja con margen negativo.** Para poner el artículo sobre una hoja sin estrechar el texto:
  `box-sizing: content-box` + `padding` + `margin-inline` negativo del mismo tamaño. La caja crece
  hacia afuera y el contenido queda donde estaba.

## Estilo Zine como capa de tokens

Se añadió al final de `globals.css` en lugar de reescribir cada componente:
- se puede calibrar todo el sitio desde ~10 tokens (`--zine-*`);
- revertir es borrar una sección;
- regla: la cascada gana por orden, así que la capa debe seguir siendo lo último del archivo.

Cubre: botones, chips, orden, paginación, inputs y textarea, tags (recortes punteados en mono),
"Destacado" (sticker amarillo rotado), cat-pill, cards, prev/next, caja de autor, panel del Cuaderno,
menú móvil y paleta de búsqueda (inline styles → tokens).

## Otros cambios

- Textura por defecto 0.24 (CSS, bootstrap y panel alineados).
- `--ink-3` claro #536177.
- Panel: "Desvanecer bordes" → "Despejar zona de lectura" (cambió el significado del ajuste).
- El primer bloque de `.ab-prose` ya no hereda `margin-top: 52px` de los `h2` (dejaba la hoja con un
  hueco arriba).

## Particularidad del entorno (Windows)

Turbopack dejó de detectar cambios en `globals.css` varias veces e incluso sirvió CSS viejo desde
su caché persistente tras reiniciar. Solución fiable: detener `next dev`, borrar `blog/.next` y
volver a arrancar. Verificar buscando un selector nuevo en el CSS servido antes de sacar capturas.

## Verificación

- `pnpm lint` y `pnpm exec tsc --noEmit`: correctos.
- Playwright: `/`, `/blog`, post (inicio, cuerpo, prev/next, comentarios), `/series`, `/sobre-mi`,
  paleta de búsqueda, panel del Cuaderno y menú móvil; claro y oscuro; 1280, 1000 y 390 px.
  Sin scroll horizontal en ninguna medida.

## Pendiente (Fase 2)

- Cinta washi dibujada en SVG solo en la card destacada.
- Doodles con trazo de 2 px en `--zine-ink` y colores planos; migrar `--chalk-*` a paleta riso.
