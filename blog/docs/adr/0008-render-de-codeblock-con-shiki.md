# 0008 — Render de `CodeBlock` con Shiki en servidor y copia en cliente

- Estado: aceptada
- Fecha: 2026-06-19
- Decidido por: Product Architect

## Contexto
El proyecto ya cerro tres decisiones relevantes:

- el cuerpo de los posts se almacena como rich text Lexical
- el codigo usa el nodo built-in de Lexical, no un bloque custom
- el resaltado, el tema oscuro y el boton copiar pertenecen a la capa de render, no al dato

En `TOD-31` ya existe el chrome visual de `CodeBlock` (`.ab-code-*`) y un boton de copiar funcional,
pero el componente actual es un Client Component completo y todavia no integra Shiki. Eso mezcla
dos responsabilidades distintas:

- el resaltado sintactico, que encaja mejor como trabajo de servidor
- la interaccion del boton copiar, que si necesita navegador

Ademas, el proyecto tiene como regla minimizar `'use client'`, reutilizar los tokens de
`app/globals.css`, y no almacenar presentacion derivable dentro del contenido.

## Opciones consideradas
- Resaltar en cliente dentro de un solo `CodeBlock` interactivo.
  Pro: menos piezas al principio.
  Contra: envia JS de resaltado al navegador, mezcla render con interactividad, y se aleja de la
  regla "Server Component por defecto".
- Resaltar en servidor y dejar un subcomponente cliente solo para copiar.
  Pro: reduce JS, mantiene el resaltado cerca del render de Lexical, separa responsabilidades y
  conserva el contenido como dato puro.
  Contra: obliga a partir el componente y definir un contrato claro entre el HTML resaltado y el
  boton copiar.

## Decisión
`CodeBlock` se implementa como una composicion de dos piezas:

1. Una pieza de servidor responsable de transformar `code + lang` en HTML resaltado con Shiki.
2. Una pieza minima de cliente responsable unicamente del boton copiar y sus estados `idle` /
   `copiado`.

Contrato arquitectonico:

- La fuente de verdad del snippet es el string plano `code`.
- Ese mismo `code` alimenta tanto el resaltado de Shiki como el portapapeles.
- El chrome existente `.ab-code`, `.ab-code-bar`, `.ab-code-lang` y `.ab-code-copy` se reutiliza;
  no se rediseña el componente.
- Los tokens `--code-*` siguen siendo la fuente de verdad para superficie, borde y tipografia mono
  del bloque.
- La paleta de sintaxis la resuelve Shiki en render. No se crea un sistema propio de colores de
  sintaxis en tokens mientras no exista una necesidad real.
- Si el lenguaje no existe o Shiki falla, el render cae de forma segura a codigo plano sin romper la
  pagina.

## Consecuencias
- Mas facil: mantener el blog ligero en el navegador y coherente con App Router.
- Mas facil: aislar el trabajo tecnico en `lib/lexical` o helpers server-only sin contaminar los
  componentes de UI con acceso a librerias de resaltado.
- Mas facil: explicar didacticamente la diferencia entre Server y Client Components en una pieza
  real del producto.
- Mas dificil: hay que cuidar el contrato de marcado HTML que recibe el shell visual y verificar que
  la salida siga siendo correcta en movil.
- Deuda asumida: por ahora solo se cubre tema oscuro y snippet simple. Numeracion de lineas,
  resaltado por linea o temas alternos quedan fuera por YAGNI.
