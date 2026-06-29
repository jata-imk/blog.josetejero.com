# Tarea 13 — Modal global Cmd/Ctrl-K

> Reconstruido el 2026-06-29 desde el historial visible del asistente. No es copia exacta del
> archivo original; conserva el orden y la intencion de la tarea.

**Asignar a:** Frontend · **Depende de:** 12 · **Tipo:** integracion cliente

## Prompt para el issue
Cerrar la integracion global del modal de busqueda rapida:

- Montar una sola instancia de `CommandPalette` en el shell compartido.
- Mantener `Cmd/Ctrl-K` como atajo global.
- El boton de busqueda del header debe abrir el mismo modal.
- La barra de busqueda de `/blog` debe abrir el modal con JS y conservar fallback `GET /buscar?q=`
  sin JS.
- Los triggers visuales no deben sintetizar `KeyboardEvent`; deben usar una senal cliente explicita.
- El modal debe converger a `/buscar?q=` para "ver todos" y fallback de Enter sin seleccion.

## Done cuando
- Header, `/blog` y shortcut comparten una unica instancia del modal.
- No hay instancias duplicadas ni imports muertos.
- El fallback progresivo sigue funcionando.
- Agent-note: contrato de integracion y verificacion de accesibilidad basica.
