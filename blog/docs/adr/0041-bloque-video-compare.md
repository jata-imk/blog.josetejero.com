# 0041 — Tercer bloque custom de Lexical: `videoCompare` (video y comparación de video)

- Estado: aceptada
- Fecha: 2026-10-11
- Decidido por: board (José) + Claude Code

## Contexto

La entrada "Generar video con IA desde OpenClaw" compara el mismo prompt en tres proveedores
(Google Veo, Runway, xAI) en tres modos (texto→video, imagen→video, video→video). El blog no
sabía mostrar video: la colección `Media` solo aceptaba `image/*` y el converter `upload` pintaba
un enlace para cualquier archivo que no fuera imagen.

José diseñó el componente en Claude Design (proyecto *Comparación de video*). El diseño explora el
"problema de ancho" — tres videos en una columna de 760 px — con tres alternativas:

- **A · Breakout**: los tres a la vez rompiendo la columna (~350 px cada uno).
- **B · Escenario + lightbox**: un resultado a ancho completo + selector; un botón abre los N en
  un lightbox con reproducción sincronizada.
- **C · Pestañas de cuaderno**: como B pero con separadores tipo índice; oculta qué modelos hay.

Se eligió **B**. Con un solo resultado, B se reduce a marco + pie: el mismo componente sirve de
**reproductor de video genérico** para posts futuros.

ADR 0003 exige un ADR por cada bloque custom adicional; este documento cumple esa condición.

## Opciones consideradas

- **Colección `Videos` separada** — permitiría campos propios (duración, dimensiones), pero
  duplica la lógica de `Media` (acceso, almacenamiento, admin) para un único uso. YAGNI.
- **Video como `upload` nativo de Lexical** sin bloque — sirve para un video suelto, pero no
  puede expresar "entrada + prompt + N resultados con etiqueta". Se usa solo como fallback.
- **Bloque dedicado `videoCompare`** con campos tipados, mismo patrón que `chmodCalculator`
  (ADR 0031): definición → registro → converter → componente → estilos.

## Decisión

Tercer bloque custom: **`videoCompare`**. Los archivos viven en `Media`, que pasa a aceptar
`video/mp4` y `video/webm` (las `imageSizes` de Sharp se omiten solas para no-imágenes; no cambia
el esquema SQL, no hay migración).

```
slug: 'videoCompare'
fields:
  - title     text      opcional
  - mode      select    opcional: texto | imagen | video
  - prompt    textarea  opcional — vacío = sin cabecera ni bloque "Antes" (reproductor genérico)
  - input     upload    media, opcional, solo si mode es imagen o video
  - doodle    text      opcional — anotación a mano junto a "Después"
  - results   array     1..3
      - label   text    nombre del modelo; obligatorio si hay más de un resultado
      - accent  select  blue | violet | cyan | amber | rose (tokens existentes)
      - video   upload  media (solo video/*)
      - poster  upload  media (solo image/*), opcional
      - aspect  select  horizontal | vertical | square (default horizontal)
      - note    text    opcional — "8 s · 720p · $0.40"
  - caption   text      opcional → <figcaption>
```

Reglas:

- **El aspecto es un campo**, no se deduce: Payload no extrae dimensiones de un video y deducirlo
  en cliente (`loadedmetadata`) provocaría salto de layout.
- **Escenario de altura estable** (no cambia al cambiar de pestaña):
  todo horizontal → 16:9; mezcla → 4:3 (4:5 en móvil); todo vertical → 4:5 con altura tope
  `80svh` (9:16 en móvil); cuadrado → 1:1. El video va con `object-fit: contain` sobre un fondo
  de escenario (pillarbox).
- **Responsive por container query sobre el propio bloque**, no sobre la página: el bloque se
  adapta a la columna en que vive.
- `components/blocks/VideoCompare.tsx` es la isla `'use client'`; el converter le pasa props
  planas serializables ya resueltas desde los documentos `Media` poblados. Import estático, sin
  `next/dynamic()` (mismo razonamiento que ADR 0031).
- El lightbox usa `<dialog>` + `showModal()` (Esc y foco atrapado nativos, igual que el visor de
  figuras, ADR 0035). Un solo video suena a la vez; el que tiene audio es el reloj maestro y los
  demás se corrigen si se desvían más de 0,15 s.
- En pantalla completa los overlays desaparecen, así que cada video lleva una pista
  `<track kind="captions">` generada en cliente con el nombre del modelo.
- Un `upload` de video insertado directamente en el cuerpo se pinta con el mismo componente
  (1 resultado, sin etiqueta).
- El importador de Markdown no genera este bloque: se inserta a mano en el admin.

## Consecuencias

- Más fácil: cualquier post puede llevar video con el marco del blog; comparar modelos es
  rellenar un array.
- Payload sirve los archivos con soporte de `Range` (respuesta 206), requisito de Safari para
  reproducir y para saltar en la línea de tiempo.
- Los videos ocupan disco en el volumen `payload_media`; conviene subirlos remuxeados con
  `-movflags +faststart` para que empiecen a reproducirse antes de descargarse completos.
- Con tres bloques interactivos/compuestos, el criterio de ADR 0031 sobre un registro genérico
  de widgets sigue sin aplicar: `videoCompare` no es un widget de estado aislado sino contenido
  editorial con uploads.
