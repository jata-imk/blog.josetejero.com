# 0026 — Pausar registro de migraciones durante desarrollo activo

- Estado: aceptada
- Fecha: 2026-06-29
- Decidido por: José Tejero

## Contexto
El proyecto sigue en desarrollo activo y el modelo de datos está cambiando con frecuencia. Mantener
un historial formal de migraciones en esta etapa añade ruido y obliga a reconciliar cambios que aún
no representan un contrato estable.

## Opciones consideradas
- Mantener migraciones incrementales desde ahora — pros: historial completo; contras: mucho ruido
  durante una fase de cambios frecuentes.
- Pausar el registro de migraciones hasta estabilizar el modelo — pros: reduce fricción local y evita
  revisar migraciones temporales; contras: antes de producción habrá que reconstruir una estrategia
  de migraciones limpia.

## Decisión
Se eliminan las migraciones actuales del repo y `migrations/index.ts` queda con `migrations = []`.
Por ahora los cambios de schema se controlan desde las colecciones de Payload, no desde un historial
de migraciones versionado.

## Consecuencias
- Más fácil: el desarrollo local no arrastra migraciones temporales.
- Más difícil: antes de estabilizar o desplegar producción habrá que reabrir esta decisión y generar
  una estrategia de migraciones consistente.
- Riesgo: no se debe usar esta política para una base de datos de producción con datos valiosos.
