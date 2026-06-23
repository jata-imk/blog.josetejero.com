# 2026-06-23 — Engineer — seed dev canónico y expansión de lib/data (TOD-56)

## Qué hice

1. **Reescribí `lib/seed.ts`** de un seed solo de usuarios a un seed canónico completo que cubre todas las colecciones.
2. **Creé 4 nuevos archivos en `lib/data/`** con funciones de acceso tipadas para el resto de colecciones: `categories.ts`, `tags.ts`, `series.ts`, `comments.ts`.
3. **Amplié `lib/data/posts.ts`** con `getPostsByCategory` y `getPostsByTag`.
4. **Actualicé `lib/data/index.ts`** con los nuevos exports de barril.
5. **Actualicé `payload.config.ts`** para llamar `seedDev` en lugar de `seedUsers`.

## El seed canónico

Antes, `onInit` solo creaba 2 usuarios de test. Ahora `seedDev` inserta de forma idempotente (busca por clave natural antes de crear):

- **2 usuarios**: admin + editor (idempotente por `email`)
- **7 categorías canónicas**: Frontend, Backend, Bases de datos, IA, DevOps, Tutoriales, Opinión
- **6 tags**: tutorial, advanced, quick-tip, opinion, review, how-to
- **2 series**: "Aprendiendo Next.js desde cero" (4 posts) y "TypeScript avanzado" (1 post)
- **7 posts**: 5 dentro de series + 2 sueltos, todos publicados

Los posts 1 y 2 (`useRichLexical: true`) incluyen cuerpo Lexical completo con:
- Heading h2 y h3
- Párrafos con **links** inline (apuntan a documentación real)
- Bloque `code` TypeScript con tokens coloreados (keyword `format:2`, identifier `format:8`)
- Bloque **Callout** tipo `tip` con título "Consejo práctico" y contenido richText anidado (incluye texto en bold y link)
- Lista con bullets (incluye formato inline)

Los demás posts usan un cuerpo Lexical base sin Callout pero sí con links, headings, código y lista.

El Callout es un bloque Payload (`type: 'block'`, `blockType: 'callout'`) con campos `variant`, `title` y `content` (richText anidado). Dentro del content del Callout hay un párrafo con bold y un link, demostrando que el renderer debe manejar Lexical anidado.

Todas las relaciones se resuelven por slug durante el seed buscando los documentos ya sembrados. Los posts sin serie se crean sin `series` asignada como artículos independientes.

## Expansión de lib/data

Cada archivo sigue el patrón definido en TOD-22: `import 'server-only'`, `getPayload()`, tipos de `@/payload-types`, barril en `index.ts`.

| Archivo | Funciones | Uso previsto |
|---|---|---|
| `posts.ts` | `getPostBySlug(slug)`, `getPosts(limit, page)`, `getPostsByCategory(slug)`, `getPostsByTag(slug)` | Detalle de post, home, páginas de taxonomía |
| `categories.ts` | `getCategoryBySlug(slug)`, `getCategories()` | Páginas de categoría, sidebar, filtros |
| `tags.ts` | `getTagBySlug(slug)`, `getTags()` | Páginas de tag, nube de tags |
| `series.ts` | `getSeries()` / `getSeriesList()`, `getSeriesBySlug(slug)`, `getSeriesWithPosts(slug)`, `getPostsInSeries(id)` | Página de serie con posts ordenados por `seriesOrder` |
| `comments.ts` | `getCommentsByPost(id)`, `getPendingComments()` | Detalle de post, panel de moderación |

`getSeriesWithPosts` implementa la regla del data-model: ordena por `seriesOrder`, solo posts `published`, sin duplicar posición. `getSeries` es alias de `getSeriesList` (requerido por ADR 0011).

## Decisiones de implementación

- **Callout como bloque**: El Callout en Lexical/Payload es un bloque (`type: 'block'`, `blockType: 'callout'`) con `content` que es un sub-árbol Lexical completo. Esto es distinto de los nodos inline (links, texto en negrita) y de los nodos de bloque simples (heading, paragraph). El renderer del frontend debe leer `fields.blockType === 'callout'` e iterar sobre `fields.content.root.children`.
- **Links en Lexical**: Son nodos inline (`type: 'link'`) anidados dentro de párrafos. Llevan `url` y pueden contener nodos `text` (posiblemente con formato). Aparecen tanto en el cuerpo principal como dentro del contenido del Callout.
- **`getSeries` alias**: El ADR 0011 pide `getSeries` como nombre público pero internamente llamé `getSeriesList` para evitar confusión con el modelo `Series`. El alias en `index.ts` resuelve el contrato sin romper nada.
- **Categorías canónicas**: Las 7 categorías del seed cubren los dominios que el blog quiere reflejar (frontend, backend, bases de datos, IA, DevOps, tutoriales, opinión). Esto reemplaza las categorías genéricas anteriores (JavaScript, TypeScript, etc.) que eran demasiado específicas para ser taxonomía de alto nivel.

## Por qué importa

Sin seed, el desarrollador (o QA) tiene que crear manualmente usuarios, categorías, tags y posts cada vez que levanta la DB desde cero. El seed da un punto de partida idempotente y predecible para iterar rápido. Las funciones en `lib/data` evitan `payload.find` directo en páginas y componentes, cumpliendo ADR 0006.

## Verificación

- `pnpm tsc --noEmit` pasa limpio
- `pnpm lint` pasa limpio
