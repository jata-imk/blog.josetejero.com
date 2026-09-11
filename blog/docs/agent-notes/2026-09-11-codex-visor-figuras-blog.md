# Visor de figuras del blog

- Fecha: 2026-09-11
- Agente: Codex
- Rama: `feat/visor-imagenes-blog`
- ADR: `docs/adr/0035-visor-de-figuras-enlazables.md`

## Qué se implementó

- Normalización server-first de portada y uploads Lexical en una lista
  serializable `ViewerFigure`. El walker conserva el orden editorial y entra en
  árboles anidados y documentos RichText de Callout.
- Enlaces SSR reales por aparición, basados en el UUID del nodo Lexical; la
  portada usa el identificador reservado `portada`.
- Visor cliente con `<dialog>` nativo, restauración de foco, bloqueo de scroll,
  `Esc`, historial, flechas, swipe, tira navegable, caption/alt visible, copia de
  URL y acceso al original.
- Pan/zoom/pinch mediante la única dependencia añadida,
  `@panzoom/panzoom@^4.6.2`, importada dinámicamente cuando una imagen cargó
  dentro del diálogo. El original se solicita al abrir y sustituye al preview
  después de `decode()`.
- Morph opcional con View Transitions; queda desactivado con
  `prefers-reduced-motion`, entrada directa, fuente fuera del viewport o
  navegador sin soporte.
- Render compartido para página editorial y rutas
  `/blog/[slug]/figura/[figureId]` y `/series/[slug]/figura/[figureId]`, con 404
  para IDs ajenos. Un `<noscript>` presenta la figura original y enlace de
  retorno sin depender de hidratación.
- Metadata por figura: URL OG propia, Twitter card, canonical al padre y
  `noindex, follow`. `/api/figure-og/...` genera PNG 1200×630 con
  `ImageResponse`; lee el asset desde `/app/media` con basename validado y cae a
  una tarjeta de marca si el archivo no está en disco.
- Tokens y estilos responsive del visor en `app/globals.css`. No se cambió el
  schema de Media, no hubo migración y CI/CD permanece igual.

## Por qué

El converter anterior solo pintaba el tamaño `content`; diagramas y capturas no
se podían inspeccionar ni compartir en contexto. La combinación elegida mantiene
el HTML y el LCP existentes, añade una URL estable por aparición y reserva el
trabajo de interacción a una isla progresiva. Deep zoom por tiles no se justifica
con los originales actuales y queda explícitamente fuera del alcance.

## Verificación realizada

- `pnpm lint`: correcto.
- `BUILD_WITHOUT_DB=1 pnpm build`: correcto, incluidas comprobación TypeScript y
  generación de rutas Next. Persisten únicamente warnings de tracing ya
  existentes en `next.config.mjs`/Payload.
- `docker build ... -t josetejero-blog:visor-test .`: correcto con instalación
  `--frozen-lockfile`, regeneración de tipos/importmap, build hermético y copia a
  la imagen standalone; replica el job `build-push` sin publicar la imagen.
- Build de producción servido en `127.0.0.1:3100` contra la BD local:
  - el post `conectar-api-notion-openclaw` devuelve 200 y deriva 5 figuras
    (portada + 4 SVG) con sus UUID reales;
  - deep-link válido devuelve 200; ID inválido, 404;
  - canonical apunta al post padre y robots publica `noindex, follow`;
  - OG/Twitter apuntan al endpoint propio; el PNG respondió 200,
    `image/png`, 1200×630;
  - Playwright abrió desde una figura inline, avanzó por teclado, actualizó URL,
    cerró con `Esc`, restauró el foco y limpió el bloqueo de scroll;
  - entrada directa abrió el diálogo y al cerrar reemplazó la URL por la página
    editorial; layout móvil comprobado a 390×844.

## Particularidad del entorno local

La BD local referencia los assets del volumen del servidor, pero este checkout
no contiene esos archivos en `blog/media`. Por eso el navegador local registró
404/500 de imágenes durante la prueba visual y el OG usó correctamente su
fallback de marca. No es un error del visor: en producción Docker monta
`payload_media:/app/media`. La geometría de Panzoom se inicializa solo después de
`load`, precisamente para que un recurso ausente o lento no cree un estado de
zoom inválido.
