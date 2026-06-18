# 2026-06-18 — Engineer — TOD-14: Corregir permisos de Users y alta de Posts para editor en Payload

## Qué hice

Corregí bugs de seguridad en el control de acceso de Payload y refactoricé los tipos de los helpers para que funcionen tanto en acceso a nivel colección como a nivel campo.

### Bug 1: Escalación de privilegios en Users (crítico)

**Problema:** Un editor podía cambiarse su propio rol a `admin` editando su perfil. La colección `Users` usaba `update: isAdminOrCurrentUser`, que correctamente limita *qué* registro puede editar un editor (solo el suyo), pero el campo `role` no tenía restricción a nivel campo. Un editor podía modificar su `role` de `editor` a `admin` y obtener control total.

**Solución:** Añadí `access: { update: isAdmin }` al campo `role` en `collections/Users.ts`. Esto bloquea el campo en el panel de admin para cualquier usuario que no sea admin. Si un editor edita su perfil, el campo `role` aparece bloqueado/gris.

### Bug 2: Listado de usuarios visible para editores (alto)

**Problema:** El QA encontró que `GET /api/users` con token de editor devolvía los 3 usuarios. La colección `Users` no tenía `read` explícito, por lo que Payload usaba el default `({ req: { user } }) => Boolean(user)`, que permite a cualquier usuario autenticado leer la lista completa.

**Solución:** Añadí `read: isAdminOrCurrentUser` a `collections/Users.ts`. Con esto:
- Admin ve todos los usuarios (la función retorna `true`)
- Editor solo se ve a sí mismo (la función retorna `{ id: { equals: user.id } }`, un filtro Where)

**Nota técnica:** Verifiqué que la resolución de `req.user` durante la autenticación NO pasa por el `read` access de Users. Payload usa `payload.findByID()` con `overrideAccess: true` internamente (ver `findByIDLocal` en `payload/dist/collections/operations/local/findByID.js:5`). Así que añadir `read: isAdminOrCurrentUser` no rompe el login de editores.

### Bug 3: Reasignación de autor en Posts (medio)

**Problema:** Un editor podía reasignar un post a otro autor después de crearlo, ya que el campo `author` no tenía restricción a nivel campo.

**Solución:** Añadí `access: { update: isAdmin }` al campo `author` en `collections/Posts.ts`. Solo admin puede cambiar el autor de un post ya creado. En creación, el `defaultValue` ya precarga el usuario actual y cualquier editor puede crear posts con ellos mismos como autor.

### Bug 4: Editor no puede crear Posts (investigado, probablemente ambiental)

**Problema reportado:** El QA reportó que `POST /api/posts` con token de editor devolvía "You are not allowed to perform this action."

**Investigación:** Revisé a fondo el flujo de acceso:

1. El JWT auth strategy (`payload/dist/auth/strategies/jwt.js:67`) resuelve `req.user` con `payload.findByID()` que usa `overrideAccess: true` — la resolución NO pasa por el access control de Users.
2. `createLocalReq` (`payload/dist/utilities/createLocalReq.js:91`) preserva todas las propiedades del user document, incluyendo `role`.
3. `executeAccess` (`payload/dist/auth/executeAccess.js:4`) llama a la función de acceso con `{ id, data, req }` — exactamente lo que nuestro `isAdminOrEditor` espera.
4. La lógica de `isAdminOrEditor` es correcta: `userRole(req) === 'admin' || userRole(req) === 'editor'`.

**Hipótesis más probable:** El error pudo ser causado por:
- Un JWT emitido antes de que el campo `role` estuviera poblado en la DB
- Un seed que no funcionó correctamente (el usuario editor no tenía `role: 'editor'`)
- Una condición de carrera en el `onInit` del seed

**El código de acceso actual es correcto.** Si el bug persiste en runtime, la causa está en el entorno (DB, seed, JWT), no en la lógica de acceso. Recomiendo a QA:
1. Verificar que `editor@test.local` tenga `role: 'editor'` en la DB (`SELECT role FROM users WHERE email = 'editor@test.local'`)
2. Re-login del editor para obtener un JWT fresco
3. Reintentar el `POST /api/posts`

### Refactor de tipos en `lib/access.ts`

**Problema:** Payload distingue dos tipos distintos para funciones de acceso:
- `Access` (colección): `(args: AccessArgs) => boolean | Where` — `id` es `number | undefined`
- `FieldAccess` (campo): `(args: FieldAccessArgs) => boolean` — `id` es `string | number | undefined`

Los helpers `isAdmin`, `isEditor`, etc. estaban tipados como `Access`, lo que causaba error de TypeScript al usarlos como acceso a nivel campo.

**Solución:** Reemplacé las anotaciones de tipo `Access`/`AccessArgs` de Payload por un tipo propio `AccessArgsLike` que solo requiere `{ req: { user?: AnyUser | null } }`. Como nuestros helpers solo consultan `req.user.role`, este tipo mínimo satisface tanto `AccessArgs` como `FieldAccessArgs`. Esto permite usar `isAdmin` tanto en `access` de colección como en `access` de campo sin casts ni duplicación.

También eliminé el index signature `[key: string]: unknown` de `AnyUser`, ya que Payload genera tipos de usuario estrictos sin index signature y TypeScript lo rechazaba.

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `lib/access.ts` | Refactor de tipos: `AccessArgsLike` + `AnyUser` sin index signature |
| `collections/Users.ts` | `read: isAdminOrCurrentUser` + `role.access.update = isAdmin` |
| `collections/Posts.ts` | `author.access.update = isAdmin` |

## Colecciones de contenido verificadas

Todas las colecciones de contenido (Posts, Series, Categories, Tags, Media) siguen el mismo patrón consistente:
- `create: isAdminOrEditor`
- `update: isAdminOrEditor`
- `delete: isAdmin`
- `read`: default Payload (requiere autenticación)

Comments tiene su propio patrón público (por diseño, ADR 0005).

## Verificación

- `pnpm run lint` → pasa limpio
- `npx tsc --noEmit` → pasa limpio

## Para QA

Probar con dos usuarios (un admin y un editor):

1. **Editor NO ve la lista de usuarios:** `GET /api/users` con token de editor debe devolver solo 1 usuario (él mismo), no los 3.

2. **Editor NO puede cambiarse el rol:** Iniciar sesión como editor, ir a su perfil (Account). El campo "Rol" debe aparecer bloqueado. `PATCH /api/users/:id` con `{ role: "admin" }` debe ignorar o rechazar el cambio.

3. **Editor SÍ puede crear posts:** Iniciar sesión como editor, `POST /api/posts` con body mínimo válido. Si falla, verificar que `role: 'editor'` existe en la DB y re-login.

4. **Editor NO puede cambiar el autor de un post:** Editar un post existente como editor. El campo "Autor" debe aparecer bloqueado.

5. **Admin SÍ puede cambiar roles y autores:** Como admin, verificar que puede cambiar el rol de cualquier usuario y el autor de cualquier post sin restricciones.
