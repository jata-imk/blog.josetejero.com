# Token layer: CSS variables + @theme + next/font

**Tarea:** TOD-20  
**Agente:** Frontend (Diseño)  
**Fecha:** 2026-06-18

---

## Por qué existe este documento

Esta nota explica la arquitectura de tokens visuales del blog para José, que está aprendiendo Next.js. El token layer es la capa que conecta los colores, tipografía y espaciado del diseño aprobado con los componentes de React.

---

## 1. CSS custom properties en `:root {}`

El archivo `app/globals.css` define todas las variables visuales del proyecto en un bloque `:root {}`:

```css
:root {
  --bg:        #ffffff;
  --ink:       #0f172a;
  --blue:      #2563eb;
  --r-sm:      8px;
  --sh-1:      0 1px 2px rgba(15, 23, 42, .04), ...;
  /* ... */
}
```

**Qué son las custom properties (variables CSS):**  
Son variables nativas del navegador, no de ningún framework. Se definen con `--nombre: valor` y se consumen con `var(--nombre)`. El selector `:root` es el equivalente a `html` en la cascada: al estar ahí, las variables son globales y accesibles en cualquier elemento del documento.

**Categorías definidas en el proyecto:**

| Prefijo | Qué representa | Ejemplo |
|---------|---------------|---------|
| `--bg`, `--bg-soft` | Superficies (fondos) | `--bg: #ffffff` |
| `--ink`, `--ink-2`, `--ink-3`, `--muted` | Tinta (textos) | `--ink: #0f172a` |
| `--line`, `--line-2` | Bordes y separadores | `--line: #e9edf3` |
| `--blue`, `--violet`, `--cyan`... | Acentos de color | `--blue: #2563eb` |
| `--blue-tint`, `--violet-tint`... | Fondos tintados (badges, callouts) | `--blue-tint: #eaf0fe` |
| `--r-sm`, `--r`, `--r-lg`... | Radios de borde | `--r: 12px` |
| `--sh-1`, `--sh-2`, `--sh-3` | Sombras (whisper-soft) | `--sh-1: 0 1px 2px ...` |
| `--sp-1`, `--sp-2`... | Espaciado (escala 4px) | `--sp-4: 16px` |
| `--wrap`, `--header-h` | Layout | `--wrap: 1120px` |

**Regla dura:** los componentes siempre referencian estas variables (`var(--ink)`), nunca valores en crudo (`#0f172a`). Si un valor no tiene variable, se propone añadirla al sistema.

---

## 2. `@theme` en Tailwind v4: cómo los tokens se convierten en utilidades

Tailwind v4 introduce `@theme`, un bloque especial dentro del CSS que le dice a Tailwind qué utilidades generar:

```css
@theme {
  --color-ink:    var(--ink);
  --color-blue:   var(--blue);
  --radius-sm:    var(--r-sm);
  --font-sans:    system-ui, ...;
  /* ... */
}
```

**Cómo funciona:**

1. Tailwind v4 lee las variables que empiezan por `--color-`, `--font-`, `--radius-`, etc. dentro de `@theme`.
2. A partir de ellas genera utilidades CSS: `text-ink`, `bg-blue`, `rounded-sm`, `font-sans`.
3. Esas utilidades son "punteros" a las custom properties de `:root`, no valores hardcodeados.

**Resultado práctico:** cuando escribes `className="bg-bg text-ink rounded"` en un componente React, el navegador resuelve eso a `background: var(--bg); color: var(--ink); border-radius: var(--r)`. Si cambias el valor en `:root`, cambia en todas las pantallas sin tocar los componentes.

**Por qué `@theme` y no el `tailwind.config.js` de v3:**  
En Tailwind v4 ya no existe el archivo `tailwind.config.js` para los tokens. Todo vive en CSS. `@theme` reemplaza el bloque `theme: { extend: {} }` de la versión anterior.

---

## 3. `next/font/google`: carga de Inter + JetBrains Mono

El archivo `app/fonts.ts` configura las tipografías con `next/font`:

```typescript
import { Inter, JetBrains_Mono } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',    // nombre de la CSS var que inyectará
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500', '600'],
})
```

El layout del frontend (`app/(frontend)/layout.tsx`) usa estos objetos así:

```tsx
import { inter, jetbrainsMono } from '../fonts'

export default function FrontendLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

**Qué hace `.variable`:**  
Cada objeto de next/font expone una propiedad `.variable` que contiene un nombre de clase CSS único (algo como `__Inter_abc123`). Cuando esa clase se aplica a `<html>`, Next.js inyecta en el DOM una regla CSS que define la variable `--font-inter` con la fuente ya descargada.

**El puente en globals.css:**  
En `:root {}` hay estas líneas:

```css
--font-sans: var(--font-inter, system-ui, -apple-system, sans-serif);
--font-mono: var(--font-jetbrains, ui-monospace, monospace);
```

Cuando `--font-inter` existe (porque Next la inyectó), `--font-sans` apunta a Inter. Si la fuente aún no cargó, el fallback `system-ui` evita texto invisible. Después, en `@theme`, `--font-sans` y `--font-mono` alimentan las utilidades `font-sans` y `font-mono` de Tailwind.

---

## 4. Por qué `next/font` resuelve el layout shift vs CDN

**El problema con CDN (Google Fonts `<link>`):**

Cuando pones un `<link>` a Google Fonts en el `<head>`, el navegador:

1. Renderiza la página con la fuente del sistema (fallback).
2. Descarga la fuente del CDN de Google.
3. Aplica la fuente nueva → **los textos cambian de tamaño y el layout se recalcula** (CLS: Cumulative Layout Shift).

Esto se ve como un "parpadeo" o "salto" del texto cuando carga la página. Google penaliza el CLS en sus métricas de ranking.

**Cómo lo resuelve `next/font`:**

1. **Build time, no runtime:** Next.js descarga las fuentes durante el build y las sirve desde el mismo dominio del sitio, no desde `fonts.googleapis.com`. Sin dependencia de red externa.
2. **`size-adjust` automático:** Next calcula la diferencia métrica entre la fuente custom y el fallback del sistema, y genera CSS que hace el fallback del mismo tamaño. El texto no salta al cambiar de fuente.
3. **`display: swap`:** mientras la fuente carga, el texto es visible con el fallback (no invisible). Y como el tamaño es idéntico gracias al `size-adjust`, el layout no se mueve.
4. **Privacidad:** las peticiones no salen a Google durante la navegación del usuario.

---

## 5. Por qué `globals.css` NO se importa en el root layout

El root layout (`app/layout.tsx`) está vacío:

```tsx
export default function RootLayout({ children }) {
  return <>{children}</>
}
```

No importa `globals.css`. La importación vive en el layout del frontend (`app/(frontend)/layout.tsx`):

```tsx
import '../globals.css'
```

**El motivo: aislamiento del admin de Payload (ADR 0004).**

La app usa Route Groups de Next.js App Router:

```
app/
  layout.tsx              ← root layout, vacío, sin CSS
  (frontend)/
    layout.tsx            ← importa globals.css + inyecta next/font
    page.tsx
  (payload)/
    layout.tsx            ← generado por Payload, importa @payloadcms/next/css
    admin/
```

Los paréntesis en `(frontend)` y `(payload)` son **grupos de rutas**: Next.js los ignora en la URL pero aplica su layout a todas las rutas dentro. Esto significa:

- Las rutas del sitio público (`/`, `/blog/…`) pasan por `(frontend)/layout.tsx` → reciben tokens + fuentes del blog.
- Las rutas del admin (`/admin/…`) pasan por `(payload)/layout.tsx` → reciben únicamente el CSS de Payload.

Si importáramos `globals.css` en el root layout, los tokens del blog contaminarían el panel de Payload: colores, radios y tipografías del blog sobreescribirían o conflictuarían con el design system de Payload. El admin dejaría de verse correctamente.

**Resumen del flujo:**

```
next/font (build) → inyecta --font-inter, --font-jetbrains en <html>
     ↓
globals.css :root → lee --font-inter → --font-sans apunta a Inter
     ↓
@theme → --color-ink = var(--ink), --font-sans = var(--font-sans), etc.
     ↓
Tailwind genera → text-ink, bg-bg, font-sans, rounded-sm, ...
     ↓
Componentes usan → className="text-ink font-sans rounded"
```

---

## Archivos de referencia

| Archivo | Rol |
|---------|-----|
| `blog/app/globals.css` | Fuente de verdad: custom properties + `@theme` + reset |
| `blog/app/fonts.ts` | Configuración next/font (Inter + JetBrains Mono) |
| `blog/app/(frontend)/layout.tsx` | Punto de entrada CSS para el sitio público |
| `blog/app/(payload)/layout.tsx` | Layout del admin, aislado, sin tokens del blog |
| `blog/docs/adr/0004-scaffolding-base-next-payload-postgres.md` | Decisión de route groups y aislamiento admin |
