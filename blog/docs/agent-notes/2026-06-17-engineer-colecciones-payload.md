# 2026-06-17 — Engineer — colecciones de Payload

## Qué hice

Implementé las 7 colecciones del modelo de datos en `blog/collections/` y las registré en
`payload.config.ts`. Cada colección es un fichero independiente con su config de Payload v3.

## Estructura de las colecciones

```
blog/collections/
├── Users.ts       — extiende la auth collection built-in con name, role, avatar
├── Posts.ts       — entidad central con richText Lexical, series, categorías, tags
├── Series.ts      — agrupa posts en recorrido ordenado
├── Categories.ts  — taxonomía amplia
├── Tags.ts        — taxonomía fina
├── Comments.ts    — con access control (crear público, leer solo approved)
└── Media.ts       — uploads nativos con imageSizes y soporte SVG
```

### Por qué la posición en serie se deriva (no se guarda)

El modelo de datos dice que **el post no almacena su posición "N de M"**. Esto es un principio
de single source of truth: si guardáramos `position: 3` en el post y luego insertáramos uno
nuevo entre el 2 y el 3, tendríamos que actualizar todos los posts siguientes.

En su lugar, cada post tiene un `seriesOrder` (número arbitrario, no necesariamente consecutivo)
y la verdadera posición "N de M" se deriva al hacer la query:

```ts
// Pseudocódigo del frontend
const postsInSeries = await payload.find({
  collection: 'posts',
  where: { series: { equals: seriesId } },
  sort: 'seriesOrder',
})
// El post en posición i es el "i+1 de postsInSeries.totalDocs"
```

La numeración visible ("Parte 3 de 7") la pinta el frontend, nunca se persiste.

### Access control de Comments

Comments tiene la lógica de acceso más delicada:

- **create: público** — cualquiera puede enviar un comentario (entra como `pending`)
- **read: condicional** — público solo ve `approved`; el admin ve todos
- **update/delete: solo admin** — el público no puede editar ni borrar

El campo `status` tiene field-level access para que solo usuarios autenticados puedan
cambiarlo. Esto evita que un atacante envíe `status: "approved"` desde fuera.

### Posts: el campo author por defecto

El campo `author` en Posts usa `defaultValue: ({ user }) => user?.id`. Cuando un admin
crea un post desde el panel, se asigna automáticamente como autor. Esto es solo un
default; el admin puede cambiarlo si necesita atribuir un post a otro autor.

## Decisiones

1. **Grupos del admin**: "Contenido" para Posts, Series, Categories, Tags, Comments;
   "Admin" para Users y Media. Mantiene el panel ordenado.

2. **Media con imageSizes**: thumbnail (400×300), card (768×1024), hero (1920×1080).
   Suficiente para el diseño actual sin ser excesivo.

3. **Sin hooks de slug automático (por ahora)**: el modelo de datos dice `slug` como
   campo requerido. No agregué un `beforeChange` que auto-genere el slug desde el título
   porque eso es una decisión de UX que puede variar. Si se necesita, es trivial añadirlo
   como hook.

4. **Labels en español**: el admin es para José, que es hispanohablante.

## Verificación

- `pnpm generate:types` → `payload-types.ts` incluye las 7 colecciones
- `npx next build` → build exitoso con Turbopack + TypeScript
