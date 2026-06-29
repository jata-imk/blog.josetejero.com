# Pausar migraciones durante desarrollo

## Qué hice

Eliminé los archivos de migración existentes en `migrations/` y dejé `migrations/index.ts` con un
arreglo vacío.

También documenté la decisión en el ADR 0026 porque cambia cómo el proyecto trata temporalmente los
cambios de schema en desarrollo.

## Por qué

José indicó que, por ahora, no quiere llevar registro de migraciones porque el modelo cambia mucho
durante desarrollo. En este contexto, la fuente de verdad sigue siendo la configuración de Payload y
sus colecciones.

## Nota técnica

Esto no borra columnas ni modifica PostgreSQL por sí solo. Solo quita del repo el historial de
migraciones de Payload. Cuando el modelo se estabilice, convendrá reabrir la decisión y definir una
estrategia limpia para migrar bases reales sin perder datos.
