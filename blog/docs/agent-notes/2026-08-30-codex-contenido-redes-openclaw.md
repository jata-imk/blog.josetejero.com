# 2026-08-30 — Codex: comparativa de redes y tutorial de Upload-Post

## Qué se hizo

- Se separó el borrador que mezclaba una comparativa de proveedores con dos tutoriales.
- El post 29 quedó enfocado en elegir entre Upload-Post, PostFast, Post-Bridge, Postiz y Mixpost.
- Se creó un borrador independiente con la instalación de Upload-Post que José probó en Docker.
- Se añadió una adaptación descargable de `SKILL.md` en
  `public/downloads/upload-post/SKILL.md`.
- El tutorial se colocó como sub-artículo de `OpenClaw: Contenido y Multimedia` y se desplazó el
  orden de los tres borradores posteriores.

## Por qué

La comparativa y el tutorial respondían preguntas diferentes. La primera ayuda a decidir qué
servicio conviene; el segundo resuelve los detalles concretos de una integración. Separarlos evita
un artículo largo con dos promesas y permite enlazar el aprendizaje real sin esconderlo entre
tablas de precios.

## Verificación editorial y técnica

Los datos se contrastaron el 30 de agosto de 2026 con páginas oficiales mediante Playwright. La
revisión corrigió varios datos que habían cambiado o provenían de la conversación exploratoria:

- Upload-Post Free: 10 publicaciones, 2 Profiles y 9 redes; TikTok no está incluido.
- PostFast: desde €10/mes con facturación anual.
- Post-Bridge: desde $29/mes y conexión MCP incluida; la API aparece como add-on.
- Mixpost: Lite gratis y Pro a $299; Pro incluye API y MCP.
- El endpoint vigente para video en Upload-Post es `/upload`, no `/upload_videos`.
- El README de la skill upstream declara licencia MIT.
- `requires.env` puede satisfacerse desde el proceso o desde configuración de OpenClaw; el texto
  documenta Compose como la ruta probada sin declarar inválida la alternativa `skills.entries`.

## Recursos visuales restaurados

- El post 29 conserva como portada el recurso `conectar-redes-sociales-a-openclaw-publica-en-instagram-y-facebook-desde-whatsapp.png`.
- `pipeline.png`, `tres-caminos.png` y `costo-24-meses.png` se reinsertaron en la comparativa.
- `flujo-imagen.png` se colocó en el paso práctico del tutorial, después de explicar el acceso del contenedor a las imágenes.
- El placeholder de API Keys del tutorial se sustituyó por `dashboard-upload-post-api-key.png`.
- Las capturas de búsqueda y tarjeta se combinaron en `instalar-skill-upload-post-openclaw.png` con una composición horizontal.
- `skill-upload-post-personalizada-openclaw.png` documenta el resultado después de reemplazar la skill.
- Los tres recursos nuevos incluyen texto alternativo y caption en Payload.
- El `SKILL.md` descargable declara ambas variables en `requires.env` y `envVars`; `UPLOAD_POST_API_KEY` se mantiene como `primaryEnv`.

Los dos documentos permanecen en estado borrador. No se asignó fecha de publicación ni se
publicaron cambios automáticamente.
