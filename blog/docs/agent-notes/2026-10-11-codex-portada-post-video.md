# Portada y revisión de imágenes del post 30

**Actualización:** José descartó la propuesta de CSS por las franjas vacías y pidió modificar la composición de la imagen, además de añadir los logos de los proveedores a color. La regla CSS descrita en el historial siguiente fue retirada. La portada final es Media 110; el post continúa en borrador. El apartado final documenta esta solución.

Se abrió el borrador «Generar video con IA desde OpenClaw: texto, imagen y video» con el MCP de Playwright y la sesión que José inició. La captura enviada corresponde al post 39, pero el trabajo sobre contenido se limitó al post 30 solicitado.

## Portada guardada en el CMS

La portada original, Media 58, mide 1600 × 900 y pesa 1,133,420 bytes. Se conservó esa resolución y composición al convertir el PNG a WebP con Sharp, calidad 95. El archivo local pesa 116,152 bytes. Payload vuelve a codificar el archivo al cargarlo: el nuevo Media 108 pesa 49,852 bytes (95.6 % menos que el PNG) y su versión de tarjeta pesa 26,874 bytes. Se conservan el alt y el caption. El archivo original sigue disponible.

Se actualizó únicamente `coverImage` del post. Una lectura inmediatamente anterior comprobó `updatedAt` y la referencia original para detectar ediciones concurrentes. La comparación posterior de los documentos con depth 0 confirmó que solo cambiaron `coverImage` y `updatedAt`. El estado sigue siendo `draft`.

## Causa del recorte y propuesta inicial de CSS (retirada)

La destacada de `/blog` usa una columna para la imagen y otra para el texto. Su altura depende del título y el extracto, por lo que el espacio de la imagen no siempre es 16:9. `object-fit: cover` amplía la portada hasta llenar ese espacio y recorta sus laterales: por eso faltaban las primeras letras en la captura de José. La portada original y la variante `card` del CMS tienen proporción 16:9; en este caso el recorte ocurre en el frontend.

Se añadió una regla específica `.ab-feat .thumb-img` en `app/globals.css`, con `object-fit: contain` y fondo `var(--bg)`. El navegador muestra la composición completa, centrada; el espacio sobrante usa el mismo token que la tarjeta. La regla respeta los tokens y se limita a la tarjeta destacada. No requiere cambios de arquitectura ni un ADR.

El CSS está preparado en el workspace; **no está desplegado**. Las capturas se obtuvieron aplicando esa regla temporalmente con Playwright al sitio existente. El post 30 se representó temporalmente en el DOM de la destacada para revisar su portada: esto no publicó el post ni modificó el listado del servidor.

## Revisión de todas las imágenes

Se descargaron y decodificaron las 14 imágenes referenciadas, incluidos los seis posters de video. Todas respondieron con HTTP 200. Después se comprobaron también las URLs de `content` que utiliza el render: preservan la proporción original, con diferencias de redondeo de un píxel, sin recortes. Los posters verticales se sirven desde el original cuando no existe variante de contenido.

| Recursos | Cantidad | Resolución original | Peso original por archivo |
|---|---:|---|---:|
| Portada optimizada | 1 | 1600 × 900 | 50 KB |
| Diagramas de flujo | 2 | 1600 × 900; 1120 × 1100 | 63–70 KB |
| Collage y tres proveedores | 2 | 1600 × 900 | 47–57 KB |
| Fichas de evaluación | 2 | 1600 × 1426; 1600 × 1396 | 119–122 KB |
| Imagen de entrada del aguacate | 1 | 941 × 1672 | 220 KB |
| Posters de video | 6 | 720 × 1280; 480 × 848; 400 × 736 | 44–126 KB |

Los otros 13 archivos ya son WebP y no necesitan más compresión para publicar. Los posters de xAI tienen menor resolución: conservarla evita ampliar sin añadir detalle. Las fichas y diagramas contienen texto pequeño, por lo que conviene conservar los originales para el visor de figuras.

## Verificación y artefactos

- Comparación de campos antes y después de guardar: solo portada y fecha automática.
- GET y decodificación de portada, thumbnail, card y content: HTTP 200 y dimensiones esperadas.
- Inspección visual de la composición WebP y una hoja de contacto con las 14 imágenes.
- Revisión de la destacada en escritorio, móvil de 390 px y tema oscuro. En móvil no hubo desbordamiento horizontal.
- `git diff --check` pasó tras el cambio de CSS. No se ejecutó un build ni se conectó el desarrollo a producción.

Los respaldos y las capturas están en `output/revision-portada-post-30/`, desde la raíz del repositorio: `antes.json`, `cambio-verificado.json`, `auditoria.json`, `entrega-inline-verificada.json`, `revision-todas-las-imagenes.png` y `destacada-video-{desktop,mobile,dark}.png`. `preparar.mjs` descarga los originales y prepara la comparación; su ejecución no sube archivos ni cambia el CMS.

## Solución final: composición centrada dentro de la imagen

Se utilizó la herramienta integrada imagegen para generar una portada similar a la original, con el título arriba, la ilustración debajo y los logos de Google/Veo, Runway y xAI/Grok agrupados en el centro. El fondo pastel se extiende a los bordes; los laterales contienen decoración prescindible. Se mantuvo la portada 16:9 y el frontend conserva `object-fit: cover`.

La primera versión centrada (Media 109) funciona en escritorio y móvil, pero su ilustración todavía perdía extremos en una pantalla de 769 px, justo antes del breakpoint de 768 px. En ese ancho solo se muestra aproximadamente el 42 % del ancho de la portada original. Se pidió a imagegen reducir únicamente el grupo de la tarjeta de imagen, la tira de película y el botón de reproducción. La segunda versión mantiene el texto y los logos, con la ilustración completa dentro de aproximadamente el tercio central.

Referencias: portada original Media 58 y gráfico de proveedores Media 72. Se descargaron también el [Google G multicolor](https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png) y el [icono oficial de Runway](https://runwayml.com/images/logos/runway-app-icon.png), obtenido del HTML de runwayml.com. Se consultaron los [recursos oficiales de Runway](https://docs.dev.runwayml.com/usage/attribution/) y las [guías de marca de xAI](https://x.ai/legal/brand-guidelines). La descarga del ZIP de xAI devolvió HTTP 403, por lo que para la forma de Grok se reutilizó la referencia visual del gráfico de proveedores existente. Google conserva sus colores; Runway y Grok mantienen marcas monocromas sobre fondos de color. Los logos de la portada son reproducciones visuales de imagegen a partir de esas referencias, no una inserción exacta de píxeles de los originales.

El PNG final generado se copió al workspace; para publicación se redimensionó a 1600 × 900 y se codificó a WebP con Sharp (sin retoques de composición). El WebP local pesa 138,230 bytes. Payload lo recodificó al subirlo como Media 110: 57,324 bytes, con tarjeta de 29,840 bytes. Se añadieron alt y caption que describen la composición nueva.

Antes de guardar se comprobaron portada y fecha de modificación. Se sustituyó únicamente `coverImage` de 108 a 110. La comparación de documentos confirmó que solo cambiaron ese campo y `updatedAt`; el cuerpo, título, relaciones y estado `draft` permanecen idénticos. El editor se recargó para recoger la portada guardada.

Verificación final: vistas previas de la tarjeta existente, sin CSS añadido, a 1440, 1024, 900, 769 y 390 px. El título, la ilustración y los tres logos aparecen completos incluso a 769 px. La imagen llena el contenedor. GET y decodificación de original, thumbnail, card y content: todos HTTP 200 y dimensiones correctas. `git diff` de `app/globals.css` queda vacío tras retirar la regla inicial; `git diff --check` pasa. No hubo despliegue de código.

Artefactos finales, relativos a la raíz del repositorio: `output/portada-video-centrada/portada-video-openclaw-centrada-v4.{png,webp}`, `prompt.txt`, `prompt-ajuste.txt`, `post-30-antes.json`, `post-30-cambio-verificado.json`, `archivos-verificados.json` y `v4-tarjeta-{1440,1024,900,769,390}.png`. La generación utilizó el modo integrado, no el CLI. La versión v3 y Media 109 se conservan como alternativas; el post referencia solo Media 110.
