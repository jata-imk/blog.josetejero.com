# 2026-08-04 — Engineer — Fix: imágenes portrait recortadas en el cuerpo

## Qué hice

Al revisar el post publicado de permisos Linux, el autor reportó que una imagen inline (portrait,
1122×1402) se veía recortada en el blog — le faltaba un tercio de la imagen por abajo. Investigué
la causa raíz y apliqué el fix.

## Por qué (para quien está aprendiendo el stack)

**Cómo Payload genera tamaños de imagen.** Cuando subes una imagen a la colección `Media`,
Payload no guarda solo el archivo original: además genera copias redimensionadas según
`imageSizes` en `collections/Media.ts` — por ejemplo un `thumbnail` de 480×270 para las tarjetas de
listado. Cada tamaño puede pedir un `width` y un `height` fijos; si pides los dos, Payload usa
`sharp` (la librería de procesamiento de imágenes) para **recortar** (`fit: cover`) la imagen y que
encaje exacto en ese rectángulo, centrado.

**El bug.** Los tres tamaños que ya existían (`thumbnail`, `card`, `hero`) son **los tres 16:9**,
pensados para portadas de post (siempre horizontales). No había ningún tamaño pensado para
imágenes *dentro* del cuerpo del post, que pueden tener cualquier proporción — como un diagrama
vertical. Cuando subes una imagen portrait al cuerpo, Payload igual le genera esos tres tamaños
16:9 recortados, porque no sabe que "esta imagen es de cuerpo, no de portada".

**Por qué se veía el crop de `hero` específicamente.** El renderer del cuerpo (Lexical → React) no
tenía un converter propio para el nodo `upload` — usaba el que trae la librería de Payload por
defecto. Ese converter arma un `<picture>` con una etiqueta `<source>` por cada tamaño disponible,
cada una con una condición de tipo "úsame si la ventana del navegador mide como máximo N píxeles".
El problema: N es el ancho *del tamaño generado* (480, 960, 1920), no tiene nada que ver con si esa
imagen está bien recortada o no. El navegador elige la primera condición que se cumple, así que en
cualquier ventana de escritorio normal (961 a 1920px, la inmensa mayoría) terminaba sirviendo el
`hero` de 1920×1080 — el mismo crop pensado para portadas — sin que nadie lo pidiera para esa
imagen.

**El fix, en dos partes:**

1. `collections/Media.ts` gana un cuarto tamaño, `content`, que **solo pide `width` (sin
   `height`)**. Sin una altura objetivo, `sharp` no tiene por qué recortar: simplemente achica el
   ancho y la altura se ajusta sola, manteniendo la proporción original. Si la imagen ya es más
   angosta que el target, Payload directamente no genera ese tamaño (para no agrandarla sin
   necesidad).
2. `lib/lexical/converters.tsx` gana un converter propio para `upload` (mismo patrón que ya existía
   para `heading`, `table`, y los bloques custom). En vez del `<picture>` con las tres fuentes
   recortadas, siempre usa `content` — o el original si `content` no se generó — en una única
   `<img>`. Nunca más un tamaño recortado en el cuerpo.

Este cambio **revierte una decisión previa** documentada en ADR 0023 ("no se añadió converter
custom porque no hacía falta"). Esa decisión era correcta *en ese momento* — no había casos reales
de imágenes portrait en el cuerpo para probarla —, pero ya no cubría la realidad. Se documentó como
un "Ajuste" nuevo en el mismo ADR, no como una decisión nueva desde cero: el patrón del proyecto es
que las decisiones de arquitectura se anotan donde viven, y se corrigen ahí mismo cuando la realidad
las desmiente.

## Archivos tocados

| Archivo | Cambio |
|---|---|
| `collections/Media.ts` | + tamaño `content` (solo `width: 1000`, sin recorte) |
| `lib/lexical/converters.tsx` | + converter custom `upload`, usando siempre `content`/original |
| `docs/adr/0023-series-body-depth-e-imagenes-inline.md` | + sección "Ajuste" (2026-08-04) |

No hizo falta migración de BD: `imageSizes` es configuración de Payload, no una columna. Sí hizo
falta `pnpm generate:types` (Media gana `sizes.content` en el tipo generado).

## Trade-off aceptado

El `<picture>` que se descartó tenía una ventaja real: servía un archivo más chico en móvil. El
converter nuevo siempre sirve el mismo `content` (o el original) sin importar el viewport. Para
este blog —diagramas técnicos, no fotos pesadas— nunca recortar el contenido vale más que ahorrar
unos KB en pantallas chicas. Si en el futuro el peso de imagen se vuelve un problema real, se puede
revisar con su propio ADR.

## Verificado

- `pnpm generate:types`, `tsc --noEmit`, `eslint` sobre los dos archivos → limpio.
- Pendiente (requiere `pnpm dev` + túnel a la BD, y luego build+deploy a producción): confirmar
  visualmente que una imagen portrait nueva no se recorta, y regenerar los tamaños de la imagen ya
  publicada (`permisos-linux-rwx-777-desglose-rwx.png`, media id 35) re-subiéndola una vez el fix
  esté en producción.

## Pendiente / próximos pasos

- Build + deploy siguiendo `docs/runbooks/deploy.md` ("Redeploy tras cambios de código"). Sin
  migración.
- Tras el deploy: en `/admin/collections/media/35`, reemplazar el archivo (mismo PNG) para que
  Payload regenere sus tamaños con el `imageSizes` nuevo, y así la imagen ya publicada deje de
  verse recortada.
