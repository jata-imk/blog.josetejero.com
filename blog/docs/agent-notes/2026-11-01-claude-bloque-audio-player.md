# Bloque `audioPlayer`: reproductor de audio para los laboratorios de música

Fecha local: 2026-11-01. Decisión de arquitectura: [ADR 0042](../adr/0042-bloque-audio-player.md).

## Qué se hizo

- `Media` acepta `audio/mpeg`, `audio/mp4` y `audio/wav` además de imagen y video.
- Nuevo bloque de Lexical `audioPlayer` (`lib/lexical/audioPlayerBlock.ts`), registrado en el
  editor junto a `callout`, `chmodCalculator` y `videoCompare`.
- Converter en `lib/lexical/converters.tsx` (`toAudioTrack`): traduce los documentos `Media`
  poblados a una pista plana (`src`, `prompt`, imagen de referencia, `peaks`…). Un audio subido
  como `upload` suelto usa el mismo componente, sin prompt. Si el audio no llegó poblado, la pista
  sale como pendiente en vez de romper el post.
- Componentes en `components/blocks/`:
  - `AudioPlayer.tsx` — la fila (play, nombre, onda, tiempo, botón de modo foco) y el prompt
    plegable con «Copiar».
  - `AudioFocus.tsx` — el modo foco: `<dialog>` a pantalla completa con espectro, onda grande y ±5 s.
  - `AudioParts.tsx` — icono, botón de play y onda, que comparten la fila y el modo foco.
  - `audioPlayerShared.ts` — utilidades sin React: formato de tiempo, remuestreo de la onda,
    cálculo de picos, Web Audio y la regla de «una pista a la vez».
- Estilos `.ab-ap-*` al final de `app/globals.css` y tokens `--audio-*` junto a los `--video-*`.

## El diseño, recortado

El diseño de Claude Design («Reproductor de audio») traía vista expandida con ficha técnica
(modelo, duración pedida/obtenida, tiempo de generación, costo, formato), letra, loop, volumen y
descarga. José pidió dejar solo el reproductor y el prompt, más el modo foco. Los datos técnicos
viven en el texto del post, donde se pueden contar con contexto.

## Conceptos que conviene entender

### Un componente cliente con un `<audio>` dentro

Igual que el video, el cuerpo del post se pinta en el servidor y solo el reproductor se hidrata
en el navegador (`'use client'`). El estado (sonando, pausa, tiempo) vive en React, pero la fuente
de verdad es el elemento `<audio>`: React escucha sus eventos (`playing`, `pause`, `ended`,
`error`) y, mientras suena, lee `currentTime` en cada frame con `requestAnimationFrame` para que
la barra de progreso avance suave.

### `preload="metadata"` y un detalle de hidratación

Con `preload="metadata"` el navegador pide solo la cabecera del MP3 (unos KB) para saber la
duración; el archivo completo se descarga al pulsar play. El diseño proponía `preload="none"`,
pero entonces la fila mostraría «—:—» hasta reproducir.

Detalle que apareció en la prueba: el HTML llega del servidor y el navegador empieza a leer los
metadatos **antes** de que React hidrate y conecte `onLoadedMetadata`. El evento se pierde y la
duración nunca aparece. Por eso un `useEffect` al montar revisa si el `<audio>` ya tiene
`readyState >= 1` y toma la duración de ahí.

### La forma de onda: picos precalculados con RMS

Dibujar la onda exige conocer el volumen a lo largo de la pista, y eso implica decodificar el
audio completo. Para no hacerlo en cada visita, los valores se calculan una vez al preparar el
post (ffmpeg convierte el MP3 a muestras crudas y un script toma 200 tramos) y se guardan en el
campo `peaks` del bloque.

Dos ajustes salieron de probarlo con las pistas reales:

- **RMS en vez de pico.** Una canción masterizada está comprimida: casi todos los tramos tocan
  el máximo. Con el pico, la onda era un rectángulo. La energía RMS (raíz del promedio de los
  cuadrados) sí refleja las partes suaves y las fuertes.
- **Normalizar contra el percentil 98.** El tarareo tenía un clic del micrófono al principio;
  normalizando contra el máximo, el resto de la onda quedaba casi plana.

Si un audio se sube a mano sin `peaks`, la fila muestra una onda neutra (determinista, para que
el servidor y el cliente pinten lo mismo) y, tras el primer play, el navegador decodifica el
archivo ya descargado con `decodeAudioData` y la sustituye por la real.

### Errores de hidratación por decimales

React compara el HTML del servidor con lo que pinta el cliente. Las alturas de las barras se
escribían como `57.07681433449259%`; el servidor las serializaba redondeadas y React avisaba de
que no coincidían. Se redondean a dos decimales en los dos lados.

### Web Audio: de dónde sale el espectro

El modo foco dibuja un espectro de frecuencias. Para eso el `<audio>` se conecta, en el primer
play, a un `AnalyserNode` de la Web Audio API (`MediaElementSource → Analyser → altavoces`). En
cada frame, `getByteFrequencyData` devuelve 128 valores (uno por banda de frecuencia) que se
agrupan en 72 barras con escala casi logarítmica (los graves ocupan menos bandas que los
agudos). Un `MediaElementSource` solo se puede crear una vez por elemento, por eso se guarda en
un `WeakMap`. Si Web Audio falla, el audio suena igual, sin espectro.

### Una pista a la vez

Un solo listener de `play` en fase de captura sobre `document` pausa cualquier otro
`audio[data-ap]` que esté sonando. No hace falta que los reproductores se conozcan entre sí.

### Por qué MP3

Los audios del laboratorio llegaron por WhatsApp en Opus (dentro de `.ogg` o `.m4a`). Safari no
reproduce Opus de forma fiable, así que se convierten a MP3, que suena en todos los navegadores.

## Cómo se comprobó

En local (`pnpm dev` contra la BD de desarrollo) se creó con la Local API un post de prueba con
cuatro casos: listo con prompt y `peaks`, listo con imagen de referencia y sin `peaks`, pendiente,
y un MP3 insertado como `upload` suelto. Con Playwright:

- La duración aparece antes de reproducir (1:55, 2:10, 0:33).
- Play en el segundo reproductor pausa el primero.
- Sin `peaks`, la onda real sustituye a la neutra tras el primer play.
- Clic al 50 % de la onda lleva a 1:05 de 2:10; Fin → terminado; Inicio → listo; K pausa.
- Modo foco: abre con el foco en «Salir», el espectro se dibuja mientras suena, → avanza 5 s,
  Esc cierra y el foco vuelve al botón de modo foco.
- 375 px en tema oscuro: sin scroll horizontal; la onda y el tiempo bajan a una segunda línea
  para que el nombre no se corte; botones de 44 px.
- Consola sin errores. `tsc --noEmit` y `eslint` limpios. `payload generate:types` sin cambios.

Durante la prueba, Turbopack siguió sirviendo el CSS viejo tras editar `globals.css`; se resolvió
matando el servidor, borrando `.next` y relanzando.
