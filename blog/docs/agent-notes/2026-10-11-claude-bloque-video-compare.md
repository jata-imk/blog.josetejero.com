# Bloque `videoCompare`: reproductor de video y comparación de modelos

Fecha local: 2026-10-11. Decisión de arquitectura: [ADR 0041](../adr/0041-bloque-video-compare.md).

## Qué se hizo

- `Media` acepta `video/mp4` y `video/webm` además de imágenes.
- Nuevo bloque de Lexical `videoCompare` (`lib/lexical/videoCompareBlock.ts`), registrado en el
  editor junto a `callout` y `chmodCalculator`.
- Converter en `lib/lexical/converters.tsx`: traduce los documentos `Media` poblados a props
  planas (`src`, `poster`, `aspect`, `label`…) y las pasa al componente. Un video subido como
  `upload` suelto en el cuerpo usa el mismo componente con un solo resultado.
- Componentes en `components/blocks/`:
  - `VideoCompare.tsx` — escenario + pestañas + botón «Ver los N juntos» (variante B del diseño).
  - `VideoLightbox.tsx` — vista de los N videos sincronizados.
  - `videoCompareShared.ts` — tipos y utilidades que comparten ambos (forma del escenario,
    nombre del modelo, pista de subtítulos para pantalla completa).
- Estilos `.ab-vc-*` al final de `app/globals.css`, más los tokens `--video-*` en la capa Zine.
- Assets del post 30 preparados en `output/entrada-video/videos/` (remux con `faststart`,
  posters WebP, imagen de entrada en WebP).

## Conceptos que conviene entender

### Una isla de cliente dentro de un documento de servidor

El cuerpo del post se pinta en el servidor (React Server Components): el converter recorre el
árbol Lexical y devuelve JSX. `VideoCompare` lleva `'use client'` porque necesita estado (qué
pestaña está activa, si el lightbox está abierto). React manda al navegador el HTML ya pintado y,
aparte, el JavaScript **solo de ese componente**; el resto del post no se hidrata. Por eso el
converter le pasa props planas (strings y números) y no el documento `Media` completo: lo que
cruza del servidor al cliente debe poder serializarse y conviene que sea mínimo.

### Por qué el aspecto es un campo y no se detecta

Para imágenes, Payload guarda `width` y `height` al subirlas. Para video no. El navegador sí
puede leer las dimensiones cuando carga los metadatos, pero eso ocurre después del primer pintado:
el escenario cambiaría de alto y el texto de abajo saltaría. Con un campo `aspect`, el servidor
ya sabe la forma y el CSS reserva el espacio exacto desde el principio.

### La forma del escenario no cambia al cambiar de pestaña

Todos los resultados comparten un mismo marco. Si todos son 9:16, el marco es 4:5 con un tope
de `80svh` y cada video se encaja dentro con `object-fit: contain`; las franjas laterales
(pillarbox) usan el color `--video-stage`. En móvil el marco pasa a 9:16 completo.

### Container queries en vez de media queries

El bloque declara `container: ab-vc / inline-size` y sus reglas responsive preguntan por **su
propio ancho** (`@container ab-vc (max-width: 480px)`). Así funciona igual en la columna de un
post, en una serie o en cualquier contenedor futuro, sin conocer el layout de la página.

### Range requests: por qué el video puede saltar

Un navegador no descarga un video entero antes de reproducirlo: pide trozos con la cabecera
`Range: bytes=…` y el servidor responde `206 Partial Content`. Safari exige esto para
reproducir. Payload ya lo implementa en su endpoint de archivos. Además, los MP4 se remuxearon
con `-movflags +faststart`, que mueve el índice del archivo (`moov`) al principio: sin eso, el
navegador tiene que pedir el final del archivo antes de poder empezar.

### Sincronizar varios `<video>`

No existe una API para atar varios videos a un mismo reloj. El lightbox elige como maestro el
video que tiene audio; en cada frame (`requestAnimationFrame`) lee su `currentTime` y, si otro
video se ha desviado más de 0,15 s, lo recoloca. Corregir en cada frame sin umbral provocaría
tirones, porque mover `currentTime` obliga al decodificador a buscar un fotograma clave.

### `<dialog>` y pantalla completa

El lightbox es un `<dialog>` abierto con `showModal()`: el navegador atrapa el foco, cierra con
Esc y hace inerte el resto de la página, sin JavaScript propio (igual que el visor de figuras).
En pantalla completa nativa los overlays del marco desaparecen; una pista de subtítulos generada
en el cliente con el nombre del modelo se activa solo en ese modo.

## Cómo se comprobó

En local (`pnpm dev` contra la BD de desarrollo) se creó con la Local API un post de prueba,
`/blog/prueba-video-compare`, con cinco casos: video genérico 16:9 sin prompt, texto→video con
tres verticales, imagen→video con imagen de entrada (uno sin poster), dos resultados de formato
mezclado y un video insertado como `upload` suelto. Con Playwright:

- **Tamaños del escenario** a 1440 px: 16:9 → 760×428, vertical → 760×720 (tope `80svh`), mixto
  → 760×570. A 800 px el bloque mide 680 y oculta miniaturas; la entrada pasa a 170 px. A 375 px
  vertical → 9:16 (324×576), mixto → 4:5, sin scroll horizontal. Tema claro y oscuro.
- **Bug encontrado y corregido**: con `aspect-ratio` y `max-height`, un bloque de ancho `auto`
  traslada el tope de alto al ancho y el marco se estrechaba (576 px). `width: 100%` lo fija.
- **Pestañas**: clic y ←/→ cambian de modelo y mueven el foco; la altura no cambia; el botón de
  play arranca el video y desaparece; la pista de subtítulos queda `hidden` fuera de pantalla
  completa.
- **Lightbox**: tras 4 s de reproducción los tres videos iban a ≤ 0,05 s entre sí; al terminar,
  el botón vuelve a «Reproducir»; arrastrar la barra a 2,5 s coloca los tres en 2,50; cambiar el
  audio silencia los demás; Esc cierra, desmonta los videos y devuelve el foco al botón. En móvil
  se ajustó la altura de los videos para que la nota inferior no se recorte, se ocultó el chip de
  modo y se bloqueó el scroll de la página mientras está abierto.
- **Range**: `GET` con `Range: bytes=0-1023` sobre un mp4 de Media → `206`,
  `Content-Range: bytes 0-1023/3896557`, `Accept-Ranges: bytes`.
- **Admin**: el bloque aparece en el editor con sus campos; «Entrada» se oculta sin modo
  imagen/video; el upload de video muestra el mp4.
- `tsc --noEmit` y `eslint` limpios. Consola del navegador sin errores.

No se creó migración: `mimeTypes` no es una columna y los bloques de Lexical se guardan como JSON
dentro del cuerpo. `payload generate:types` no produjo cambios.
