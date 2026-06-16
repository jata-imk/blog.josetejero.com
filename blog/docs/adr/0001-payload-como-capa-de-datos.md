# 0001 — Payload CMS v3 como capa de datos (Prisma descartado)

- Estado: aceptada
- Fecha: 2026-06-16
- Decidido por: board (José)

## Contexto
El blog necesita un CMS con admin para crear posts, series y moderar comentarios, además de una
capa de datos sobre PostgreSQL. Se evaluó montar un ORM (Prisma) + un panel propio vs. usar un CMS
headless integrado en la app Next.

## Opciones consideradas
- **Payload CMS v3 embebido en Next** — admin en `/admin`, colecciones tipadas, auth, uploads y
  rich text Lexical de fábrica. Una sola app, un solo deploy. Contra: acoplas datos a Payload.
- **Prisma + panel custom** — máximo control del esquema. Contra: hay que construir admin, auth,
  uploads y editor desde cero. Mucho boilerplate para un blog de una persona.

## Decisión
Usar **Payload v3** como capa de datos y admin, dentro de la misma app Next. La capa de datos del
proyecto **es** la de Payload. **Prisma queda descartado.**

## Consecuencias
- Más fácil: admin, auth, uploads, editor Lexical, migraciones — todo viene incluido.
- Más difícil: el modelo de datos vive en `payload.config.ts`/colecciones; migrar fuera de Payload
  en el futuro implicaría trabajo. Aceptable para un blog personal (YAGNI).
