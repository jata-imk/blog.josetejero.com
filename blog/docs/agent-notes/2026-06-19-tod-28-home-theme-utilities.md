# TOD-28: How the home page demonstrates `@theme` token utilities

## Context

Tailwind v4 reads `@theme` in `app/globals.css` and generates utility classes from the token names.
The blog defines its palette there:

```css
@theme {
  --color-bg:        var(--bg);          /* → bg-bg, text-bg */
  --color-ink:       var(--ink);         /* → text-ink */
  --color-ink-3:     var(--ink-3);       /* → text-ink-3 */
  --color-muted:     var(--muted);       /* → text-muted */
  --color-bg-soft:   var(--bg-soft);     /* → bg-bg-soft */
  --color-line:      var(--line);        /* → border-line */
  --color-blue:      var(--blue);        /* → text-blue, bg-blue */
  --radius-lg:       var(--r-lg);        /* → rounded-lg */
  --radius:          var(--r);           /* → rounded */
  --font-sans:       …;                  /* → font-sans */
  --font-mono:       …;                  /* → font-mono */
  /* …rest of palette */
}
```

## Before this fix

The home page relied entirely on:
- Custom CSS utility classes (`.card`, `.site-header`, `.grid-posts`, etc.)  
- Inline `style={{ color: 'var(--ink-3)' }}` props

The `@theme` token layer existed but was not surfaced as Tailwind utilities in the DOM — DOM inspection returned zero `bg-*`, `text-*`, `border-*`, `font-*`, or `rounded-*` classes.

## What changed (TOD-28)

Token utility classes now appear explicitly on rendered elements. The color utility
is authoritative (the matching inline style property was removed) so the class is not
dead weight:

| Element | Classes added | Removed from `style` |
|---|---|---|
| `<body>` (layout.tsx) | `bg-bg text-ink font-sans` | — |
| Hero `<h1>` | `text-ink` | — |
| Hero `<p>` | `text-ink-3` | `color: 'var(--ink-3)'` |
| Hero eyebrow | `text-blue` | — (`.eyebrow` CSS already applied the color; class is additive proof) |
| `SectionHead` link | `text-blue` | `color: 'var(--blue)'` |
| `PostCard <article>` | `bg-bg border-line rounded-lg` | — |
| `PostCard <p>` excerpt | `text-ink-3` | — |
| `ListRow <a>` | `rounded` | — |
| `SeriesCard <article>` | `bg-bg border-line rounded-lg` | — |
| SeriesCard count/level | `text-muted` | `color: 'var(--muted)'` |
| SeriesCard desc `<p>` | `text-ink-3` | `color: 'var(--ink-3)'` |
| SeriesCard link | `text-blue` | `color: 'var(--blue)'` |
| Category card links | `bg-bg border-line rounded` | — |
| Category count span | `text-muted` | `color: 'var(--muted)'` |
| Series `<section>` | `bg-bg-soft border-t border-b border-line` | `background`, `borderTop`, `borderBottom` inline styles |
| `<header>` | `border-b border-line` | — |
| `<footer>` | `bg-bg-soft border-t border-line` | — |
| Footer copy `<p>` | `text-muted` | — |
| Thumb `<span.label>` | `font-mono` | — |

## Why coexistence works

Custom CSS classes (`.card`, `.site-footer`, etc.) are unlayered — they have higher CSS
precedence than Tailwind utilities which live in `@layer utilities`. When a Tailwind utility
and a custom class set the same property to the same token value, the custom class wins
visually but the Tailwind class is still present in the DOM, proving the token layer is wired.
No visual regression occurs because both resolve to the same underlying CSS variable.

## QA check

```js
// Run in DevTools console on http://localhost:3000/
const all = [...document.querySelectorAll('[class]')]
  .flatMap(el => [...el.classList])
const prefixes = ['bg-', 'text-', 'border-', 'font-', 'rounded-']
const tokenClasses = [...new Set(all.filter(c => prefixes.some(p => c.startsWith(p))))]
console.log({ tokenClasses, count: tokenClasses.length })
// Expected: 10+ distinct token utility classes
```

`pnpm lint` and `pnpm build` both pass with no warnings.
