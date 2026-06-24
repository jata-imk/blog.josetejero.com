# TOD-58 — Pipeline Lexical server-first para detalle de post

## Qué hice

Implementé la pipeline server-first que convierte el JSON de Lexical almacenado en Payload en componentes React listos para renderizar, con derivación de TOC y contexto de serie calculados al vuelo.

## Patrón Lexical → React: Server vs Client

### La frontera Server/Client en Next.js App Router

Next.js 13+ con App Router **renderiza en servidor por defecto**. Los componentes marcados con `'use client'` son la excepción, no la regla. Esto tiene implicaciones importantes para cómo procesamos rich text de Lexical:

1. **Servidor** = datos, transformaciones costosas, acceso a Payload, lógica de negocio
2. **Cliente** = interactividad, estado local, eventos de browser (scroll, click, etc.)

El pipeline de Lexical en este proyecto aprovecha esta separación:

- **Pre-procesamiento en servidor**: resaltado de código con Shiki, extracción de TOC, consultas a Payload
- **Mínima hidratación en cliente**: solo el botón copiar de CodeBlock y el scroll tracking de TableOfContents

### Cómo funciona el pipeline

#### 1. La página (`app/(frontend)/blog/[slug]/page.tsx`)

Es un Server Component (no tiene `'use client'`). Aquí ocurre:

1. **Consulta de datos**: `getPostBySlug` trae el post con depth 2, incluyendo el JSON de Lexical en `post.body.root`
2. **Shiki server-side**: `highlightLexicalCode` recorre el árbol Lexical, encuentra todos los nodos `code` (incluidos los anidados dentro de Callout), los resalta con Shiki, y devuelve un mapa `Map<código, HTML resaltado>`
3. **Extracción de TOC**: `extractToc` recorre el mismo árbol buscando nodos `heading` con tag `h2` o `h3`, extrae su texto, genera un slug estable, y devuelve `TocItem[]`
4. **Contexto de serie**: si el post pertenece a una serie, `getSeriesNavigationContext` deriva la posición visible (`N de M`), el post anterior y el siguiente
5. **Render del árbol**: `<RichText>` recibe el JSON de Lexical y los converters personalizados generados por `makeBodyConverters(highlightMap)`

#### 2. Los converters (`lib/lexical/converters.tsx`)

`makeBodyConverters` crea una función que retorna converters JSX. Estos converters son funciones que transforman cada nodo de Lexical en un elemento React.

**Converters personalizados implementados:**

- `heading`: añade un `id` slugified al heading para que los links del TOC funcionen (`#slug`)
- `code`: en vez de renderizar el código plano, retorna `<CodeBlockClient>` con el HTML ya resaltado desde el mapa pre-calculado
- `blocks.callout`: transforma el bloque custom de Callout en `<Callout>`, y renderiza su contenido anidado con `<RichText>` recursivamente usando los mismos converters

**Por qué los converters son una función que retorna otra función:**

```tsx
export function makeBodyConverters(highlightMap: Map<string, string>): JSXConvertersFunction {
  return ({ defaultConverters }) => {
    const converters: JSXConverters = {
      ...defaultConverters,
      heading: ({ node, children }) => { /* ... */ },
      code: ({ node }) => { /* usa highlightMap aquí */ },
      blocks: {
        callout: ({ node }) => {
          // usa `converters` recursivamente para el contenido anidado
          return <Callout><RichText converters={converters} /></Callout>
        }
      }
    }
    return converters
  }
}
```

Esta estructura permite:
1. **Cerrar sobre datos pre-calculados** (el `highlightMap` de Shiki)
2. **Recursión consistente**: Callout puede contener rich text (párrafos, listas, código) que se renderiza con los mismos converters
3. **Composición con default converters**: solo personalizamos lo que necesitamos; el resto (párrafos, listas, bold, italic, links, imágenes) usa los converters por defecto de Payload

#### 3. Los Client Components mínimos

**CodeBlockClient** (`components/blocks/CodeBlockClient.tsx`):
- Recibe el HTML ya resaltado como prop
- Renderiza el código con `dangerouslySetInnerHTML` (seguro aquí porque el HTML viene de Shiki en servidor, no de usuario)
- El botón copiar usa `'use client'` porque necesita `navigator.clipboard.writeText()`

**TableOfContents** (`components/blocks/TableOfContents.tsx`):
- Recibe `TocItem[]` serializable desde el servidor
- Usa `'use client'` porque necesita `IntersectionObserver` para rastrear qué heading está visible y marcarlo como activo

### Por qué este patrón es mejor que todo-en-cliente

**Alternativa rechazada**: meter Shiki en el bundle del cliente, renderizar Lexical en cliente

Problemas:
- Shiki es pesado (~500KB+ con los themes y grammars)
- El cliente tendría que esperar el JS para ver código resaltado (flash de contenido sin estilo)
- Desperdicio de CPU del usuario en algo que podemos pre-calcular una vez en servidor

**Nuestro patrón**:
- HTML resaltado ya llega en el initial render (no flash, no espera de JS)
- Bundle del cliente es pequeño (solo el botón copiar)
- Si el usuario tiene JS deshabilitado, el código se ve resaltado igual; solo pierde el botón copiar

### TOC derivada vs persistida

**Decisión clave** (ADR 0012): la TOC NO se persiste en Payload. Se deriva del árbol Lexical cada vez que se renderiza la página.

**Por qué:**
- La TOC es una **vista** del contenido, no un dato independiente
- Persistirla crearía una segunda fuente de verdad que puede desincronizarse
- Si el autor edita un heading, la TOC se actualiza automáticamente sin migración de datos
- La extracción es barata: recorrer el árbol una vez para extraer h2/h3

**Implementación** (`lib/lexical/toc.ts`):
```tsx
export function extractToc(root): TocItem[] {
  const items: TocItem[] = []
  collectHeadings(root?.children ?? [], items)
  return items
}
```

Recorre el árbol recursivamente, encuentra nodos `heading` con `tag: 'h2' | 'h3'`, extrae su texto, genera el mismo slug que usará el converter al renderizar, y construye el array de `TocItem`.

**Coherencia de slugs**: `toc.ts` y `converters.tsx` usan la misma función `slugifyHeading` para garantizar que el `id` del heading en el DOM coincida con el `id` en el TocItem. Si no coincidieran, los links `#slug` no funcionarían.

### Serie: orden fuente vs posición derivada

**Decisión clave** (ADR 0012): `seriesOrder` es el campo que define el orden de los posts en una serie. La posición visible (`Parte N de M`) se calcula, NO se persiste.

**Por qué:**
- `seriesOrder` es el dato autoritativo (fuente de verdad)
- La posición visible es una **vista**: encontrar el índice del post actual en la lista ordenada
- Si se inserta un post nuevo en medio de la serie, las posiciones de todos los demás cambian. Persistir la posición crearía deuda de migración cada vez que se reordena.

**Implementación** (`lib/data/series.ts`):
```tsx
export async function getSeriesNavigationContext(post: Post) {
  const posts = await getPostsInSeries(seriesId) // ordenados por seriesOrder
  const currentIndex = posts.findIndex(p => p.id === post.id)
  return {
    currentPosition: currentIndex + 1, // 1-based para display
    totalPosts: posts.length,
    previousPost: posts[currentIndex - 1] ?? null,
    nextPost: posts[currentIndex + 1] ?? null,
  }
}
```

Esto se calcula **una vez por render de página**, en servidor, y el resultado se pasa a los componentes como props serializables.

## Piezas implementadas

### `lib/lexical/converters.tsx`
- `makeBodyConverters`: crea converters JSX con soporte para:
  - Headings con ID slugified (para anchor links desde TOC)
  - Code blocks con HTML pre-resaltado (Shiki server-side)
  - Callout con contenido anidado renderizado recursivamente

### `lib/lexical/toc.ts`
- `extractToc`: deriva TOC desde el árbol Lexical (solo h2/h3)
- `slugifyHeading`: coherente con el slug usado en el converter de headings

### `lib/lexical/index.ts`
- Barrel export del módulo: API pública de la pipeline

### `lib/data/series.ts`
- `getSeriesNavigationContext`: deriva posición visible, prev/next, y metadata de serie
- `SeriesNavigationContext`: tipo exportado para que la página lo consuma

### `app/(frontend)/blog/[slug]/page.tsx`
- Renderiza post con TOC sidebar (si tiene h2/h3)
- Muestra contexto de serie si el post pertenece a una (título de serie, posición, navegación prev/next)
- Toda la lógica de datos ocurre en servidor; los Client Components solo reciben props serializables

## Verificación

Para verificar que el pipeline funciona:

1. **Lint**: `pnpm lint` debe pasar sin errores
2. **Compilación**: `pnpm build` debe completar sin errores de tipo
3. **Runtime** (manual, si hay dev server disponible):
   - Navegar a `/blog/<slug-de-un-post-seed>`
   - Verificar que los headings tienen IDs (inspeccionar DOM)
   - Verificar que el TOC aparece en sidebar y sus links funcionan
   - Verificar que los bloques de código están resaltados (sin flash)
   - Si el post pertenece a una serie, verificar que aparece el contexto (Parte N de M) y la navegación prev/next

## Lecciones para otros contextos similares

### Cuándo usar Server Components vs Client Components

**Usar Server Component (default) cuando:**
- Solo necesitas renderizar datos
- Puedes pre-calcular transformaciones costosas (Shiki, markdown, etc.)
- No hay interactividad (no clicks, no state local)

**Usar Client Component (`'use client'`) solo cuando:**
- Necesitas hooks de React (`useState`, `useEffect`, `useRef`)
- Necesitas APIs del browser (`IntersectionObserver`, `navigator.clipboard`, etc.)
- Necesitas event handlers (`onClick`, `onChange`, etc.)

**Patrón recomendado**: Server Component que pasa props serializables a Client Components pequeños y enfocados.

Ejemplo: `TableOfContents` podría haberse implementado como Server Component que emite HTML puro, pero perdería el tracking de scroll activo. Mejor: Server Component calcula `TocItem[]`, Client Component lo recibe y añade la interactividad.

### Cómo mantener coherencia entre derivaciones

Si derivas datos desde una fuente (como TOC desde Lexical), asegúrate de que:
1. La derivación es **pura** (misma entrada = misma salida)
2. Si hay transformaciones duplicadas (como `slugifyHeading`), **compártelas** en vez de copiar-pegar
3. Documenta **por qué** derivaste en vez de persistir (evita que alguien "optimice" agregando un campo en el futuro)

### Recursión en converters de rich text

Cuando un bloque puede contener rich text anidado (como Callout), la recursión es inevitable:

```tsx
const converters = {
  blocks: {
    callout: ({ node }) => (
      <Callout>
        <RichText data={node.fields.content} converters={converters} />
      </Callout>
    )
  }
}
```

**Importante**: pasar `converters` a sí mismo asegura que el contenido anidado se renderiza con las mismas reglas (headings con ID, code resaltado, etc.). Si pasaras `defaultConverters` o nada, el contenido anidado perdería tus personalizaciones.

## Referencias

- ADR 0009: ruta canónica `/blog/[slug]`
- ADR 0010: contrato del Callout (variant, title, content anidado)
- ADR 0012: serialización Lexical y composición canónica de la página (este issue)
- ADR 0008: render de CodeBlock con Shiki en servidor
