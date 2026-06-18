# Runbook: credenciales de prueba para QA

> Usuarios sembrados automáticamente en desarrollo (`NODE_ENV !== 'production'`) al arrancar
> `pnpm dev`. Si la DB no está lista (ej. `docker-compose up` no corriendo), el seed se salta
> sin romper el arranque. Se reintenta en el siguiente `pnpm dev`.

## Credenciales de acceso a `/admin/login`

| Rol    | Email               | Contraseña  |
|--------|---------------------|-------------|
| Admin  | `admin@test.local`  | `admin123`  |
| Editor | `editor@test.local` | `editor123` |

## Qué puede hacer cada rol

- **Admin** (`role: admin`): acceso completo. Crear/editar/borrar usuarios, posts, series,
  categorías, tags, comentarios, media. Ver el panel de admin completo.
- **Editor** (`role: editor`): crear y editar posts, series, categorías, tags, media propios.
  No puede borrar ni gestionar usuarios. Acceso restringido en el admin.

## Reseteo de contraseñas / recreación de usuarios

Si necesitas recrear los usuarios desde cero (ej. cambiaste el hash o perdiste el acceso):

1. Conéctate a la DB local y borra los usuarios de prueba:
   ```sql
   DELETE FROM users WHERE email IN ('admin@test.local', 'editor@test.local');
   ```
2. Reinicia `pnpm dev`. El seed los recrea automáticamente.
3. Si ya tenías sesión abierta, cierra sesión y vuelve a entrar con las credenciales de arriba.

## Notas para QA

- Estas credenciales son **solo para desarrollo local**. Nunca se siembran en producción
  (`NODE_ENV === 'production'`).
- El seed es idempotente: si los usuarios ya existen, no los duplica ni modifica.
- Los usuarios de prueba no tienen avatar asignado.
