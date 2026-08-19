# 0032 — Comentarios públicos moderados: endpoint propio, anti-spam e hilos de un nivel

- Estado: aceptada
- Fecha: 2026-08-18
- Decidido por: José Tejero (board) + Claude

## Contexto

La sección de comentarios existía desde el rediseño de la página de post, pero **nunca funcionó**.
`CommentForm` hacía `POST /api/comments` con el cuerpo `{ postId, name, email, text }` y, al no existir
una ruta propia para esa URL, la petición caía en el catch-all del REST de Payload
(`app/(payload)/api/[...slug]/route.ts`), que espera los nombres reales de la colección: `post`,
`authorName`, `authorEmail`, `body`. Ningún campo requerido llegaba, Payload devolvía 400 y el
formulario mostraba siempre el mensaje de error. En producción no se ha creado ni un solo comentario.

Al abrir el capó aparecieron tres problemas más:

- **Sin revalidación.** La página del post se sirve con ISR (`revalidate = 3600`). Aprobar un
  comentario en `/admin` no se vería en la web hasta expirar el caché.
- **Fuga de PII.** `read` anónimo devolvía el documento completo de los comentarios aprobados,
  `authorEmail` incluido, por la API pública de Payload.
- **Sin anti-spam.** `create: () => true` dejaba el endpoint de creación abierto a cualquier bot.

Y el botón "Responder" era decorativo: no había campo `parent` en la colección ni estado en el cliente.

## Opciones consideradas

**Cómo dar de alta el comentario**
- Arreglar el `fetch` para hablar el idioma del REST de Payload — pros: cambio de tres líneas;
  contras: obliga a dejar `create` abierto a internet, sin sitio donde poner honeypot, rate limit ni
  validación propia.
- Ruta propia en `(frontend)/api` que valide y escriba con la Local API — pros: un único punto de
  entrada controlado, el `create` de la colección se puede cerrar; contras: un fichero más.

**Dónde montar la ruta**
- En `/api/comments` — contras: una ruta estática del grupo `(frontend)` ensombrece al catch-all de
  Payload, así que le robaría a `/admin` el endpoint REST de la colección.
- En `/api/comments/create` — pros: no colisiona con nada (los ids de Payload en Postgres son
  enteros, nunca `create`); contras: URL algo menos bonita.

**Anti-spam**
- Nada, solo moderación manual — contras: la cola de pendientes se llena de basura.
- Honeypot + rate limit en memoria — pros: cero dependencias, cero fricción para el visitante.
- Cloudflare Turnstile — pros: mucho más efectivo; contras: alta en Cloudflare, dos variables de
  entorno y tocar el pipeline, para un volumen de comentarios que hoy es cero.

**Hilos**
- Quitar el botón "Responder" y dejar comentarios planos — pros: cero trabajo.
- Campo `parent` con un solo nivel de anidación — pros: conversación real sin el laberinto de los
  hilos infinitos, y el CSS (`.ab-comment-replies`) ya estaba escrito para ello.

## Decisión

1. **Alta pública por ruta propia**: `POST /api/comments/create` (`app/(frontend)/api/comments/create/route.ts`)
   valida entrada, aplica honeypot y rate limit, y delega en `createComment()` de la capa de datos,
   que escribe con la Local API. El `create` de la colección pasa a `({ req }) => !!req.user`, así que
   ese es el **único** camino público.
2. **Honeypot + rate limit en memoria** (3 envíos / 10 min por IP). Si el honeypot viene relleno se
   responde `201` sin escribir nada, para no darle al bot la señal de que se le ha detectado.
   Turnstile queda descartado *por ahora*; se reabre si aparece spam real.
3. **Hilos de un nivel**: campo `parent` (self-relationship) en `comments`. `createComment()` rechaza
   responder a un comentario que no sea raíz, no esté aprobado o no pertenezca al mismo post, así que
   la profundidad máxima está garantizada en el servidor, no solo en la UI.
4. **Revalidación on-demand**: hooks `afterChange` y `afterDelete` en la colección llaman a
   `revalidatePath('/blog/<slug>')`. Aprobar un comentario se ve en la web al instante.
5. **`authorEmail` fuera de la API pública**: acceso a nivel de campo `read: ({ req }) => !!req.user`.
   Además, la página mapea los documentos a una forma pública mínima antes de pasarlos a la isla
   cliente, porque todo lo que cruza esa frontera viaja al navegador.
6. **Moderación solo desde `/admin`**, sin adaptador de email. Se elimina `getPendingComments()`, que
   nadie usaba.

## Consecuencias

- El formulario funciona: los comentarios entran como `pending` y se publican al aprobarlos, sin
  esperar a que caduque el ISR.
- Los emails de quien comenta dejan de ser públicos. Los que ya existieran en la base siguen ahí, pero
  ya no salen por la API.
- El rate limit vive en la memoria del proceso: se reinicia con cada deploy y no se comparte entre
  réplicas. Es deuda **aceptada a conciencia** — para un blog personal con una sola instancia sobra, y
  meter Redis solo para esto sería arquitectura de astronauta. Si el blog escalara a varias réplicas o
  apareciera spam distribuido, la decisión a revisar es esta (y el siguiente paso natural, Turnstile).
- La sección de comentarios pasa a ser una isla cliente (`CommentsSection`). La página del post sigue
  siendo un Server Component; solo ese árbol se hidrata.
- El campo `parent` exige migración (`20260818_223048_comments_parent`): en producción hay que correr
  `pnpm payload migrate` antes de dar el deploy por bueno (ADR 0027).
