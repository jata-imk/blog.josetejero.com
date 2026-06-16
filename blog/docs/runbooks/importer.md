# Runbook: importador Astro/MD → Lexical

> Borrador. El Architect planea, el Engineer implementa (Fase 3). Pieza más peluda del proyecto.

## Origen
Blog anterior en `C:\Users\jose.tejero\Documents\Proyectos\blog.aleliz.xyz`, Astro + Markdown:
- Posts sueltos en `src/content/blog/*.md`.
- Series como carpetas con `index.md` + sub-artículos.
- Imágenes en `public/` (jpg y svg), referenciadas desde el MD.

## Destino
Posts/Series en Payload con cuerpo **Lexical**; imágenes subidas a la colección `Media`.

## Mapeo
| Origen (MD) | Destino (Payload/Lexical) |
|---|---|
| frontmatter (`title`, `date`, ...) | campos del Post (`title`, `publishedAt`, `slug`, `excerpt`) |
| carpeta de serie + orden de archivos | `Series` + `seriesOrder` en cada Post |
| bloque ```` ``` ```` de código | nodo de código built-in de Lexical |
| imágenes `![](...)` | upload a `Media` + nodo imagen Lexical |
| avisos / notas | bloque `Callout` (variant adecuada) |
| headings, listas, links | nodos built-in de Lexical |

## Procedimiento (a completar)
1. Script de migración (idempotente; re-ejecutable sin duplicar).
2. Parsear MD → AST → árbol Lexical.
3. Subir imágenes y reescribir referencias a IDs de `Media`.
4. Crear Series y asignar `seriesOrder`.
5. Reporte: qué se importó, qué se saltó y por qué.

## Verificación (QA)
Comparar una muestra de posts importados contra el blog viejo: código, imágenes, callouts y orden
de serie fieles.
