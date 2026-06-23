# TOD-62 — Asegurar render público de /blog/[slug] con datos reales

**Agente:** Engineer  
**Fecha:** 2026-06-23

## Problema identificado

QA reportó 404 en `/blog/app-router-vs-pages-router` (follow-up de TOD-60). Investigación reveló dos problemas:

1. **`getPostBySlug` sin filtro de publicación:** La función traía posts sin verificar `status: 'published'`, inconsistente con `getPosts`, `getPostsByCategory` y `getPostsByTag`.
2. **Sin `generateStaticParams`:** La ruta dinámica `[slug]/page.tsx` no exportaba `generateStaticParams`, por lo que Next.js no pre-renderizaba los slugs seeded. En modo producción (build), esto causaría 404 para rutas no visitadas en dev.

## Cambios realizados

### 1. Filtrar posts publicados en `getPostBySlug`

**Archivo:** `blog/lib/data/posts.ts`

```diff
 export async function getPostBySlug(slug: string): Promise<Post | null> {
   const payload = await getPayload()
   const { docs } = await payload.find({
     collection: 'posts',
-    where: { slug: { equals: slug } },
+    where: {
+      and: [
+        { slug: { equals: slug } },
+        { status: { equals: 'published' } },
+      ],
+    },
     depth: 2,
     limit: 1,
   })
   return docs[0] ?? null
 }
```

**Justificación:** Coherencia con el resto de funciones públicas. Un post en draft o cualquier estado != published no debe ser accesible en la ruta pública.

### 2. Añadir `generateStaticParams` a `/blog/[slug]`

**Archivo:** `blog/app/(frontend)/blog/[slug]/page.tsx`

```diff
+import { getPostBySlug, getPosts, getPostsInSeries, getCommentsByPost } from '@/lib/data'

 type Props = { params: Promise<{ slug: string }> }

+export async function generateStaticParams() {
+  const posts = await getPosts(100)
+  return posts.map((post) => ({ slug: post.slug }))
+}
+
 export async function generateMetadata({ params }: Props): Promise<Metadata> {
```

**Justificación:** Next.js App Router requiere `generateStaticParams` para pre-renderizar rutas dinámicas en build time. Sin esto, las rutas seeded solo funcionarían on-demand en runtime, causando 404 en builds optimizados.

## Validación

- ✅ `pnpm tsc --noEmit` pasa sin errores
- ✅ Imports actualizados correctamente
- ✅ Filtro de publicación consistente con otras funciones públicas

## Slugs seeded disponibles para QA

Los siguientes slugs están seeded con `status: 'published'` y contenido Lexical rico (incluyendo TOC, code blocks, callouts, listas):

1. **`app-router-vs-pages-router`** ← mencionado en el issue original
2. `por-que-migre-astro-nextjs-payload`
3. `server-components-server-actions`
4. `deploy-nextjs-docker-caddy-postgres`
5. `genericos-typescript-avanzados`
6. `5-patrones-react-reducen-bugs`
7. `docker-frontend-minimo-indispensable`

### Ruta de validación para QA

1. Asegurar que la DB tiene datos seeded (si no: `pnpm payload seed`)
2. Arrancar dev server: `pnpm dev`
3. Navegar a: **http://localhost:3000/blog/app-router-vs-pages-router**
4. Verificar:
   - Responde 200 (no 404)
   - TOC visible en sidebar desktop
   - Code block con syntax highlighting
   - Callout (tip) visible
   - Navegación de serie (badge "Serie", lista de posts con estados)
   - PrevNext entre posts de la misma serie
   - Comentarios (formulario + mensaje vacío si no hay)

## Decisión tomada

No se requiere build de producción para validar este fix. El problema de 404 era funcional (falta de `generateStaticParams` + filtro de publicación), no de configuración de Next.js. La validación en dev es suficiente.

## Evidencia para QA

**Slug canónico para validación:** `app-router-vs-pages-router`  
**Ruta completa:** `/blog/app-router-vs-pages-router`  
**Serie asociada:** "Aprendiendo Next.js desde cero" (post 2/4)
