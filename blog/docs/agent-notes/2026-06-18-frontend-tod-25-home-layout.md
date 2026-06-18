# TOD-25 — Home page: replace placeholder with tokenized layout

## What changed

`app/(frontend)/page.tsx` and `app/globals.css`.

### globals.css additions
Added a full **component CSS layer** (~230 lines) after the existing token reset:
- Layout: `.wrap`, `.wrap-narrow` (1120px / 760px max-width with 40px padding)
- Header: `.site-header` (sticky, frosted-glass backdrop filter), `.site-header-in`, `.logo`, `.logo-mark`
- Nav: `.site-nav a` + `.active::after` (2px blue underline via pseudo-element — can't do with Tailwind alone)
- Buttons: `.btn`, `.btn-grad`, `.btn-secondary`
- Cards: `.card`, `.card-hover`
- Post cards, thumbnails, list rows, category pills, badges, meta bits, tags, section head, series progress, footer
- Mobile breakpoint at 768px (18px padding, collapsed footer grid)

All colours reference CSS variables (`var(--blue)`, `var(--ink-3)`, etc.) — no hardcoded values.

### page.tsx
Replaced the single `<h1>josetejero.com</h1>` placeholder with the full approved layout:

1. **SiteHeader** — sticky frosted glass, gradient "J" logo mark, 5-item nav (Inicio active), social icon buttons
2. **Hero** — centered, eyebrow "Desarrollo · Automatización · IA", 52px / 800w H1 with emoji, subtext, grad + secondary CTA
3. **Featured posts** — `SectionHead` + 3-column `PostCard` grid (placeholder data)
4. **Latest + Categories** — 1.6fr / 1fr grid: `ListRow` list on left, category link cards on right
5. **Series** — `bg-soft` section, 3-column `SeriesCard` grid with progress bar
6. **SiteFooter** — 3-column (logo + desc, Explorar, Sitio) + copyright + social icons

### Data strategy
All post/series data is static placeholder until Payload CMS is wired up. The component tree is identical to what CMS-driven components will use — data source will be swapped, not the structure.

## Why Server Component
No interactivity on the home page at this stage (hover effects are CSS-only). Keeping it as a Server Component gives static prerendering (confirmed by the build output showing `○ /`).

## Verification
- `pnpm build` → ✅ compiled, all 4 pages generated
- `pnpm lint` → ✅ no errors
- `/admin` route preserved as `ƒ` (dynamic)
- `/` now `○` (static prerendered)
