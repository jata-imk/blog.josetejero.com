# 0015 — About estático y documentos públicos embebidos

- Estado: aceptada
- Fecha: 2026-06-25
- Decidido por: Product Architect

## Contexto
`TOD-73` pide implementar dos pantallas del handoff: `/sobre-mi` y el `404`. La parte de About
incluye bio, `AuthorCard`, grupos de `Skill`, enlaces sociales y ahora además un visor online para
el CV y posibles documentos futuros.

El repo ya tiene `AuthorCard`, `SkillChip`, `Btn`, `Header`, `Footer` y la ruta
`app/(frontend)/not-found.tsx`. No existe hoy un global de Payload para perfil personal ni un
modelo CMS para documentos públicos. El issue permite contenido estático "por ahora" y pide no
inventar escala.

La decisión técnica que sí hace falta cerrar es doble:

- de dónde sale el contenido de una página About que todavía no amerita modelado en CMS
- cómo servir el CV y futuros PDFs de forma pública y embebible sin añadir una capa nueva

## Opciones consideradas
- Opción A — crear un global de Payload para perfil y documentos.
  Pros: edición desde admin y un único origen CMS desde el día uno.
  Contras: añade schema, acceso a datos, validaciones y cableado admin para una sola pantalla con
  contenido estable; contradice YAGNI en este estado del producto.
- Opción B — dejar el contenido inline dentro de `app/(frontend)/sobre-mi/page.tsx` y mantener el
  PDF donde caiga.
  Pros: implementación muy rápida.
  Contras: mezcla contenido con composición de pantalla, dificulta reutilizar enlaces/documentos y
  no deja un contrato claro para futuros archivos públicos.
- Opción C — definir contenido tipado en código y mover documentos públicos a una ubicación estable
  bajo `public/`, usando el visor PDF nativo del navegador embebido en la página.
  Pros: mantiene YAGNI, separa contenido de composición, deja URLs estables para descarga y embed,
  y soporta futuros documentos sin introducir CMS todavía.
  Contras: editar contenido requiere cambio en repo; el visor depende del soporte PDF del navegador.

## Decisión
Se adopta la Opción C.

1. `/sobre-mi` usará contenido tipado en código, no un global de Payload en esta fase.
   La implementación puede vivir en un módulo simple del frontend (`components/about/*` y/o un
   `lib`/const local) siempre separado de la página para no hardcodear bloques largos dentro del
   JSX de composición.
2. El CV y futuros documentos públicos vivirán en una carpeta dedicada bajo `public/`, con nombres
   y rutas estables orientadas a lectura/descarga desde frontend.
   Ejemplo de convención mínima: `public/documents/cv.pdf`.
3. El bloque de CV en `/sobre-mi` debe soportar dos acciones sobre la misma URL pública:
   descarga y visualización embebida.
4. El visor será el nativo del navegador embebido en la página (`iframe`, `object` o equivalente
   HTML sin librería adicional). No se introduce librería de PDF viewer en esta fase.
5. El `404` no abre una decisión de arquitectura nueva: se rehace sobre la ruta existente
   `app/(frontend)/not-found.tsx`, reutilizando `Header`, `Footer` y `Btn`, y ajustándose al
   handoff (`.code-404`/`--grad`) sin remaquetar shells.

## Consecuencias
Se vuelve más fácil implementar `TOD-73` con una frontera clara:

- Frontend compone la pantalla About y el 404 sin esperar un schema CMS.
- El proyecto gana una convención pequeña para activos públicos descargables/embebibles.
- El mismo patrón sirve para futuros documentos públicos si siguen siendo pocos y estables.

También quedan límites explícitos:

- no se crea un global de Payload solo para evitar tocar código en una página estática
- no se añade un visor PDF de terceros mientras el visor nativo cubra embed + descarga
- si el board necesita edición frecuente desde admin, metadatos ricos de documentos o control de
  publicación, esa evolución requerirá un ADR nuevo para modelarlo en Payload
