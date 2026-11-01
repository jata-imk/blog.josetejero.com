# 0042 — Cuarto bloque custom de Lexical: `audioPlayer` (reproductor de audio)

- Estado: aceptada
- Fecha: 2026-11-01
- Decidido por: board (José) + Claude Code

## Contexto

La entrada «Generar música con OpenClaw» muestra los resultados de un laboratorio: canciones
generadas a partir de una letra, de una imagen y de un tarareo. El blog no sabía reproducir
audio: `Media` solo aceptaba imagen y video, y el converter `upload` pintaba un enlace para
cualquier otro archivo.

José diseñó el componente en Claude Design (proyecto «Blog Next JS», archivo «Reproductor de
audio»). El diseño trae tres vistas (compacta, expandida y modo foco), una ficha técnica (modelo,
proveedor, duración pedida/obtenida, tiempo de generación, costo, formato), la letra, el
espectro en la vista expandida, loop, volumen y descarga.

Al revisarlo, José decidió **recortarlo**: «siento que tendrá mucha info». Quiere el reproductor
y el prompt; los datos técnicos ya los cuenta el texto del post.

ADR 0003 exige un ADR por cada bloque custom adicional; este documento cumple esa condición.

## Opciones consideradas

- **`<audio controls>` nativo** vía `upload` de Lexical — cero código, pero cada navegador lo
  pinta distinto, no sigue los tokens del cuaderno y no puede mostrar prompt ni imagen de
  referencia. Se mantiene solo como caso suelto (ver abajo), con el mismo componente.
- **Ampliar `videoCompare`** para aceptar audio — mezcla dos reproductores con controles y
  layouts distintos en un solo bloque; el escenario 16:9 no tiene sentido para audio.
- **Bloque dedicado `audioPlayer`**, mismo patrón que `videoCompare` (ADR 0041): definición →
  registro → converter → componente cliente → estilos.

## Decisión

Cuarto bloque custom: **`audioPlayer`**, una pista por bloque. `Media` pasa a aceptar
`audio/mpeg`, `audio/mp4` y `audio/wav` (no cambia el esquema SQL, no hay migración).

```
slug: 'audioPlayer'
fields:
  - status          select   ready | pending (default ready)
  - label           text     requerido — «Prueba 1 – MiniMax Music 2.6»; tras «–» = nombre corto
  - provider        text     opcional — «MiniMax vía fal»
  - audio           upload   media (solo audio/*), requerido si status = ready
  - prompt          textarea opcional — plegable, con botón «Copiar»
  - referenceImage  upload   media (solo image/*), opcional — miniatura + imagen junto al prompt
  - peaks           json     opcional, solo lectura — forma de onda precalculada (~200 valores 0–1)
```

Qué se conserva del diseño: fila compacta (play, nombre/proveedor, onda espejo con progreso en
degradado, tiempo), estados (listo, cargando, sonando, pausa, terminado, error, pendiente),
**modo foco** con espectro y ±5 s, teclado y Media Session.

Qué se quita: vista expandida, ficha técnica, letra, espectro en la fila, loop, volumen, descarga.
Visualización: solo «espejo» (la recomendada del diseño).

Reglas:

- **Una pista a la vez**: un listener de `play` en captura pausa los demás `audio[data-ap]`.
- **`preload="metadata"`**: el diseño pedía `none`, pero así la fila no puede mostrar la
  duración hasta pulsar play. Con `metadata` el navegador pide solo la cabecera del MP3
  (unos KB por rango), no el archivo.
- **Peaks**: se precalculan al preparar el post (ffmpeg → PCM → energía RMS por tramo) y se
  guardan en el bloque. Si faltan, la fila muestra una onda neutra y, tras el primer play, el
  navegador decodifica el archivo (ya en caché) con `decodeAudioData`. RMS y no pico: en una
  pista masterizada casi todos los tramos tocan el máximo y la onda sale plana.
- **MP3 como formato de publicación**: Opus/OGG (lo que entrega WhatsApp) no es fiable en Safari.
- **Modo foco** = `<dialog>` + `showModal()`, igual que el lightbox de video: Esc, foco atrapado
  y fondo inerte nativos. Controla el mismo `<audio>` de la fila (no hay segunda descarga).
- **Reduced motion**: sin espectro ni animaciones.
- Un audio insertado como `upload` suelto usa el mismo componente, sin prompt.

## Consecuencias

- (+) Mismo lenguaje visual (zine) que el resto de bloques; tokens `--audio-*` en `globals.css`.
- (+) El estado `pending` permite publicar una prueba antes de tener el audio.
- (−) `peaks` no se rellena desde el admin: un audio subido a mano empieza con onda neutra
  hasta el primer play. Si se vuelve molesto, un hook en `Media` podría calcularlos (requiere
  decodificar audio en el servidor).
- (−) La lista de bloques custom crece a cuatro; `AGENTS.md` se actualiza.
