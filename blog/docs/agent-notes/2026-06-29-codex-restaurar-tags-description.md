# Restaurar `description` en Tags

## Qué hice

Restauré el campo `description` en la colección `Tags` de Payload y actualicé los fixtures del seed
para que los tags de desarrollo también lo incluyan.

También documenté el cambio en el modelo de datos y en el ADR 0025, porque agregar o restaurar un
campo de colección es un cambio de arquitectura de datos en este proyecto.

## Por qué

Payload compara el schema declarado en las colecciones contra la base de datos. Si una columna existe
en PostgreSQL pero ya no existe en el schema de Payload, Payload interpreta que el modelo deseado
eliminó esa columna y avisa que la va a borrar.

La advertencia era correcta desde el punto de vista de Payload: `tags.description` estaba en la base
de datos, pero `collections/Tags.ts` solo declaraba `name` y `slug`. Como José quiere conservar ese
campo, la fuente de verdad debe volver a declararlo en la colección.

## Concepto

En Payload, una colección funciona como el contrato principal del modelo: define el admin, los campos,
los hooks y cómo se proyecta esa entidad sobre PostgreSQL. Las migraciones y `payload-types.ts` se
derivan de ese contrato.

Por eso el fix no es tocar la base de datos a mano. El fix correcto es restaurar el campo en
`collections/Tags.ts`, regenerar tipos y dejar que Payload genere o valide la migración resultante.
