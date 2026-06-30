# 0022 - Descripcion editorial en tags

- Estado: aceptada
- Fecha: 2026-06-28
- Decidido por: Codex + board

## Contexto
La pantalla de detalle de tag del handoff (`design/screenshots/tag.png`) muestra un hero con copy
editorial especifico para el tag. Hasta ahora `Tags` solo tenia `name` y `slug`, asi que la pagina
solo podia mostrar un texto generico o inventado desde frontend.

El proyecto ya separa datos de presentacion y mantiene `Categories.description` como copy editorial
editable. Hacer lo mismo con `Tags` mantiene el CMS como fuente de verdad.

## Opciones consideradas
- Opcion A - agregar `description` a `Tags`.
  Pros: replica el diseno con contenido real, editable desde Payload y consistente con categorias.
  Contras: requiere cambio de schema y tipos.
- Opcion B - derivar una descripcion generica en frontend.
  Pros: evita tocar el modelo.
  Contras: el copy no es editorial y no puede igualar el handoff sin hardcodear.
- Opcion C - omitir descripcion.
  Pros: minimo cambio.
  Contras: aleja la pantalla del diseno aprobado.

## Decision
Se agrega `description` opcional a `Tags`.

La pagina publica usa `tag.description` cuando existe y conserva un fallback generico solo para tags
viejos sin copy. Los tags relacionados y categorias del aside se derivan de posts publicados; no se
persisten contadores ni relaciones duplicadas.

## Consecuencias
- Mas facil: el editor puede ajustar el copy del hero por tag desde Payload.
- Mas facil: `/tags/[slug]` puede seguir el diseno de Claude Design sin hardcodes por slug.
- Mas dificil: una base que no tenga `tags.description` debe sincronizar ese cambio de schema antes
  de usar el campo. En la BD dev actual el campo ya existe, asi que no se deja migracion versionada.
- Deuda evitada: no se agregan campos de conteo ni relaciones manuales para el aside.
