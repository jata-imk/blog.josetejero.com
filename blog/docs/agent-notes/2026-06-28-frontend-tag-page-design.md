# 2026-06-28 - Frontend - pagina de tag

## Que cambie
- Implemente el diseno de `design/screenshots/tag.png` en `/tags/[slug]`: hero con `#`, descripcion,
  conteo, lista compacta de posts y aside con tags relacionados/categorias.
- `Tag` ahora puede renderizar enlace si recibe `slug` o `href`; si no, sigue siendo un `span`.
- `PostCard` acepta tags como string o `{ name, slug }`, asi los chips de cards pueden navegar a la
  ruta canonica `/tags/[slug]`.
- `Tags` gana `description` opcional en Payload, con tipos regenerados. No se dejo migracion
  versionada por decision del board.

## Por que
El handoff tenia una pantalla de tag mas especifica que la implementacion previa. La ruta ya existia,
pero usaba un grid generico de cards y los chips no llevaban al detalle del tag. El nuevo flujo hace
que la taxonomia fina sea navegable desde posts, cards y busqueda.

## Notas tecnicas
- Los datos del aside se derivan en `lib/data/tags.ts` desde los posts publicados del tag actual.
- `migrate:create tag-description` genero una migracion de esquema inicial completo porque no habia
  snapshots previos. Se descarto y, por preferencia del board, no se dejo migracion manual en Git.
  Si una BD existente no tiene `tags.description`, hay que aplicar ese cambio de schema por el flujo
  operativo de deploy que se decida.
- `pnpm generate:types`, `pnpm lint` y `pnpm build` pasaron.
- Playwright se verifico contra `http://localhost:3000/tags/tutorial` cuando el servidor quedo
  levantado por el board. Desktop/mobile cargan, el aside renderiza y el click en un tag relacionado
  navega a `/tags/advanced`. La unica consola fue `favicon.ico` 404.
