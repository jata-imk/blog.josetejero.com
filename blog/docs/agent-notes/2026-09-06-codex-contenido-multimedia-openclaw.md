# Revisión de la serie multimedia de OpenClaw

Fecha: 2026-09-06

## Resultado

- Se creó el borrador 39 sobre generación de imágenes, en la posición 3 de la serie.
- Se reescribió el borrador 30 sobre generación de video y se movió a la posición 4.
- Se reescribió el borrador 31 como pipeline supervisado de generación y publicación, en la posición 5.
- El borrador 32 de TTS se movió a la posición 6 sin modificar su contenido.
- Las tres entradas trabajadas permanecen en estado `draft`.

## Criterios editoriales y técnicos

- La experiencia de que Gemini ya generaba imágenes sin configuración adicional se explica dentro del cuerpo, no en el título ni en el excerpt. La causa documentada es que la credencial del proveedor ya estaba disponible y OpenClaw pudo habilitar `image_generate`; se distingue comprensión multimodal de generación mediante herramientas.
- Imágenes: Google `google/gemini-3.1-flash-image` como primera opción y OpenAI `openai/gpt-image-2` como respaldo.
- Video: Google `google/veo-3.1-fast-generate-preview`, Runway `runway/gen4.5` y xAI `xai/grok-imagine-video` como cadena propuesta.
- Se sustituyó la ruta antigua `videoGenerationModel` por `agents.defaults.mediaModels.video`.
- Sora 2 se excluyó de la configuración recomendada: OpenAI lo marca como legado y anunció el cierre de su API para el 24 de septiembre de 2026.
- El pipeline exige vista previa y confirmación explícita antes de publicar mediante Upload-Post.

## Segunda revisión del post de imágenes

- Se documentó el contexto histórico: Gemini era el proveedor conversacional principal y DeepSeek el fallback; OpenAI y Anthropic se agregaron después. No se atribuyó retrospectivamente la primera generación a una versión concreta de Gemini.
- Se explicó la relación y la diferencia entre multimodalidad, comprensión de adjuntos y la herramienta `image_generate`.
- Se aclaró que `/tool image_generate action=list` se escribe en el Dashboard web o en un chat compatible como Telegram, no dentro del contenedor.
- Los comandos Docker ahora usan el nombre real del contenedor mostrado por el usuario: `openclaw`.
- Se tradujo *Gateway* como el servicio principal de OpenClaw dentro del contenedor.
- Se añadió el inventario observado en Telegram, una aclaración sobre transparencia de OpenAI, MiniMax como tercera prueba ya disponible y fal/Krea 2 como expansión opcional.
- Se añadieron tres ejemplos visuales pendientes: texto a imagen, comparación de proveedores y edición con referencia.
- La captura de Telegram no fue subida al CMS. Solo se produjo una previsualización horizontal local con fondo extendido.
- La explicación inicial se reestructuró después de la revisión editorial: se eliminó la tabla de capas, el orden de selección de modelos se movió al comienzo y se separaron explícitamente los fallbacks de conversación de `agents.defaults.mediaModels.image`.
- Se reservó un diagrama futuro para el recorrido Telegram → OpenClaw → agente → `image_generate` → proveedor → Telegram; no se creó ni subió hasta contar con referencias del estilo visual del blog.
- La versión horizontal aprobada de la captura de Telegram se subió como Media 55 y se insertó en el post 39; conserva una relación cercana a 16:9 y cuenta con texto alternativo y pie.
- Se analizaron cinco portadas de referencia y se documentó la dirección resultante en `blog/docs/design/guia-visual-contenido-ia.md`: simplicidad editorial, formas orgánicas pastel, tipografía fuerte, degradado limitado a palabras clave y composición técnica despejada.
- Se creó una primera previsualización local, todavía no cargada al CMS, del diagrama de generación de imágenes en `blog/media/diagrama-flujo-generacion-imagenes-openclaw-v1.svg`.
- Se preparó una segunda versión local del diagrama en `blog/media/diagrama-flujo-generacion-imagenes-openclaw-v2.svg`: la entrada ahora es un canal genérico con ejemplos, usa recursos oficiales de Telegram y OpenClaw, representa al agente como orquestador de varias herramientas, reduce las flechas y mantiene las cinco tarjetas con el mismo ancho. Sigue pendiente de aprobación y no se ha subido al CMS.
- El cuerpo local aclara que un agente puede coordinar varias herramientas en una tarea; las llamadas independientes pueden ejecutarse en paralelo, pero las dependencias y los fallbacks se procesan en orden.
- Se corrigió el degradado de las flechas del diagrama v2 usando coordenadas absolutas (`gradientUnits="userSpaceOnUse"`), evitando que el trazo desaparezca en segmentos horizontales de altura cero.
- Se generaron tres nuevas propuestas de portada v2 para imágenes, video y pipeline multimedia. Las bases ilustradas usan composición editorial clara y contenido específico; los títulos, el logo oficial de OpenClaw, los proveedores y la firma del blog se añadieron de forma determinista en SVG. Permanecen como previsualizaciones locales y no sustituyen todavía los medios del CMS.
- El diagrama corregido se subió como Media 56 y sustituyó el placeholder dentro del borrador 39. Se verificó en 1600 × 900 y el post continúa en estado `draft`.
- Tras la aprobación del usuario, las portadas v2 se subieron y asignaron así: Media 57 al post 39 (imágenes), Media 58 al post 30 (video) y Media 59 al post 31 (pipeline multimedia). Las portadas anteriores 52, 53 y 54 se conservaron en la biblioteca para que el cambio sea reversible. Los tres posts permanecen como `draft`.

## TTS y ampliación de la serie

- Se reescribió por completo el borrador 32 de TTS con la documentación vigente. El nuevo título es “Texto a voz en OpenClaw: configurar TTS con Microsoft, Google y OpenAI” y ocupa la posición 5.
- Se eliminó la configuración antigua bajo `messages`, se adoptó la sección de primer nivel `tts` y se reemplazó el identificador legado `edge` por `microsoft`.
- La guía distingue entrada de audio, TTS y Talk; documenta `/tts status`, `/tts audio`, `/tts latest`, los modos de `tts.auto`, las preferencias por conversación y la entrega según el canal.
- La configuración principal usa Microsoft sin API key y voz `es-MX-DaliaNeural`. Google y OpenAI quedan como comparación pendiente, sin declarar un ganador antes de escuchar pruebas equivalentes.
- Los pasos de validación contemplan el despliegue real en Docker: `config validate`, `doctor --lint`, migración consciente con `doctor --fix`, comprobación de `ffmpeg` y recreación del servicio cuando cambia `.env`.
- Se creó el borrador 40, “Generar música y audio con OpenClaw: Lyria, MiniMax y fal”, en la posición 6. Contiene una ruta de prueba para `music_generate`, Google Lyria como propuesta principal, MiniMax como respaldo y espacios explícitos para capturas, muestras, latencia, costo y conclusiones reales.
- El pipeline multimedia, borrador 31, se movió a la posición 7 para que música se pruebe antes de integrar todos los archivos.
- Se creó el borrador 41, “Hablar con OpenClaw en tiempo real: Talk, STT y respuestas por voz”, como bonus avanzado en la posición 8. Separa notas de voz de sesiones Talk, propone una prueba WebRTC con OpenAI y conserva como pendientes la compatibilidad real, la latencia, las interrupciones y el consumo.
- Los nuevos posts 40 y 41 son borradores editoriales documentados, no relatos de pruebas que todavía no se han realizado. Ambos señalan claramente qué resultados y capturas faltan completar.
- No se generaron ni subieron portadas para TTS, música o Talk. Todas las entradas nuevas o modificadas permanecen en estado `draft`.

## Higiene del worktree y pendiente de series

- `blog/media/` ya estaba ignorado por Git. Se conservaron allí los originales, variantes y previsualizaciones mientras termina la revisión de la serie; no forman parte de un commit ni se subirán por accidente.
- Se añadió `blog/.codex-content/` a `.gitignore`: estos Markdown son copias locales para importar al CMS, mientras que la fuente publicada reside en Payload.
- Se restauraron `blog/next-env.d.ts` y `blog/app/(payload)/admin/importMap.js`, modificados o marcados por las herramientas de desarrollo de Next/Payload sin representar un cambio funcional.
- La guía visual y esta nota sí se conservaron como documentación versionable del proyecto.
- Se confirmó un defecto independiente en `SeriesNav`: todos los artículos posteriores al actual se marcan como `soon`, aunque `getPostsInSeries` ya devuelve únicamente posts publicados. Esto muestra “Próximamente” y elimina el enlace de contenido disponible.
- Se registró en Notion la tarea “Corregir navegación de series: posts publicados aparecen como ‘Próximamente’”, como subtarea del roadmap del blog, con diagnóstico y criterios de aceptación.

## Recursos

- `blog/.codex-content/generar-imagenes-openclaw.md`
- `blog/.codex-content/generar-video-openclaw.md`
- `blog/.codex-content/pipeline-multimedia-openclaw.md`
- `blog/.codex-content/tts-openclaw.md`
- `blog/.codex-content/generar-musica-openclaw.md`
- `blog/.codex-content/talk-openclaw.md`
- `blog/media/portada-generar-imagenes-openclaw.png` (Media 52)
- `blog/media/portada-generar-video-openclaw.png` (Media 53)
- `blog/media/portada-pipeline-multimedia-openclaw.png` (Media 54)
- `blog/media/diagrama-pipeline-multimedia-openclaw.svg` (Media 51)

El diagrama está insertado dentro del cuerpo del post 31. Las portadas se generaron sin texto para mantener legibilidad en tamaños de tarjeta y reutilizar la identidad visual de la langosta robótica.

## Fuentes principales consultadas

- Documentación vigente de herramientas multimedia, generación de imágenes, generación de video y proveedor Google de OpenClaw.
- Tarifas oficiales de Gemini API y Runway API.
- Documentación oficial de xAI para generación de video.
- Catálogo y aviso de retirada de la API de Sora de OpenAI.
