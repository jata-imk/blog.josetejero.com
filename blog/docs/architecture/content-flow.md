# Flujo de contenido

Cómo entra el contenido al blog. Dos vías:

## 1. Creación directa en el admin (vía principal a futuro)
Autor entra a `/admin`, crea un Post, escribe el cuerpo en el editor Lexical (con `Callout`, código,
imágenes), asigna serie/categorías/tags, y publica. Sin pasos manuales fuera del CMS.

## 2. Importación del blog anterior (migración única)
El blog viejo (`blog.aleliz.xyz`) está en **Astro + Markdown**, con posts y series organizados en
carpetas (algunos con `index.md` + sub-archivos) e imágenes en `public/`.

Objetivo: convertir ese Markdown → árbol **Lexical** e insertarlo como Posts/Series en Payload,
subiendo las imágenes a la colección `Media`.

- Es la **pieza más peluda** del proyecto. El Architect la planea antes de implementar.
- Procedimiento operativo en `../runbooks/importer.md`.
- Mapeo a cuidar: frontmatter → campos del Post; carpetas de serie → `Series` + `seriesOrder`;
  imágenes referenciadas → uploads a `Media`; bloques de código MD → nodo de código Lexical;
  cualquier "aviso" → bloque `Callout`.

## Invariante
En ambas vías, el resultado almacenado es **solo datos** (árbol Lexical + relaciones). El resaltado,
el tema y el botón copiar se aplican en **render**, nunca se guardan.
