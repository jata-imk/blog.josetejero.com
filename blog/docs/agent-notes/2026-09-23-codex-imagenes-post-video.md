# Imágenes cargadas en el borrador de video

Fecha local: 2026-09-23.

## Qué se hizo

- Se comprimieron los cuatro gráficos definitivos de `output/entrada-video/` a WebP sin pérdida. Una comparación de los búferes de píxeles confirmó que cada WebP conserva exactamente la imagen del PNG. Los archivos listos para subir quedaron en `output/entrada-video/para-subir/`.
- Se cargaron al CMS con alt y caption: flujo de generación (Media 69), selección de modelo (70), collage de proveedores (71) y tres proveedores (72). Payload los almacenó como `image/webp` y los sirve correctamente con HTTP GET.
- Se sustituyeron los marcadores del flujo y del collage, se añadió el diagrama de selección tras su explicación y la pieza de tres proveedores antes de la primera prueba.
- José indicó conservar el ejemplo de la ciudad de tarjetas. Se reemplazó su marcador con el recurso ya publicado en el post de imágenes (Media 67), que mantiene sus metadatos. El observatorio generado quedó local y no se subió.
- El post 30 permanece como `draft`. Los marcadores de los resultados de video y de opinión personal quedan pendientes de las pruebas de José.

## Por qué y cómo se comprobó

Los gráficos se insertaron como nodos `upload` de Lexical, siguiendo la misma estructura que las imágenes ya presentes en otros posts. El texto alternativo y el pie viven en cada documento de la colección Media, y el render del blog toma esos campos para `<img alt>` y `<figcaption>`.

Antes del cambio se guardó `output/entrada-video/post-30-before-media.json`; después, `post-30-after-media.json`. La comparación de ambos documentos confirmó cinco imágenes en el orden esperado, ausencia de cambios en el resto del cuerpo y metadatos idénticos salvo `updatedAt`. La recarga del editor mostró los cinco nodos Media. Los cuatro nuevos archivos respondieron con 200 e `image/webp` por GET; el endpoint de archivos no responde a HEAD, así que la verificación de entrega se hizo con GET.

No se creó ADR porque no se cambió la arquitectura ni el esquema. Se respetaron los cambios previos del worktree.
