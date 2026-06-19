# 2026-06-19 — Engineer — estructura física del frontend y patrón lib/data (TOD-22)

## Qué hice

Siguiendo el ADR 0006 (ya escrito por el Architect en TOD-18), creé la estructura física de
carpetas y el ejemplo de referencia en `lib/data/` que marca el patrón de acceso a datos:

- Creé los directorios bajo `components/` (ui, layout, blocks, post, series, comments, search, about), `lib/data/`, `lib/lexical/`, `lib/utils/` y `hooks/`, cada uno con su `.gitkeep`.
- Instalé `server-only` como dependencia (marca archivos para que fallen si se importan desde un Client Component).
- Escribí `lib/data/getPayload.ts` (helper con caché de instancia), `lib/data/posts.ts` (`getPostBySlug`, `getPosts`) y `lib/data/index.ts` (barrel).
- Verifiqué que compila con `pnpm build`.

El ADR 0006 ya estaba escrito y `docs/architecture/overview.md` ya actualizado por el Architect, así que no repetí documentación de arquitectura.

## Cómo funciona el patrón lib/data

### Por qué existe esta capa

En Next.js App Router, un **Server Component** puede hacer `await` directamente y leer de base de datos. Si cada página llamara `payload.find` sin más, el acoplamiento se dispersaría rápido:

- Cada página repite la misma configuración de `depth`, `where`, `sort`...
- Cambiar una consulta implicaría buscar en 15 archivos
- No hay un sitio canónico donde ver "así se obtienen datos en este proyecto"

`lib/data/*` resuelve eso con **funciones nombradas** que expresan intención del dominio:

```ts
// ❌ Esto se dispersa por el código
const payload = await getPayload({ config })
const { docs } = await payload.find({
  collection: 'posts',
  where: { slug: { equals: slug } },
  depth: 2,
  limit: 1,
})

// ✅ Esto vive en un solo sitio y expresa intención
import { getPostBySlug } from '@/lib/data'
const post = await getPostBySlug(slug)
```

No es un repository ni una capa enterprise — es una **barrera pragmática** para mantener el
código legible. Si el producto crece y necesita caché o consultas más complejas, este es el
sitio donde añadirlas sin tocar componentes.

### El helper getPayload()

```ts
// lib/data/getPayload.ts
import 'server-only' // ← revienta si se importa desde un Client Component
import { getPayload as getPayloadBase } from 'payload'
import config from '@payload-config'

let cached: Payload | null = null

export async function getPayload(): Promise<Payload> {
  if (cached) return cached
  cached = await getPayloadBase({ config })
  return cached
}
```

`@payload-config` es un alias de TS configurado en `tsconfig.json` que apunta a
`./payload.config.ts`. Payload expone `getPayload({ config })` como la forma de obtener su
instancia desde cualquier parte del servidor Next.js. La caché evita instanciar Payload
múltiples veces en la misma request (aunque en práctica Payload ya maneja singletons internos;
la caché es una optimización adicional inofensiva).

La directiva `import 'server-only'` es una **barrera de seguridad**: si alguien intenta
importar `getPayload` desde un componente con `'use client'`, Next.js lanza un error de build.
Esto es fundamental porque la Local API de Payload expone acceso completo a la base de datos y
nunca debe llegar al navegador.

### Las funciones de datos

```ts
// lib/data/posts.ts
import 'server-only'
import type { Post } from '@/payload-types'
import { getPayload } from './getPayload'

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })
  return docs[0] ?? null
}
```

Puntos clave:
- `depth: 2` rellena relaciones hasta 2 niveles (autor, categorías, serie, imagen de portada...).
- `limit: 1` optimiza la consulta cuando solo necesitamos un resultado.
- Tipado con `Post` generado por Payload (`payload-types.ts`), así el consumidor tiene autocompletado.

## Server Components vs Client Components

Este es el concepto más importante para entender el frontend de este blog.

### Server Components (por defecto en App Router)

Un Server Component se ejecuta **solo en el servidor**. Su JS **no se envía al navegador**.
Puede ser `async`, leer bases de datos y acceder a secretos. El resultado es HTML puro.

```tsx
// Esto es un Server Component (no lleva 'use client')
// Se ejecuta en el servidor, el navegador recibe HTML ya renderizado
export default async function BlogPage() {
  const posts = await getPosts()
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}
```

Ventajas para el blog:
- Las consultas a Payload ocurren cerca de la base de datos, con latencia mínima.
- El HTML que llega al navegador es más ligero (cero JS de los componentes de servidor).
- SEO funciona sin configuración extra: el HTML está completo al llegar.

### Client Components (solo cuando hay interactividad)

Un Client Component lleva `'use client'` al inicio. Se ejecuta en servidor Y en cliente
(hidratación). Su JS sí viaja al navegador. Puede usar `useState`, `useEffect`, eventos...

```tsx
'use client'
import { useState } from 'react'

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true) }}>
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}
```

### Cuándo usar cada uno en este proyecto

| Caso | Tipo | Razón |
|------|------|-------|
| Página de blog, lista de posts | Server | Solo renderiza datos, no tiene interactividad |
| Card de post individual | Server | Solo muestra datos |
| `<CodeBlock>` + botón copiar | Client | El botón copiar necesita `onClick` y `navigator.clipboard` |
| Menú móvil (hamburguesa) | Client | Necesita `useState` para abrir/cerrar |
| TOC con scroll spy | Client | Necesita `useEffect` + `IntersectionObserver` |
| Formulario de comentarios | Client | Necesita estado del formulario y `onSubmit` |
| Buscador con input reactivo | Client | El input necesita estado local para filtrar |

La regla es: **Server Component por defecto. `'use client'` solo si hay una interacción que lo justifica.**

Esto no es una preferencia estilística — es una consecuencia de cómo funciona App Router: cada
`'use client'` añade JS al bundle del navegador. Para un blog que es mayoritariamente contenido,
mantener el JS al mínimo mejora rendimiento, SEO y simplicidad del código.

## Por qué no hay store global

ADR 0006 decide explícitamente **no introducir Zustand/Redux/Context global**. El estado UI
se resuelve con hooks locales (`useState` en un `'use client'`). Si más adelante aparece un
caso real que lo exija (ej. carrito de compras, wizard multi-paso), se evalúa en ese momento.
Hoy sería YAGNI.

Esta decisión también ayuda al board a aprender: los hooks locales son más fáciles de rastrear
que un store con selectores y acciones despachadas.
