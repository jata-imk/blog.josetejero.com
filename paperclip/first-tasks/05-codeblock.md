# Tarea 05 — `<CodeBlock>` (Shiki + tema oscuro + botón copiar)

**Asignar a:** Frontend · **Depende de:** 02, 03 (tokens) · **Tipo:** render (no dato)

## Prompt para el issue
> Implementa `<CodeBlock>` para renderizar los nodos de código built-in de Lexical.
> - Resaltado con **Shiki**, tema oscuro, y **botón de copiar** (estados idle / copiado).
> - **Esto es RENDER, no dato:** el resaltado/tema/botón NO se almacenan; se aplican al renderizar.
> - Usa design tokens para color de fondo, bordes y tipografía mono. Cero hardcodeo.
> - Pieza didáctica: en la agent-note **explica Server vs Client Component** aquí (Shiki suele
>   resaltar en server; el botón copiar necesita interactividad de cliente). José aprende de esa nota.

## Done cuando
- Un bloque de código en un post se resalta con Shiki en tema oscuro y se puede copiar.
- agent-note clara sobre Server vs Client Component y por qué se dividió así.
- QA: gate visual (desktop + móvil) + el botón copiar funciona.
