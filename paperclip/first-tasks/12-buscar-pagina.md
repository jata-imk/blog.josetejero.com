# Tarea 12 — Pagina de busqueda

> Reconstruido el 2026-06-29 desde el historial visible del asistente. No es copia exacta del
> archivo original; conserva el orden y la intencion de la tarea.

**Asignar a:** Frontend · **Depende de:** 10, 11 · **Tipo:** busqueda SSR

## Prompt para el issue
Validar y corregir `/buscar` como superficie SSR de busqueda global:

- Leer `?q=` y `?scope=` desde la URL.
- Renderizar resultados agrupados para posts, series, tags y categorias.
- Mantener tabs de alcance con conteos correctos.
- Preservar la query al cambiar de tab.
- Preservar el scope activo al reenviar la busqueda desde `SearchPageBar`.
- Usar scopes canonicos compartidos por UI/API/datos.

## Done cuando
- `/buscar?q=...` es shareable y renderiza sin depender de JS cliente.
- Los tabs usan valores canonicos y no labels localizados como contrato.
- Estados de query vacia y sin resultados estan cubiertos.
- Agent-note: contrato final de busqueda y casos QA probados.
