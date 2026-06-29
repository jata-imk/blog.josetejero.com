# Tarea 10 — Datos para destacado, series y busqueda

> Reconstruido el 2026-06-29 desde el historial visible del asistente. No es copia exacta del
> archivo original; conserva el orden y la intencion de la tarea.

**Asignar a:** Engineer · **Depende de:** 06, 08 · **Tipo:** datos / seed

## Prompt para el issue
Auditar y corregir los datos de desarrollo para que las pantallas de `/blog` y `/buscar` puedan
validarse con casos reales:

- El seed debe incluir suficiente variedad de posts, categorias y tags.
- Debe existir al menos una serie con posts ordenados.
- Debe existir contenido que permita ver resultados de busqueda en posts, series, tags y categorias.
- Verificar que la busqueda funcione de forma consistente con mayusculas/minusculas en Postgres.
- Evitar cambios de schema innecesarios; si hace falta una decision nueva, documentarla.

## Done cuando
- El seed deja visible el comportamiento de destacado, series, tags populares y busqueda.
- Los datos sembrados tienen fechas publicadas utiles para probar ordenamiento.
- `pnpm lint` o el check equivalente pasa.
- Agent-note: que estaba mal en los datos y que se corrigio.
