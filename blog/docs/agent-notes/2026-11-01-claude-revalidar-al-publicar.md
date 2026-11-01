# Revalidar el caché al publicar un post

Fecha local: 2026-11-01.

## Qué pasó

José publicó «Generar música con OpenClaw» y la URL respondía 404. El post estaba bien
(`status: published`); el 404 venía del caché ISR: la URL se había visitado mientras el post era
borrador, Next guardó ese 404 y lo siguió sirviendo (`x-nextjs-cache: HIT`,
`s-maxage=3600`). Publicar no invalidaba nada: solo los comentarios tenían un hook de
revalidación. El inicio, los listados, el sitemap y el RSS también tardaban hasta una hora en
mostrar un post nuevo.

## Qué se hizo

`hooks/revalidate-post.ts` suma `revalidatePublishedPost`, enganchado en `afterChange` y
`afterDelete` de `Posts`. Si el post está publicado, lo estaba antes, o se borra uno publicado,
llama a `revalidatePath('/', 'layout')` y `revalidatePath('/rss.xml')`: lo mismo que hace el
warm-up del pipeline (ADR 0033). Los cambios en borradores no tocan nada.

## Conceptos

- **ISR (Incremental Static Regeneration).** Las páginas públicas se generan una vez y se
  guardan; Next las vuelve a generar cuando expira `revalidate` (3600 s) o cuando alguien llama a
  `revalidatePath`. Un 404 también se guarda: no es un error, es una página más.
- **Por qué todo el árbol y no solo `/blog/<slug>`.** Un post aparece en el inicio, `/blog`, su
  serie, sus categorías y tags, el sitemap y el RSS. Calcular cada ruta afectada es frágil; invalidar
  el layout raíz es simple, y en un blog pequeño regenerar en la siguiente visita es barato.
- **Por qué funciona desde el admin.** El admin y el REST de Payload son rutas de la misma app de
  Next, así que el hook corre dentro de un request de Next y `revalidatePath` tiene contexto. Desde
  la CLI (`payload run`) no lo tiene: el `try/catch` registra un aviso y la escritura sigue.

## Cómo se comprobó

`tsc --noEmit` y `eslint` limpios. El patrón es el mismo del hook de comentarios, que ya funciona
en producción. La comprobación real es publicar o editar un post publicado y ver que la URL deja
de servir la versión cacheada (`x-nextjs-cache` pasa a `MISS`/`STALE` en la primera visita).
