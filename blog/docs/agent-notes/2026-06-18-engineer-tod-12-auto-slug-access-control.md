# 2026-06-18 — Engineer — TOD-12: Auto-slug y access control mínimo en colecciones Payload

## Qué hice

Implementé las dos familias de helpers reutilizables que manda el ADR 0005 y las apliqué a las 7 colecciones.

### 1. `lib/slug.ts` — generador de slugs

Un hook `beforeValidate` compartido que recibe el nombre del campo fuente (`title` o `name`) y genera el `slug` automáticamente **solo cuando el campo slug llega vacío**. Si el usuario ya escribió un slug a mano, no se pisa.

El algoritmo de normalización es puro JS, sin dependencias externas:

1. `normalize('NFD')` descompone caracteres acentuados (á → a + ◌́).
2. `.replace(/[\u0300-\u036f]/g, '')` elimina los combining marks (los acentos).
3. `.toLowerCase()` — minúsculas.
4. `.replace(/[^\w\s-]/g, '')` — elimina símbolos exóticos.
5. `.replace(/[\s]+/g, '-')` — espacios → guiones.
6. `.replace(/-+/g, '-')` — colapsa guiones múltiples.
7. `.replace(/^-+|-+$/g, '')` — recorta guiones iniciales/finales.

### 2. `lib/access.ts` — control de acceso por rol

Cuatro helpers pequeños que expresan intención en vez de repetir matrices de permisos:

| Helper | Qué devuelve |
|---|---|
| `isAdmin` | `true` si `req.user.role === 'admin'` |
| `isEditor` | `true` si `req.user.role === 'editor'` |
| `isAdminOrEditor` | `true` para ambos roles |
| `isAdminOrCurrentUser` | `true` para admin o para el propio usuario (usado en Users.update) |

### 3. Reglas aplicadas por colección

| Colección | Slug hook | create | update | delete |
|---|---|---|---|---|
| Posts | `autoSlug('title')` | admin/editor | admin/editor | solo admin |
| Series | `autoSlug('title')` | admin/editor | admin/editor | solo admin |
| Categories | `autoSlug('name')` | admin/editor | admin/editor | solo admin |
| Tags | `autoSlug('name')` | admin/editor | admin/editor | solo admin |
| Media | — | admin/editor | admin/editor | solo admin |
| Comments | — | público | admin/editor | solo admin |
| Users | — | solo admin | admin o uno mismo | solo admin |

`read` se deja en el default de Payload (requiere autenticación) excepto en Comments que ya tenía su regla pública condicional.

## Por qué `beforeValidate` y no `beforeChange`

`beforeValidate` corre **antes** de que Payload valide `required: true` y `unique: true`. Si usáramos `beforeChange`, el hook correría después de la validación, y un slug vacío sería rechazado por la regla `required` antes de que el hook pudiera generarlo. Con `beforeValidate`, el hook rellena el slug y la validación lo ve poblado.

## Por qué un helper que recibe el campo fuente

Categories y Tags usan `name` como campo fuente del slug, mientras que Posts y Series usan `title`. Podría haberse hecho un hook específico para cada colección, pero eso duplica lógica. La función `autoSlug(sourceField)` recibe el nombre del campo y devuelve un hook configurado — misma lógica, distinto campo fuente.

## Verificación

- `pnpm run lint` → pasa limpio
- `npx tsc --noEmit` → pasa limpio

El siguiente paso es que QA verifique el flujo con el dev server: crear posts/series/categories/tags sin slug (debe autocompletarse), editar un slug a mano (debe respetarse), y probar que un editor no puede borrar ni gestionar usuarios.
