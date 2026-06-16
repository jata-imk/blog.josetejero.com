# Tarea 02 — Colecciones de Payload

**Asignar a:** Engineer · **Depende de:** 01 · **Tipo:** boilerplate + modelo

## Prompt para el issue
> Implementa las colecciones de Payload según `blog/docs/architecture/data-model.md`: **Users,
> Posts, Series, Categories, Tags, Comments, Media**.
>
> Reglas clave:
> - El cuerpo de Posts es **richText Lexical**. Aún no agregues el bloque Callout (va en tarea 03);
>   deja el editor con nodos built-in (incluido código).
> - **El Post NO almacena su posición en la serie.** Usa `series` (rel) + `seriesOrder` (número). La
>   posición "N de M" se deriva al renderizar.
> - Comments: `status` (pending/approved/spam/rejected). Acceso: crear = público (entra `pending`),
>   leer = solo `approved`. Configura el access control de Payload acorde.
> - Media: uploads nativos (imágenes y SVG). SVG se servirá como `<img>`.
> - Escribe un ADR si tomas alguna decisión no trivial de esquema/relaciones.

## Done cuando
- Las 7 colecciones existen y el admin permite crear un Post con serie, categorías y tags.
- El access control de Comments funciona (un comentario nuevo entra como `pending` y no es público).
- agent-note explicando el modelo y por qué la posición en serie se deriva (no se guarda).
- QA verifica build + creación de un post de prueba.
