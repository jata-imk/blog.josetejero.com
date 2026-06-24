# TOD-61: Flujo público real + TOC móvil + limpieza de tokens

## Qué se hizo

### 1. Flujo público real en `app/(frontend)/page.tsx`

La home page pasó de Server Component síncrono con datos hardcodeados a **async Server Component** que consulta el CMS en paralelo:

```ts
const [allPosts, categories, seriesList] = await Promise.all([
  getPosts(7),
  getCategories(),
  getSeriesList(),
])
```

- `PostCard` y `ListRow` ahora reciben `href="/blog/${post.slug}"` real.
- Categorías enlazan a `/categoria/${cat.slug}`.
- Series enlazan a `/series/${s.slug}`.
- "Ver todo" en SectionHead recibe `linkHref` explícito (`/blog`, `/series`).
- Se eliminaron los arrays `FEATURED_POSTS`, `LATEST_POSTS`, `CATS_HOME` hardcodeados.
- Helpers locales: `primaryCatSlug`, `fmtDate`, `estimateReadTime`, `postTags`.

`readTime` no existe en el modelo Post (por diseño de Payload), se estima desde el tamaño del JSON del cuerpo Lexical (~1400 chars/min).

### 2. Mobile TOC en `components/blocks/TableOfContents.tsx`

Se añadió `MobileToc` — componente cliente que usa `<details>/<summary>` nativo:
- Cero JavaScript extra: colapso/expansión manejado por el browser.
- El mismo `.ab-toc` reutiliza los estilos ya definidos.
- La visibilidad la controla CSS (`display: none` en desktop, `display: block` en mobile).

Según el handoff: "Tabla de contenidos colapsada" en mobile.

### 3. CSS classes para post page en `app/globals.css`

Nuevas clases que reemplazan valores raw en `[slug]/page.tsx`:

| Clase | Sustituye |
|---|---|
| `.post-head` | `maxWidth: 820, margin: '0 auto', padding: '32px 40px 0'` |
| `.post-wrap` | `maxWidth: 820, margin: '0 auto', padding: '0 40px'` |
| `.post-title` | `fontSize: 40, fontWeight: 800, letterSpacing: '-.035em'` |
| `.post-excerpt` | `fontSize: 19, color: var(--ink-3), lineHeight: 1.6` |
| `.post-meta-row` | flex row con gap y flex-wrap |
| `.post-tags-row` | marginTop: 14px |
| `.post-comments` | sección de comentarios con max-width + padding-bottom |
| `.post-comments-head` | flex row del encabezado de comentarios |
| `.post-comments-title` | h2 tipografía de "Comentarios" |
| `.post-comments-list` | flex column para lista de comentarios |
| `.post-toc-mobile` | wrapper del TOC colapsable móvil |

### 4. Responsive en `@media (max-width: 768px)`

```css
.post-head     { padding: 24px 18px 0; }
.post-wrap     { padding: 0 18px; }
.post-comments { padding: 0 18px 60px; }
.post-toc-mobile { display: block; margin-top: var(--sp-6); }
```

## Por qué

- **Flujo real**: los QA screenshots de TOD-60 revelaron que todos los links del home eran `href="#"` — ninguna card navegaba a ningún post real.
- **Mobile TOC**: el handoff especifica "Tabla de contenidos colapsada" en mobile. La versión anterior ocultaba el aside sin ningún reemplazo → TOC inaccesible en móvil.
- **Tokens**: `[slug]/page.tsx` usaba ~20 valores raw (`fontSize: 40`, `maxWidth: 820`) que son parte del sistema de diseño, no datos de presentación. Moverlos a clases CSS los hace reutilizables y mantenibles.

## Invariantes y decisiones

- `readTime` no se persiste en el modelo (no está en `Post`). Se computa localmente en la home page; si en el futuro se añade al modelo, se elimina el helper.
- El conteo de posts por categoría se omite en la home (requeriría 6 queries extra por categoría). La sección de categorías muestra `Cat pill` + link sin contador por ahora.
- `.post-wrap` mantiene el `marginTop` como inline style en el JSX porque varía por contexto (48/36/32px). El grid/padding viene del token; el espacio entre secciones es contextual.
