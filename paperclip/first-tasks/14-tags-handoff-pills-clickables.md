# Tarea 14 — Tags: pagina fiel al handoff y pills clickeables

> Reconstruido el 2026-06-29 desde el contexto del trabajo hecho en casa. No es copia de un issue
> original; registra la tarea para conservar el orden de lo implementado.

**Asignar a:** Frontend · **Depende de:** 08, 11 · **Tipo:** UI / navegacion

## Prompt para el issue
Redisenar la pagina de tags para que quede alineada al handoff y cerrar la navegacion desde los
pills:

- La pagina de tags debe replicar la composicion visual del handoff.
- Los pills/chips de tag deben ser enlaces reales y navegar al listado correspondiente.
- Mantener el uso de componentes y tokens existentes; no introducir estilos inline si ya hay
  primitivos disponibles.
- Preservar estados vacios y comportamiento responsive.
- Verificar que los tags usados en `/blog`, posts y busqueda apunten a la misma ruta canonica.

## Done cuando
- La pagina de tags coincide visualmente con el handoff en desktop y movil.
- Cada pill clickeable lleva al listado del tag correcto.
- No se rompe la navegacion existente desde post cards, `/blog` o `/buscar`.
- Agent-note: que se redisenó, que enlaces se habilitaron y que rutas se validaron.
