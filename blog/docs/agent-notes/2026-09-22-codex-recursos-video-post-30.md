# Recursos y comandos Compose para el borrador de video

Fecha local: 2026-09-22.

## Qué se hizo

- Se leyó el borrador 30 de Payload con la sesión de Playwright iniciada por José y se guardaron copias de antes y después en `output/entrada-video/` desde la raíz del repositorio.
- Se sustituyeron los tres bloques `docker exec -it openclaw-gateway …` por `docker compose exec openclaw …`. Docker Compose recibe el **nombre del servicio** (`openclaw`), no el nombre del contenedor (`openclaw-gateway`), y asigna TTY por defecto.
- Se añadió un único bloque Callout `note` antes del primer comando para indicar que los comandos Compose se ejecutan desde la carpeta que contiene `docker-compose.yml`.
- Se produjeron localmente una infografía del flujo, dos piezas de proveedores y un fotograma inicial para un experimento de imagen a video. Ningún recurso se subió a Media ni se insertó en el post.
- Se documentaron ideas de pruebas más impactantes, textos alternativos y pies en `output/entrada-video/README.md` desde la raíz del repositorio.

## Por qué y cómo se comprobó

El cuerpo de Payload es un árbol Lexical: cada snippet es un nodo `block` con `fields.code`; el Callout también es un `block`, con `fields.content` como árbol Lexical anidado. Se actualizó el cuerpo mediante la API autenticada del mismo navegador, tras comparar `updatedAt` con la copia previa. La petición cambió solo `body`, no metadatos ni estado.

La lectura posterior confirmó que no quedaban comandos `docker exec` en el post, que el Callout aparece en el editor y que el estado sigue en `draft`. Se retiraron de la comparación los tres cambios de código, el Callout y `updatedAt`; el documento restante resultó idéntico al respaldo previo. Las tres piezas vectoriales se renderizaron a PNG con Sharp y se revisaron también a 960 × 540. La imagen generada mide 1672 × 941.

No se creó ADR: no hay cambio de arquitectura ni de esquema. Los cambios previos presentes en el worktree se dejaron intactos.

## Revisión visual solicitada después

José rechazó las primeras piezas de proveedores por parecer tarjetas y por usar símbolos genéricos. Se rehizo el catálogo como un collage de 14 marcas con escalas y posiciones irregulares. Los gráficos de marca se tomaron de los iconos usados por OpenClaw y de las fuentes identificadas en `output/entrada-video/README.md`; se conservaron los originales y su atribución en `output/entrada-video/logos/`. La gráfica de tres proveedores usa ahora los símbolos reales de Google, Runway y Grok. Un pequeño script reproducible, `output/entrada-video/render-logos.cjs`, los incorpora a SVG autónomos y produce PNG de publicación y vistas de revisión.

La infografía inicial se dividió en dos: el recorrido de la tarea asíncrona y un árbol de selección de modelo adaptado del post de generación de imágenes. Este último se contrastó con el orden de resolución documentado para `video_generate`: parámetro explícito, principal, fallbacks y detección automática solo sin lista configurada. Se corrigió también una referencia residual a proveedores de imágenes. El fotograma del observatorio y las propuestas de ejemplos que gustaron se conservaron. Ningún nuevo recurso se subió al CMS.

## Ajuste final de legibilidad

En el collage se eliminaron el recuento de la esquina y el texto de pie. Se sustituyeron varios símbolos monocromos por versiones multicolor de las mismas marcas; OpenRouter usa el glifo violeta que distribuye oficialmente. El símbolo de Grok se muestra oscuro directamente sobre el fondo, sin mancha. En el diagrama del flujo, las puntas de flecha se redujeron, el retorno adoptó el mismo rojo de su línea y los cinco iconos se ampliaron. Los SVG se volvieron a renderizar a PNG y se inspeccionaron a 960 píxeles de ancho.
