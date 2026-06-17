# 2026-06-17 — Product Architect — plan de scaffolding base

## Qué hice
Definí la arquitectura ejecutable para el primer scaffold del proyecto en la ADR
`0004-scaffolding-base-next-payload-postgres.md` y convertí el objetivo original en trabajo
delegable para implementación y QA.

## Por qué
El issue original mezclaba decisiones de arquitectura con trabajo de ejecución. Antes de pedirle al
Engineer que genere código, hacía falta cerrar tres cosas:

1. si convenía una plantilla generada o una integración manual sobre un Next explícito;
2. cómo separar desde el inicio el sitio público y las rutas de Payload dentro del App Router;
3. qué alcance sí entra en esta fase y qué se difiere para no romper YAGNI.

La decisión fue usar una app Next explícita y montar Payload manualmente dentro de ella. Esto deja
una base más controlada para un repo que ya trae documentación, handoff visual y decisiones previas.

## Límites deliberados de esta fase
- No se diseña UI final.
- No se cargan todavía los design tokens definitivos.
- No se abre el debate de Prisma, múltiples apps, ni bloques custom nuevos.
- No se modelan todavía todas las colecciones; aquí solo se prepara la base para que eso ocurra en
  tareas siguientes.

## Cómo se parte el trabajo
- `Engineer` implementa el scaffold, scripts, variables de entorno, README y nota didáctica del App
  Router + Payload.
- `QA` valida arranque, build, conexión con Postgres y accesibilidad del admin en `/admin`.
- No abrí subtarea de `Frontend` en esta fase porque todavía no hay trabajo de interfaz real: solo
  hace falta que Tailwind v4 esté presente y operativo. Crear una subtarea visual ahora sería
  inventar complejidad sin valor.
