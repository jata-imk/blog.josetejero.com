# 2026-06-29 — Engineer: Importador MD→Lexical + UI en el editor + ADR 0023

## Qué se hizo

Implementación de la Parte 3 del proyecto (Fase 3): flujo para importar Markdown a Posts con
cuerpo Lexical, más los campos de modelo y render definidos en ADR 0023.

### Archivos creados/modificados

| Archivo | Cambio |
|---|---|
| `lib/lexical/bodyEditor.ts` | Editor compartido (DRY) para `Posts.body` y `Series.body` |
| `collections/Posts.ts` | +`seriesDepth`, campo `ui` para el botón, endpoint `POST /:id/import-md` |
| `collections/Series.ts` | +`body` richText (coexiste con `description`) |
| `lib/import/mdToLexical.ts` | Converter MD → árbol Lexical (core) |
| `lib/import/uploadImage.ts` | Subida de imágenes locales y remotas a Media con dedupe |
| `components/admin/ImportMarkdownField.tsx` | Componente UI con modal para el botón de importación |
| `app/(frontend)/series/[slug]/page.tsx` | Render de `series.body` con `<RichText>` + `highlightLexicalCode` |
| `components/series/SeriesStep.tsx` | Prop `depth` + indentación visual (`marginLeft: depth * 24px`) |
| `payload-types.ts` | Regenerado (incluye `Post.seriesDepth`, `Series.body`) |
| `app/(payload)/admin/importMap.js` | Regenerado (incluye `ImportMarkdownField`) |

### Dependencias añadidas

- `gray-matter` — parsear frontmatter YAML del MD.
- `unified`, `remark-parse`, `@types/mdast` — parsear MD a árbol mdast para el converter.
- `@payloadcms/ui@3.85.1` — `useDocumentInfo` en el componente de admin.

---

## Por qué estas decisiones (aprendizajes para el board)

### 1. `defaultEditorFeatures` ya incluye lo que ADR 0023 #3 pedía añadir

ADR 0023 decía añadir `UploadFeature` + un converter custom `upload` → `next/image`. Pero
investigando el paquete instalado:

```js
// node_modules/@payloadcms/richtext-lexical/dist/lexical/config/server/default.js
export const defaultEditorFeatures = [
  BoldFeature(), ItalicFeature(), ... LinkFeature(), RelationshipFeature(),
  BlockquoteFeature(), UploadFeature(), HorizontalRuleFeature(), ...
]
```

`Posts.body` hace `features: ({ defaultFeatures }) => [...defaultFeatures, BlocksFeature(...)]`
→ `UploadFeature`, `BlockquoteFeature` y `HorizontalRuleFeature` **ya estaban dentro**. El
`defaultConverters` de `@payloadcms/richtext-lexical/react` también ya maneja nodos `upload`,
`quote` y `horizontalrule`. Por eso en `converters.tsx` solo se overridean los que necesitan
lógica especial (heading con id, callout, Code con Shiki). El ADR 0023 #3 quedó como no-op y
se omitió. Menos código, mismo resultado.

### 2. Por qué el botón hace POST al servidor en lugar de inyectar el estado Lexical

El editor de Payload initializa su `editorState` al **montar** el componente React. Una vez
montado, no hay una API pública para "reemplazar" todo el contenido desde fuera sin re-montar.
Aunque existe `editor.setEditorState()` de Lexical, exige acceder a la instancia del editor, lo
que requeriría un `ref` compartido que Payload no expone fácilmente en componentes `ui`.

La solución robusta: el botón llama a un **endpoint REST propio** (`POST /api/posts/:id/import-md`),
el server convierte y guarda con `payload.update()`, y luego el componente dispara
`window.location.reload()`. El editor se re-monta con el nuevo body ya en la BD. Es un ciclo de
vida completo: nada frágil, nada de estado compartido.

### 3. Patrones del endpoint custom en Payload v3

En `CollectionConfig.endpoints` se añade una entrada con `method`, `path` (relativo al slug
de la colección) y `handler: async (req) => Response`. El `req` tiene `req.payload`, `req.user`,
`req.routeParams` (los params de la ruta como `:id`). Se devuelven `new Response(...)` web-standard,
igual que los App Router Route Handlers de Next.js.

Cosas a tener en cuenta:
- `req.user` es `null` si no hay sesión → guard con `if (!req.user) return 401`.
- `req.json()` puede no existir en algunos entornos de prueba; hay que hacer `try/catch`.
- `id` del doc viene en `req.routeParams` y es un string (número serializado); hay que
  `Number(id)` para Postgres.

### 4. El campo `type: 'ui'` en Payload v3

Un campo `{ name: '...', type: 'ui', admin: { components: { Field: '<path>#<NombreExportado>' } } }`
inserta un componente React arbitrario en el formulario del documento. El path debe coincidir
**exactamente** con el alias TS que Payload conoce (el mismo `@/...` del `tsconfig`). Después de
añadirlo hay que regenerar el importmap:

```
pnpm generate:importmap
```

Esto actualiza `app/(payload)/admin/importMap.js` y el servidor de admin carga el bundle correcto.

### 5. Por qué se usa `.parse()` de unified y no `.process()`

`unified().use(remarkParse).process(input)` → corre el pipeline completo (parse + transform +
stringify) y devuelve un `VFile` cuyo `.value` es el string resultado. El AST no queda expuesto.
Para obtener el árbol directamente: `unified().use(remarkParse).parse(input)` devuelve el `Root`
sincrónicamente. Es lo que necesita el walker del converter.

### 6. Asides `<aside class="bg-*">` — extracción antes del parser

`remark-parse` trata el HTML raw como nodos `html` (un solo string). Si el aside tiene múltiples
líneas o párrafos, se fragmenta en varios nodos `html`. Para manejarlos de forma fiable:

1. **Antes de parsear**, se extraen todos los `<aside...>...</aside>` del string con regex y se
   reemplazan por marcadores `<!--ASIDE-0-->`, `<!--ASIDE-1-->`, etc.
2. El MD resultante (sin asides) se pasa a `unified().parse()`.
3. Los marcadores aparecen como nodos `html` → se detectan y se sustituyen por el bloque callout.
4. El interior del aside se re-parsea como MD normal para generar el `content.root` del callout.

**Límite:** el campo `calloutBlock.content` usa `lexicalEditor()` básico (sin `BlocksFeature`).
Un code fence anidado dentro de un aside no es válido allí → se degrada a párrafo y se reporta.
Solo ocurre en `branching-estrategico/index.md:82` del blog viejo.

### 7. Nodo `upload` inline — forma exacta (importante para el importer)

```ts
{
  type: "upload",
  version: 3,
  format: "",
  id: "<uuid-del-nodo>",   // ← UUID propio del nodo, NO el id del doc Media
  relationTo: "media",
  value: 42,               // ← id numérico del documento Media en Postgres
  fields: {},
}
```

Extraído de `SerializedUploadNode` en `@payloadcms/richtext-lexical/dist/features/upload/server/nodes/UploadNode.d.ts`.

---

## Flujo de uso para el usuario

1. En `/admin/collections/posts/<id>`, abrir cualquier post guardado.
2. El campo "Importar Markdown" muestra el botón `↑ Importar Markdown`.
3. Click → modal: pegar o subir un `.md` de Notion (o del blog viejo).
4. Click "Importar" → el servidor convierte el MD, sube las imágenes a Media y actualiza el `body`.
5. La página recarga → el editor Lexical muestra el contenido importado listo para editar.
6. Ajustar en el sidebar: `series`, `seriesOrder`, `seriesDepth` (0 raíz / 1 sub-artículo),
   `publishedAt`, `categories`, `tags`, `status: published`.

Para migrar las **19 entradas del blog viejo** (`blog.aleliz.xyz`): importar post a post con esta
UI. Las series (`configurar-laravel-...`, `openclaw`, `git-merge-deploy`) se crean manualmente en
`/admin/collections/series` rellenando `title`, `slug`, `description`, y luego se usa el mismo
botón para importar el `body` de los `index.md` de portada. Los campos de series en el sidebar
se asignan a mano.

---

## Verificación QA pendiente (para el board)

- `pnpm dev` sin errores TS en la consola.
- En `/admin`: crear post → guardar → botón "Importar Markdown" → pegar un MD con heading,
  lista, código, aside `bg-blue-100`, imagen inline → importar → el editor recarga con el
  contenido correcto, Media tiene la imagen.
- Probar con MD de Notion (sin frontmatter, imágenes como URL).
- `/series/<slug>` con `Series.body` relleno → muestra la portada rich.
- `SeriesStep` con `seriesDepth=1` → indentado a la derecha.
