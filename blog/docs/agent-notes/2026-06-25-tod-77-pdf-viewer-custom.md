# TOD-77 — Visor PDF custom con react-pdf

## Qué se hizo

Sustituido el embed nativo `<object>` de `/sobre-mi` por un componente `<PdfViewer>` reusable basado en `react-pdf` 10 (PDF.js 5).

## Decisiones técnicas

**Worker en `public/`**: `pdfjs-dist` llega como dep transitiva de `react-pdf`. La forma más fiable de servir el worker en Next.js standalone es copiarlo a `public/pdf.worker.min.mjs` y apuntar `workerSrc` a esa ruta estática. Sin copia, el build de producción no garantiza que el worker quede accesible.

**`canvas: false` en webpack**: react-pdf intenta importar `canvas` (Node.js) en el lado servidor. El alias previene el error de SSR; el render real ocurre siempre en el worker del navegador.

**`public/` ignorado por ESLint**: el worker minificado viola ~300 reglas. Ignorar toda la carpeta `public/` es lo correcto; son assets estáticos, no código fuente del proyecto.

**Zoom via prop `width`**: en lugar de `scale()` CSS (que descuadra el layout), se pasa `width = pageWidth * zoom` directamente a `<Page>`. Un `ResizeObserver` en el contenedor scroll actualiza `pageWidth` en tiempo real, por lo que el visor se adapta al ancho disponible en cualquier viewport.

**Server/Client split**: `page.tsx` sigue siendo Server Component puro. `PdfViewer` es Client Component (`'use client'`). El estado de paginación y zoom vive únicamente en el cliente.

## Alcance entregado

- Toolbar: página actual / total, anterior / siguiente, zoom in/out/reset, abrir en pestaña, descargar.
- Estados: loading (spinner), error (fallback con botones de apertura/descarga), render correcto.
- Tokens: todo el diseño usa variables CSS del proyecto; cero hardcoded.
- Icons nuevos añadidos a `Ic.tsx`: `minus`, `plus`, `externalLink`.
- `pnpm lint` pasa sin warnings.
