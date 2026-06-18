# Tarea 02b — Cierre de colecciones (auto-slug + access por role + ADR)

**Asignar a:** Engineer (código) · Architect/Engineer (ADR) · **Depende de:** 02 · **Tipo:** modelo + docs

> Las 7 colecciones ya existen y calzan con `blog/docs/architecture/data-model.md`. Esta tarea
> cierra tres pendientes que quedaron deliberadamente fuera de la 02. Mantén YAGNI/DRY: nada de
> permisos ni utilidades que nadie pidió.

## Prompt para el issue
> Completa las colecciones de Payload con tres mejoras. No rompas el modelo existente
> (la posición en serie se sigue derivando de `seriesOrder`, jamás se persiste).
>
> **1. Auto-slug (hook `beforeValidate`).**
> Añade un hook que genere `slug` a partir del título/nombre **solo cuando venga vacío** en
> `Posts`, `Series`, `Categories` y `Tags`. Slugify simple: minúsculas, espacios → guiones, sin
> acentos ni símbolos. **No regenerar** si el slug ya tiene valor (el admin puede editarlo a
> mano y debe respetarse). Extrae la lógica a un helper reutilizable (DRY), no la copies en cada
> colección.
>
> **2. Access control por `role`.**
> Hoy `role` (admin/editor) no se usa. Hazlo significar algo con un helper de acceso
> (p. ej. `blog/access/isAdmin.ts`, `isAdminOrSelf.ts`):
> - **Editor:** crea/edita contenido (Posts, Series, Categories, Tags, Media, modera Comments).
> - **Admin:** además gestiona `Users` y los borrados.
> - No toques el access **público** de Comments ya existente (crear = público → `pending`,
>   leer público = solo `approved`). Solo añade las reglas por role donde falten.
> - Mantenlo mínimo; un par de helpers, no un sistema de permisos.
>
> **3. ADR 0005 — modelo de datos.**
> Escribe `blog/docs/adr/0005-modelo-de-datos.md` siguiendo `blog/docs/adr/template.md`.
> Documenta las decisiones no triviales: derivar la posición en serie (no almacenar), el access
> control de Comments, el access por role recién añadido, y el auto-slug. Es la regla de
> `data-model.md` ("cada cambio no trivial → ADR") y material de estudio para el board.
>
> Respeta `blog/AGENTS.md`. No agregues librerías de slug externas si un helper de ~10 líneas
> basta.

## Orden importante
- El **board (José) crea su usuario admin ANTES** de que se endurezca el access por role
  (`/admin/create-first-user`, marcando `role: admin`). Así el bootstrap del primer usuario no
  queda bloqueado por las nuevas reglas. Confírmalo antes de mergear el punto 2.

## Done cuando
- En `/admin`, crear un Post **sin escribir slug** lo autogenera desde el título; editarlo a
  mano se respeta (no se regenera).
- Un usuario `editor` puede gestionar contenido pero no `Users`; solo `admin` borra/gestiona usuarios.
- El access **público** de Comments sigue intacto (sin sesión no se ven `pending`).
- `pnpm lint` y `pnpm build` verdes.
- `blog/docs/adr/0005-modelo-de-datos.md` escrito.
- **agent-note** en `blog/docs/agent-notes/` explicando el ciclo de hooks de Payload
  (`beforeValidate` vs `beforeChange`) y dónde vive cada helper de acceso (pieza didáctica).
- QA verifica build/lint y el flujo, **consumiendo** el dev server que ya dejó corriendo el
  board (no lo levanta QA).
