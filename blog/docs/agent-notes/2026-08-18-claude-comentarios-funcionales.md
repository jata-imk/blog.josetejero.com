# 2026-08-18 — Claude — La sección de comentarios ahora funciona de verdad

## Qué hice

La pregunta de José fue directa: *"la sección de comentarios que tenemos, ¿en realidad funciona?"*.
La respuesta era **no**. Se pintaba perfecta, pero el formulario nunca había creado un comentario —
ni uno en producción desde que existe.

Arreglado eso, y de paso los cuatro problemas que aparecieron al levantar la alfombra: revalidación,
fuga de emails, anti-spam y el botón "Responder" que era puro decorado. La decisión completa está en
el [ADR 0032](../adr/0032-comentarios-publicos-moderados.md); aquí explico el **porqué** y los
conceptos, que es lo que sirve para aprender.

## El bug original: hablar el idioma equivocado

`CommentForm` hacía esto:

```ts
fetch('/api/comments', { method: 'POST', body: JSON.stringify({ postId, name, email, text }) })
```

Y no existía ningún fichero que atendiera `/api/comments`. Entonces, ¿a dónde iba la petición?

Payload v3 no es un servidor aparte: **vive dentro de la misma app Next**. Su API REST se monta con
un fichero catch-all generado, `app/(payload)/api/[...slug]/route.ts`, que dice "todo lo que empiece
por `/api/` y no lo atienda nadie más, es mío". Así que el `POST` acababa en el endpoint de creación
de la colección `comments`... que espera los nombres de campo **de la colección**:

| Lo que enviaba el form | Lo que espera Payload |
|------------------------|-----------------------|
| `postId`               | `post`                |
| `name`                 | `authorName`          |
| `email`                | `authorEmail`         |
| `text`                 | `body`                |

Payload ignora los campos que no conoce y valida los requeridos: no llegaba ninguno → `400` →
`if (!res.ok) throw` → el formulario mostraba "No se pudo enviar el comentario". Siempre. Nunca hubo
un caso bueno que probar, porque el caso bueno era imposible.

**La lección**: un `fetch` a una URL que "parece" tuya puede estar hablando con otra cosa. Cuando un
framework monta rutas catch-all, un 400 no significa "mi código falló", puede significar "le estoy
hablando a quien no era".

## Por qué una ruta propia y no arreglar los nombres

Cambiar cuatro claves del JSON habría hecho que el formulario funcionara en cinco minutos. No lo hice
por una razón: para que eso funcione, el `create` de la colección tiene que estar **abierto a
internet** (`create: () => true`, como estaba). Es decir, cualquiera con `curl` puede meter filas en
tu base sin pasar por ningún filtro.

Con una ruta propia (`app/(frontend)/api/comments/create/route.ts`) hay un sitio donde poner
validación, honeypot y rate limit, y el `create` de la colección se puede cerrar
(`({ req }) => !!req.user`). El alta pública la hace la **Local API** de Payload
(`payload.create(...)` desde el servidor), que salta el access control por diseño: no es una petición
HTTP, es código nuestro llamando a la capa de datos directamente. Esa es la diferencia clave entre la
REST API (para el mundo) y la Local API (para tu propio servidor).

**Detalle importante — por qué `/api/comments/create` y no `/api/comments`:** si hubiera creado una
ruta estática en `/api/comments`, le ganaría por especificidad al catch-all de Payload y le robaría
el endpoint REST de la colección... que es justo el que usa `/admin` para listar comentarios. Habría
arreglado el formulario rompiendo el panel. Colgando la ruta un nivel más abajo no hay colisión.

## Server Components, islas de cliente y por qué el email no puede viajar

La página del post es un **Server Component**: se ejecuta en el servidor, consulta Postgres y nunca
baja al navegador. Pero "Responder" necesita estado en el navegador (saber a qué comentario estás
respondiendo). La solución no es convertir la página entera en cliente, sino crear una **isla**:
`components/comments/CommentsSection.tsx` lleva `'use client'` y es lo único que se hidrata. Mismo
patrón que ya usaba el bloque `ChmodCalculator`.

Ahora la parte que no es obvia: **todo lo que un Server Component le pasa como props a un Client
Component viaja al navegador**, serializado dentro del payload de RSC, y se puede leer en el código
fuente de la página. Si le hubiera pasado los documentos de Payload tal cual, el `authorEmail` de
cada persona que comenta estaría publicado en el HTML. Por eso la página los recorta antes con
`toPublicComment()`: `id`, nombre, fecha ya formateada y texto. Nada más.

Y una segunda capa por si mañana alguien se salta esa: el campo `authorEmail` tiene ahora acceso a
nivel de campo (`read: ({ req }) => !!req.user`), así que tampoco sale por la API pública de Payload.
Antes, `GET /api/comments` devolvía el email de todo el mundo a cualquiera que preguntara.

*(De paso: la fecha se formatea en el servidor a propósito. Si `Intl.DateTimeFormat` se ejecutara en
el navegador, la zona horaria del visitante podría dar un día distinto al del servidor y React se
quejaría de "hydration mismatch": el HTML que llegó no coincide con el que el cliente calcula.)*

## Por qué aprobar un comentario no se veía (ISR y `revalidatePath`)

`app/(frontend)/layout.tsx` declara `export const revalidate = 3600`. Eso es **ISR**: Next genera el
HTML de la página una vez, lo cachea y lo sirve a todo el mundo sin volver a tocar la base durante una
hora. Buenísimo para rendimiento, y la razón por la que el blog aguanta tráfico sin sudar.

El efecto secundario: si apruebas un comentario en `/admin`, la página cacheada sigue siendo la
vieja. Podrías esperar una hora. La alternativa es **revalidación on-demand**: decirle a Next "esta
ruta concreta ha quedado obsoleta, vuelve a generarla". Eso es `revalidatePath('/blog/mi-slug')`.

Lo montamos con hooks de colección (`afterChange`, `afterDelete` en `collections/Comments.ts`), que
son funciones que Payload ejecuta después de escribir. Como Payload corre dentro de Next, el hook
puede llamar a `revalidatePath` y refrescar la página del post al instante.

Dos detalles de implementación en `hooks/revalidate-post.ts`:

- `next/cache` se importa **dinámicamente** (`await import('next/cache')`) y todo va en `try/catch`,
  porque `payload.config.ts` también se carga fuera de Next: cuando corres `pnpm payload migrate` o
  `pnpm generate:types` no hay servidor ni contexto de request. Un fallo al revalidar jamás debe
  tumbar la escritura del comentario.
- El `post` del comentario puede llegar como número o como objeto ya poblado según el `depth` de la
  consulta. El helper acepta las dos formas; es un patrón que se repite en todo Payload.

## Hilos de un nivel

El botón "Responder" existía desde el diseño original, sin nada detrás. Ahora la colección tiene un
campo `parent` (una relación de `comments` consigo misma) y `getCommentThreads()` agrupa la lista
plana en `{ comment, replies }`.

La regla de "solo un nivel" **no se defiende en la UI** (ocultar el botón en las respuestas es solo
cosmética: cualquiera puede llamar a la API a mano). Se defiende en `createComment()`, que rechaza la
respuesta si el padre no es raíz, no está aprobado o no pertenece al mismo post. Regla de oro: si una
restricción importa, vive en el servidor; lo de la UI es comodidad.

El campo nuevo toca el schema de Postgres, así que hay migración
(`migrations/20260818_223048_comments_parent.ts`, con `parent_id` + FK + índice). En desarrollo el
adaptador hace `push` solo, pero **en producción hay que correr `pnpm payload migrate`** antes de dar
el deploy por bueno (ADR 0027).

## Anti-spam: honeypot y rate limit

- **Honeypot**: un campo `website` invisible para personas (fuera de pantalla, `aria-hidden`,
  `tabIndex={-1}`). Los bots rellenan todos los campos que encuentran; las personas no ven ese. Si
  llega relleno respondemos `201 {ok:true}` **sin escribir nada**: si devolviéramos un error, el bot
  aprendería a esquivarlo.
- **Rate limit**: un `Map` en memoria del proceso, 3 envíos por IP cada 10 minutos. Se reinicia con
  cada deploy y no se compartiría entre réplicas — deuda asumida a conciencia y escrita en el ADR.
  Para un blog personal con una instancia sobra; meter Redis para esto sería matar moscas a cañonazos.

## Cambios en un vistazo

| Fichero | Qué |
|---------|-----|
| `collections/Comments.ts` | campo `parent`, `create` cerrado, `authorEmail` privado, hooks de revalidación |
| `hooks/revalidate-post.ts` | *(nuevo)* `revalidatePath` de la página del post |
| `lib/data/comments.ts` | `createComment()` con validación de negocio, `getCommentThreads()`; fuera `getPendingComments()` (nadie lo usaba) |
| `app/(frontend)/api/comments/create/route.ts` | *(nuevo)* alta pública: validación + honeypot + rate limit |
| `components/comments/CommentsSection.tsx` | *(nuevo)* isla cliente con el estado de "respondiendo a" |
| `components/comments/CommentForm.tsx` | URL y campos correctos, estado de éxito, honeypot, modo respuesta |
| `components/comments/Comment.tsx` | `onReply` real, `isReply` para no anidar más de un nivel |
| `app/(frontend)/blog/[slug]/page.tsx` | usa hilos y recorta a la forma pública antes de cruzar al cliente |
| `app/globals.css` | estilos del formulario en modo respuesta, mensaje de éxito, honeypot |
| `migrations/20260818_223048_comments_parent.ts` | *(nuevo)* `parent_id` en `comments` |

## Cabos sueltos

- **Sin JS no hay formulario.** Si el navegador no ejecuta JavaScript, el `<form>` hace un submit
  nativo que no lleva a ninguna parte. Se arreglaría con una Server Action; no se ha hecho porque el
  resto del sitio asume JS igual.
- **No hay aviso de comentarios pendientes.** Hay que entrar a `/admin` → Comentarios. Decisión
  consciente: un adaptador de email es un mini-proyecto aparte.
- **`pnpm lint` está en rojo en `main`** por `migrations/20260804_202934_add_media_content_size.ts`
  (parámetros generados sin usar). No lo toqué por no mezclar temas, pero conviene arreglarlo o
  excluir `migrations/` del linter, porque son ficheros generados.
