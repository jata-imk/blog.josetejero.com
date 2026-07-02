# 0027 — Migraciones y seed de catálogos para producción

- Estado: aceptada
- Fecha: 2026-07-02
- Decidido por: José Tejero

## Contexto
El blog va a publicarse en producción (`josetejero.com`). El ADR [0026](./0026-migraciones-en-desarrollo.md)
pausó el registro de migraciones durante el desarrollo activo (`migrations/index.ts` con
`migrations = []`) y dejó el schema bajo el `push` implícito del adaptador Postgres. Ese ADR
advertía explícitamente que **habría que reabrir la decisión antes de desplegar producción**, porque
en producción `push` está desactivado por defecto: sin migraciones, la BD de prod no tendría tablas.

Además, el único seed existente (`lib/seed.ts`) es **solo de desarrollo**: se dispara vía `onInit`
únicamente cuando `NODE_ENV !== 'production'` y siembra usuarios de prueba (credenciales en texto
plano) y posts falsos de QA. No sirve para poblar los catálogos reales en producción.

Faltaba también definir cómo se crea el primer usuario administrador en producción sin hardcodear
credenciales.

## Opciones consideradas

**Migraciones**
- Seguir con `push` en producción — pros: cero migraciones que mantener; contras: `push` no está
  pensado para prod, puede aplicar cambios destructivos sin control y no deja historial auditable.
- Reactivar migraciones con una migración inicial generada del schema actual — pros: despliegue
  reproducible y controlado, historial versionado; contras: hay que mantener migraciones desde ahora.

**Seed de catálogos**
- Meter los catálogos en el `up()` de la migración inicial — pros: se aplican solos al migrar;
  contras: mezcla schema con datos y ensucia el historial de migraciones.
- Script `pnpm` dedicado, idempotente, separado del seed de dev — pros: datos y schema desacoplados,
  re-ejecutable; contras: un paso manual extra en el deploy.

**Primer admin**
- Sembrarlo en un seed — contras: obliga a manejar email/password por entorno o hardcodearlos.
- Usar el flujo *first-user* nativo de Payload — pros: sin credenciales en código; el primer registro
  en `/admin` crea el admin.

## Decisión
1. **Reactivar migraciones para producción.** Se genera una migración inicial del schema actual con
   `pnpm payload migrate:create initial_schema` y en producción el deploy corre `pnpm payload migrate`.
   En desarrollo local se mantiene el `push` (las migraciones no afectan a dev), así que el flujo de
   trabajo local no cambia. Como la imagen de la app es `standalone` (no incluye el CLI de Payload),
   `migrate` y `seed:catalog` **se ejecutan desde el repo clonado en el host del VPS** (con Node+pnpm y
   `pnpm install`), usando una `DATABASE_URL` que apunta a la BD publicada en `localhost:5432` —no al
   nombre de servicio Docker `postgres`, que solo resuelve dentro de la red del contenedor.
2. **Seed de catálogos como script `pnpm` dedicado.** Nuevo `lib/seed-catalog.ts` (`seedCatalog`)
   siembra **solo** categorías, tags y series reales, idempotente por `slug`. Se ejecuta a mano con
   `pnpm seed:catalog` (`payload run scripts/seed-catalog.ts`). El seed de dev (`lib/seed.ts`) queda
   intacto y sigue corriendo solo fuera de producción.
3. **Primer admin vía first-user de Payload.** No se siembran usuarios en producción; el primer acceso
   a `/admin` crea el administrador.

Los catálogos iniciales se derivaron del contenido real: el blog anterior (`aleliz.xyz/blog/`) y las
entradas pendientes en Notion. Resumen: 6 categorías, 26 tags y 3 series (dos de OpenClaw —operativa y
"Routing y Multiagentes"— y "Git, Merge & Deploy").

## Secuencia de deploy
1. `pnpm payload migrate` → crea el schema en la BD de prod (vacía).
2. Entrar a `/admin` → crear el primer usuario admin (first-user).
3. `pnpm seed:catalog` → siembra catálogos.
4. Importar/redactar posts y asociarlos a los catálogos.

## Consecuencias
- Más fácil: despliegue reproducible y auditable; catálogos poblados de forma repetible sin duplicar.
- Más difícil: a partir de ahora cada cambio de schema destinado a producción requiere generar y
  revisar su migración (fin de la pausa del ADR 0026 para el camino de producción).
- Este ADR **reemplaza parcialmente** al 0026: la política de "sin migraciones" se mantiene solo para
  el desarrollo local; producción usa migraciones.
