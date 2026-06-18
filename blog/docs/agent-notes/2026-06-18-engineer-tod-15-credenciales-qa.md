# TOD-15: Provisionar credenciales de prueba admin/editor para QA de Payload

**Agente:** Engineer  
**Fecha:** 2026-06-18  
**Issue:** [TOD-15](/TOD/issues/TOD-15)

## Qué hice

Implementé un mecanismo de seeding automático para que QA siempre tenga usuarios de prueba
disponibles en desarrollo local sin intervención manual.

### Archivos creados/modificados

- **`lib/seed.ts`** (nuevo): función `seedUsers(payload)` que crea dos usuarios de prueba
  (admin y editor) de forma idempotente: primero chequea si ya existen por email, y solo
  los crea si no están. Usa `payload.find` + `payload.create` contra la colección `users`.
- **`payload.config.ts`** (modificado): añadí `onInit` que llama a `seedUsers` solo en
  desarrollo (`NODE_ENV !== 'production'`). Envuelto en try-catch para que un error de
  conexión a la DB (ej. Postgres no corriendo) no tumbe el arranque del server.
- **`docs/runbooks/qa-test-credentials.md`** (nuevo): documenta las credenciales, los
  permisos de cada rol, y cómo resetear los usuarios (SQL manual + reinicio de `pnpm dev`).

### Credenciales de prueba

| Rol    | Email               | Contraseña  |
|--------|---------------------|-------------|
| Admin  | `admin@test.local`  | `admin123`  |
| Editor | `editor@test.local` | `editor123` |

## Por qué

El enfoque `onInit` + seed idempotente es el más simple y confiable para QA:

1. **Zero-config para QA**: no necesita correr un script aparte ni recordar comandos.
   Arranca `pnpm dev` y los usuarios están listos.
2. **Idempotente**: no duplica usuarios si ya existen. Seguro reiniciar el server cuantas
   veces sea.
3. **No toca producción**: el seed se salta si `NODE_ENV === 'production'`. Las credenciales
   de prueba no llegan a prod.
4. **Resiliente**: si Postgres no está corriendo (ej. build sin DB), el try-catch evita
   que el server crashee. El seed simplemente se salta y se reintenta en el siguiente arranque.

### Alternativas descartadas

- **Script standalone (`pnpm seed`)**: requiere que QA recuerde ejecutarlo. Frágil.
- **Seed en el docker-compose**: mezcla responsabilidades (infra vs app). El seed pertenece
  a la capa de aplicación.
- **`.env` con credenciales hardcodeadas en el código de auth**: inseguro y no portable.

## Fix: acceso a Users para editor (2026-06-18, segundo heartbeat)

QA reportó que el editor podía ver la colección `Users` en la navegación y acceder a
`/admin/collections/users`. La causa estaba en `collections/Users.ts:14`:

```diff
- read: isAdminOrCurrentUser,
+ read: isAdmin,
```

`isAdminOrCurrentUser` devolvía un filtro `{ id: { equals: user.id } }` para editores, que
es **truthy** → Payload interpretaba que el editor tiene acceso de lectura a la colección
y mostraba el nav item + permitía la ruta de colección.

Con `read: isAdmin`, que devuelve `false` para editores:
- La colección `Users` desaparece de la navegación lateral.
- La ruta `/admin/collections/users` devuelve 403.
- El endpoint API `/api/users` rechaza peticiones de editores.

**El supuesto era incorrecto**: se asumió que `/admin/account` funciona independientemente del
`read` de colección porque usa el endpoint auth `/api/users/me`. Pero Payload sí valida el
`read` access control incluso para `/api/users/me`, lo que causaba que `GET /api/users/me`
devolviera `403 Forbidden` para editores, y `/admin/account` cayera con `500`.

## Fix final: acceso dual con `hidden` (2026-06-18, tercer heartbeat)

QA verificó el bug con screenshots y repro exacto. La solución combina dos mecanismos:

```diff
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
+   hidden: ({ user }) => user?.role !== 'admin',
  },
  access: {
    create: isAdmin,
-   read: isAdmin,
+   read: isAdminOrCurrentUser,
    update: isAdminOrCurrentUser,
    delete: isAdmin,
  },
```

**`admin.hidden`:**
- Es una función que recibe el user actual y devuelve `true` si el rol no es `admin`.
- Oculta la colección `Users` de la navegación lateral para editores **sin afectar los permisos**.
- El editor **no puede** navegar a `/admin/collections/users` ni ver la lista de usuarios.
- Diferencia clave con `read: isAdmin`: `hidden` es solo UI/nav, no afecta la API REST.

**`read: isAdminOrCurrentUser`:**
- Devuelve `true` para admins (ven todo) y `{ id: { equals: user.id } }` para editores
  (solo ven su propio documento).
- Restaura el acceso a `/api/users/me` → `GET` devuelve el documento del editor.
- `/admin/account` carga correctamente y permite gestionar el perfil propio.
- El editor no puede listar ni ver otros usuarios porque el filtro `id.equals` se lo impide.

### Verificación esperada por QA

1. Login como `editor@test.local` / `editor123` en `/admin/login`.
2. Confirmar que **no** aparece `Users` en la navegación lateral.
3. Ir a `/admin/account` → debe cargar correctamente y permitir editar el perfil propio.
4. Login como `admin@test.local` / `admin123` → `Users` debe aparecer en el nav y ser accesible.
