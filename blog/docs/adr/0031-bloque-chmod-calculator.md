# 0031 — Segundo bloque custom de Lexical: `chmodCalculator`

- Estado: aceptada
- Fecha: 2026-08-04
- Decidido por: board (José) + Claude Code

## Contexto

Al preparar la entrada "Permisos en Linux: de rwx a 777 sin morir en el intento" surgió la idea de
convertir la tabla octal 0–7 en una calculadora de `chmod` interactiva embebida en el post: una
rejilla `u/g/o × rwx` que actualiza en vivo el octal, la cadena simbólica (`-rwxr-xr-x`) y el
comando `chmod`.

ADR 0003 fija `Callout` como único bloque custom de Lexical y exige un ADR nuevo para cualquier
bloque adicional. Este documento cumple esa condición para `chmodCalculator`.

En la discusión inicial se barajó una solución más genérica: un bloque `widget` con un campo
`select` (nombre del componente) + un campo `json` (props libres), resuelto en el renderer contra un
`REGISTRY` cargado con `next/dynamic()`. Se descarta explícitamente por tres razones:

1. **YAGNI.** Solo hay un widget hoy. La indirección `select → REGISTRY → props` es complejidad que
   paga el segundo o tercer widget, no el primero (`AGENTS.md`: "nada de arquitectura de
   astronauta").
2. **Contrato sin tipar.** Un campo `json` se pinta en el admin como textarea de texto libre, sin
   validación ni forma fija, y esas props se esparcen sin comprobar (`{...config}`). Rompe el
   contrato editor↔renderer tipado que exige ADR 0010 para `Callout`.
3. **`next/dynamic()` es redundante en este punto del árbol.** `lib/lexical/converters.tsx` es un
   módulo de servidor (se ejecuta dentro del RSC que renderiza `post.body`). Un Client Component
   importado ahí ya se code-splitea vía el Flight manifest de React: el navegador solo descarga el
   chunk del bloque en los posts donde el servidor efectivamente lo renderizó. `dynamic()` no cambia
   ese comportamiento — y su opción `ssr: false`, pensada para evitarlo, ni siquiera es válida dentro
   de un Server Component. Es wrapper sin efecto.

Tampoco se considera meter el widget como HTML/JS crudo en el contenido (`<script>` /
`dangerouslySetInnerHTML`): rompe la hidratación de React (el nodo vive fuera del árbol que React
gestiona), abre una superficie de XSS si el blog gana más de un autor, y viola el principio ya fijado
en ADR 0002 de que datos y presentación están separados — el bloque guarda datos, el renderer decide
presentación.

Una segunda pasada, antes de publicar, corrigió un punto de UX: mostrar solo `r`/`w`/`x` sin glosa no
enseña nada a quien no sabe qué significan. Ahí surgió que el objetivo — fichero o carpeta — no es
un detalle cosmético: los mismos tres bits significan cosas distintas (`x` en carpeta es "entrar",
no "ejecutar"; `w` en carpeta permite borrar contenido ajeno; `setuid` no hace nada en una carpeta;
`sticky` no hace nada en un fichero). Es exactamente el contenido de dos secciones del post. Por eso
el objetivo se modela como **estado de lector** (toggle Fichero/Carpeta en el componente) con un
**valor inicial de autor** (campo `initialTarget`), no como uno u otro en exclusiva: el autor decide
en qué sección del post insertar la calculadora ya en el modo que toca, y el lector puede seguir
alternando para ver el contraste en vivo — ese contraste *es* la lección.

## Opciones consideradas

- **Bloque `widget` genérico + registro dinámico** — más flexible a futuro, contrato sin tipar hoy,
  complejidad que ningún caso de uso actual necesita.
- **Bloque dedicado `chmodCalculator`**, con el mismo patrón que `Callout`: campos tipados en
  Payload, converter dedicado en `lib/lexical/converters.tsx`, componente presentacional en
  `components/blocks/`.

## Decisión

Segundo bloque custom: **`chmodCalculator`**, con el contrato:

```
slug: 'chmodCalculator'
fields:
  - initialMode    text      default '644'   validate: /^[0-7]{3,4}$/   "Permisos iniciales (octal)"
  - initialTarget  select    default 'file'  options: file | dir       "Objetivo inicial"
  - showSpecial    checkbox  default false                              "Mostrar bits especiales"
  - title          text      opcional                                   "Título (opcional)"
```

Reglas de integración (mismo patrón que ADR 0010 para `Callout`):

- El bloque se define en `lib/lexical/chmodCalculatorBlock.ts` y se registra en
  `BlocksFeature` (`lib/lexical/bodyEditor.ts`), junto a `calloutBlock`.
- El converter (`lib/lexical/converters.tsx`, entrada `blocks.chmodCalculator`) traduce el nodo
  Lexical a `<ChmodCalculator initialMode={...} initialTarget={...} showSpecial={...} title={...} />`
  mediante un **import estático**, no `next/dynamic()`.
- `components/blocks/ChmodCalculator.tsx` es la única pieza `'use client'`: recibe props
  serializables planas y deriva todo su estado visible (octal, simbólico, comando, glosas de cada
  bit) de dos estados — `mode` (entero) y `target` (`'file' | 'dir'`) — sin `useEffect` de
  inicialización: ambos se calculan de forma determinista a partir de las props, así el primer
  render de cliente coincide con el HTML de servidor.
- Las glosas de cada bit (qué significa `r`/`w`/`x`/`setuid`/`setgid`/`sticky` según el objetivo) y
  los presets de valores comunes viven como datos estáticos dentro del propio componente — no son
  contenido editorial, son parte fija de la herramienta, igual que las 4 variantes de `Callout` no
  son campos de Payload.
- Como con `Callout`, el importador de Markdown (`lib/import/mdToLexical.ts`) no genera este bloque:
  se inserta a mano en el admin de Payload.

## Consecuencias

- Más fácil: el patrón es una copia mecánica del de `Callout` (definición → registro → converter →
  componente → estilos), documentado ya en
  `docs/agent-notes/2026-06-19-engineer-tod-35-callout-block-definition.md`.
- Más difícil: si en el futuro aparece un tercer/cuarto widget interactivo del mismo tipo (islas
  `'use client'` con estado propio y sin richText anidado), vale la pena revisar si un registro tipo
  `widget` con un `select` de variantes fijas (sin `json` libre) empieza a pagar su complejidad. Esa
  decisión queda para su propio ADR cuando exista ese segundo caso real, no antes.
- `AGENTS.md` deja de decir "único bloque custom = Callout"; pasa a listar los dos bloques y a
  apuntar a este ADR.
