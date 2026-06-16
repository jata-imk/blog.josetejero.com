# Inventario de componentes — Aleliz Blog (del handoff)

> Derivado de `aleliz.css` + `ab-kit.jsx`/`ab-kit2.jsx`/`ab-system.jsx`. Cada componente apunta a su
> clase CSS (`.ab-*`) y a su archivo JSX de referencia en `handoff/sistema-de-pantallas/project/`.
> El handoff son prototipos HTML/CSS/JS scoped bajo `.ab`: al implementar en React+Tailwind,
> **reproducir el resultado visual**, no copiar la estructura del prototipo.

## Pantallas (12 artboards)
Home · Blog index · Post individual · Serie · Categoría · Tag · Búsqueda · Sobre mí ·
Comentarios (estados) · 404 · variantes Mobile · Design system. Definidas en `ab-pages-1.jsx`,
`ab-pages-2.jsx`, `ab-mobile.jsx`, `design-canvas.jsx`.

## Componentes

| Componente | Clase CSS / ref | Variantes / estados | Notas |
|---|---|---|---|
| `Header` | `.ab-header`, `.ab-nav`, `.ab-logo` | activo (underline azul), compact (mobile), sticky+blur | nav: Inicio/Blog/Series/Categorías/Sobre mí; social GitHub/X/LinkedIn. **Marca: "José Tejero"** (logo-mark "J" con gradiente), no "Aleliz Blog" — ver `branding.md` |
| `Footer` | `.ab-footer`, `.ab-footer-cols` | desktop 3 col / mobile apilado | logo + tagline + links + copyright. Copyright = "José Alejandro Tejero Aguilar" |
| `Btn` | `.ab-btn` | `primary` (ink), `grad`, `secondary`, `ghost`; `sm`, `icon`/`iconRight`, `loading` (spinner), `disabled`, focus-ring | |
| `Cat` (CategoryChip) | `.ab-cat[data-cat]` | 7 categorías (color por `data-cat`), `lg`, con/sin dot | |
| `Tag` (TagChip) | `.ab-tag` | hover; opcional `#` | |
| `chip` (filtro) | `.ab-chip` | normal, `active`, hover | "Todos/Frontend/Backend…" |
| `Badge` | `.ab-badge` | `grad` (Destacado), `series` (Serie), `soft` (Borrador) | |
| `status` (comentarios) | `.ab-status` | `pending` (ámbar), `ok` (verde), `err` (rosa) | con punto |
| `Thumb` (cover placeholder) | `.ab-thumb` | tonos t-blue/violet/cyan/green/amber/mix, `glow` | rayado + label mono; sustituir por `Media` real |
| `PostCard` | `.ab-card.ab-post` | hover (eleva), con/sin serie, con/sin comentarios | cover 16/9, cat, título, excerpt, tags, meta |
| `FeaturedCard` | `.ab-card.ab-feat` | hover | horizontal 1.15fr/1fr, badge Destacado, CTA grad |
| `ListRow` | `.ab-row` | hover | cover 120×80, para búsqueda/categoría compacta |
| `Meta` | `.ab-meta`, `.ab-meta-row`, `.ab-sep` | iconos calendar/clock/message | |
| `Breadcrumb` | `.ab-crumb` | item actual `.cur` | Inicio / Blog / Categoría / Título |
| `prose` (cuerpo artículo) | `.ab-prose` | h2/h3, p, ul/ol, blockquote, links, strong | ancho lectura ~760px |
| `CodeBlock` | `.ab-code` | barra (dots + lang + **Copiar**), tema oscuro `#0f172a` | tokens `.tk-*`; en la app = Shiki, RENDER no dato |
| `Callout` | `.ab-callout` | `note` (azul), `tip` (verde), `warn` (ámbar) | icono + título + cuerpo; único bloque custom Lexical |
| `TableOfContents` | `.ab-toc` | item normal/`active`/`sub` | sticky en desktop, colapsada en mobile |
| `SearchInput` | `.ab-search` | normal, `lg`, focus (ring), con `kbd` | |
| `field`/`input`/`textarea` | `.ab-field`, `.ab-input`, `.ab-textarea` | normal, focus | |
| `Comment` | `.ab-comment`, `.ab-avatar` | con estado (pending/ok), acciones (responder) | avatar iniciales |
| `CommentForm` | (en `ab-kit2`) | normal, `sending`, `error` | nombre/email/comentario + aviso moderación |
| `EmptyState` | `.ab-empty` | iconos message/search/frown | título + texto |
| `SeriesStep` + progreso | `.ab-step`, `.ab-progress` | `done`, `current`, `soon` | número de parte; barra grad |
| `Pagination` | `.ab-pager` | normal, `active`, `disabled` | |
| `PrevNext` | `.ab-prevnext`, `.ab-pn` | prev / next (alineación) | |
| `AuthorCard` | `.ab-author` | — | avatar grad + bio |
| `Skill` (SkillChip) | `.ab-skill` | hover (eleva), con icono | About: agrupadas por área |
| `SEOPreview` | `.ab-seo`, `.ab-serp` | card admin/auxiliar | meta title/desc/canonical/OG (solo CMS) |
| `404` | `.ab-404-code` | — | número 150px con gradiente clip |

## Cómo lo usa el Frontend (Fase 2)
1. Implementa el **token layer** primero (`design/globals.css` → `src/app/globals.css`).
2. Toma un componente, abre su clase en `aleliz.css` + su JSX, reprodúcelo en React+Tailwind con tokens.
3. Cubre todos los estados de la fila. QA compara render vs. el prototipo (desktop + móvil).
