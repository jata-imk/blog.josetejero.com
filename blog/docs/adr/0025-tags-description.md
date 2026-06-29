# 0025 — Restaurar descripción en tags

- Estado: aceptada
- Fecha: 2026-06-29
- Decidido por: Codex + José Tejero

## Contexto
La base de datos de desarrollo conserva la columna `tags.description`, pero la copia local del
schema de Payload ya no declaraba ese campo en `collections/Tags.ts`. Al iniciar Next/Payload,
Payload avisaba que estaba a punto de borrar esa columna.

El proyecto usa Payload como fuente de verdad de datos. Si se quiere conservar una columna, debe
existir en la colección correspondiente, en los tipos generados y en la documentación del modelo.

## Opciones consideradas
- Eliminar la columna de la base de datos — pros: mantiene el modelo previo mínimo; contras: pierde
  contenido existente y contradice la intención explícita de conservar el campo.
- Restaurar `description` en `Tags` — pros: alinea Payload con la base de datos real y evita el
  borrado; contras: añade un campo editorial opcional al modelo de tags.

## Decisión
Se restaura `description` como `textarea` opcional en la colección `Tags`, usando el mismo patrón
que `Categories.description` y `Series.description`.

## Consecuencias
- Más fácil: Payload deja de proponer borrar `tags.description`.
- Más fácil: los tags pueden tener copy editorial breve si una pantalla pública lo necesita.
- Deuda asumida: ninguna pantalla está obligada a renderizar `Tag.description` en esta tarea.
