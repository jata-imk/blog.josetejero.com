# 2026-08-04 — Engineer — Bloque `chmodCalculator`

## Qué hice

Añadí el segundo bloque custom de Lexical: `chmodCalculator`, una calculadora de permisos `chmod`
interactiva embebible en cualquier post. Nace de la idea que se dejó abierta al preparar la entrada
de permisos en Linux: la tabla octal 0–7 "pide a gritos" ser interactiva.

Tras la primera versión (rejilla de checkboxes desnuda: `r`, `w`, `x`, `setuid (4000)`...), una
segunda pasada de UX la convirtió en una herramienta que se explica sola: cada casilla lleva su
glosa en español, un toggle Fichero/Carpeta cambia esas glosas en vivo (los mismos bits significan
cosas distintas), un select de valores comunes, un pie que explica los bits especiales — y marca
cuáles no hacen nada según el objetivo —, e iconos y botón de copiar reutilizando piezas que ya
existían en el repo.

## Por qué (para quien está aprendiendo Next.js/Payload)

**Qué es un bloque de Lexical.** El cuerpo de un post no es HTML: es un árbol JSON (Lexical). Un
"bloque" es un nodo especial de ese árbol que no es texto ni un nodo built-in (párrafo, heading,
imagen...) sino una pieza estructurada que tú defines, con sus propios campos. Payload la expone en
el editor del admin como un formulario; el frontend, al pintar el post, decide qué React renderizar
para ese nodo.

**Por qué el converter vive en servidor y el componente en cliente.** La página de detalle
(`app/(frontend)/blog/[slug]/page.tsx`) es un Server Component: se ejecuta en el servidor, nunca baja
al navegador. Ahí es donde `lib/lexical/converters.tsx` recorre el árbol Lexical y, para cada nodo
`chmodCalculator`, decide renderizar `<ChmodCalculator initialMode=... />`. Pero la calculadora tiene
estado (qué casillas están marcadas) — eso solo puede vivir en el navegador. Por eso
`components/blocks/ChmodCalculator.tsx` lleva `'use client'`: es la frontera exacta donde el árbol
deja de ser server-only y empieza a hidratarse. Server Components por defecto, cliente solo en la
hoja que de verdad lo necesita — el mismo patrón que ya usa `CodeBlockClient` (Shiki resalta en
servidor, el botón de copiar es la única parte cliente).

**Por qué no hace falta `next/dynamic()`.** Se evaluó envolver `ChmodCalculator` en
`dynamic(() => import(...))` para que su JS "solo se descargue en los posts que lo usan". Pero
`converters.tsx` ya se ejecuta en servidor: cuando React arma la respuesta de un post que *no* tiene
el bloque, el código de `ChmodCalculator` ni se menciona en el árbol que llega al navegador — React
(vía el "Flight manifest" de RSC) ya hace ese code-splitting automáticamente para cualquier Client
Component referenciado desde un Server Component. `dynamic()` solo sirve para forzar ese split desde
*otro* Client Component, o para desactivar SSR de una pieza (`ssr: false`) — y esa segunda opción ni
siquiera es válida aquí, porque estamos en servidor, no dentro de otro componente cliente. Añadirlo
habría sido una capa sin efecto medible, solo más código que mantener.

**Por qué se descartó el bloque `widget` genérico** (select de componente + campo `json` de config +
registro). Con un solo widget, esa indirección paga complejidad que ningún caso de uso actual
necesita (YAGNI), y el campo `json` es un textarea sin tipos ni validación en el admin — rompe el
contrato tipado que ya exige ADR 0010 para `Callout`. El razonamiento completo está en
**ADR 0031** (`docs/adr/0031-bloque-chmod-calculator.md`).

**Por qué el objetivo (fichero/carpeta) es estado de lector, no solo un campo del admin.** Al
revisar la primera versión saltó que los mismos tres bits (`r`/`w`/`x`) significan cosas distintas
según se apliquen a un fichero o a una carpeta — y que ese contraste es justo el contenido de dos
secciones del post ("la `x` en directorios" y "borrar depende de la carpeta, no del archivo"). Si el
objetivo fuera solo un campo fijo del bloque, el lector nunca vería ese cambio en vivo — tendría que
leer la prosa y confiar. Por eso el componente lleva un `target` propio (`'file' | 'dir'`) que el
lector puede alternar con un toggle, y el bloque solo aporta el valor inicial (`initialTarget`) para
que el autor lo inserte ya en el modo que toca en cada sección. Las glosas de cada bit
(`MEANINGS[target]`) y el pie de bits especiales (`SPECIAL_INFO[target]`) son un único diccionario
por objetivo: cambiar el toggle reescribe todo el texto sin tocar el estado `mode`, que es el que de
verdad importa (los bits marcados).

## Archivos tocados

| Archivo | Rol |
|---|---|
| `lib/chmod.ts` | **nuevo**. `OCTAL_MODE` (regex) y `octalHasSpecialBits`, compartidos entre el bloque de Payload y el componente de cliente — antes estaban duplicados |
| `lib/lexical/chmodCalculatorBlock.ts` | definición Payload `Block`: `initialMode` (validado con regex octal + cruzado contra `showSpecial`), `initialTarget` (select file/dir), `showSpecial`, `title` |
| `lib/lexical/index.ts` | export del bloque en el barrel |
| `lib/lexical/bodyEditor.ts` | registrado en `BlocksFeature`, junto a `calloutBlock` |
| `lib/lexical/converters.tsx` | tipo `ChmodCalculatorFields` + entrada `blocks.chmodCalculator`, import estático del componente |
| `components/blocks/ChmodCalculator.tsx` | componente `'use client'`; estado = `mode` (entero 0–4095) + `target` (`'file'\|'dir'`); octal/simbólico/comando/glosas se derivan de ambos, nunca se duplican |
| `components/ui/Ic.tsx` | añadido el path `folder` (ya existía `fileText`), para el toggle Fichero/Carpeta |
| `components/blocks/CopyButton.tsx` | ganó una prop opcional `className` (default `'ab-code-copy'`, sin cambio de comportamiento) para poder reusarlo aquí con estilo propio en vez del de la barra de código |
| `app/globals.css` | clases `.ab-chmod*` (sección "chmod calculator", junto a `/* callouts */`) + añadido a la lista de espaciado de `.ab-prose` |
| `AGENTS.md` | ya no dice "único bloque custom = Callout"; lista los dos y apunta a ADR 0031 |
| `docs/adr/0031-bloque-chmod-calculator.md` | ADR requerido por ADR 0003, enmendado con `initialTarget` |

No hizo falta migración de BD (`body` es `jsonb`), ni tocar el importador de Markdown (el bloque se
inserta a mano en el admin, igual que `Callout`).

## Contrato de datos

```
slug: 'chmodCalculator'
fields:
  - initialMode    text      default '644'   validate /^[0-7]{3,4}$/
  - initialTarget  select    default 'file'  options: file | dir
  - showSpecial    checkbox  default false
  - title          text      opcional
```

Sin `richText` anidado ni campo `json`: los cuatro campos son primitivos serializables, tal como pide
el contrato tipado de ADR 0010/0031. Las glosas de cada bit, los presets de valores comunes y las
explicaciones de bits especiales **no** son campos de Payload — viven como datos estáticos dentro del
componente, porque son parte fija de la herramienta, no contenido editorial (mismo criterio que las 4
variantes de `Callout`, que tampoco son configurables desde fuera del código).

## Verificado en esta pasada

- `pnpm generate:importmap` → "No new imports found": el bloque no declara componentes de admin
  propios, así que no necesita entrada nueva (lo mismo que ya pasaba con `Callout` una vez que su
  `BlocksFeatureClient` genérico estaba en el import map).
- `pnpm generate:types` → diff vacío en `payload-types.ts` (no se usa `interfaceName`).
- `npx tsc --noEmit` y `eslint` sobre todos los archivos tocados → limpio.
- `pnpm dev` local levantado y conectado a la BD de desarrollo por túnel SSH (Dev B), sin errores de
  compilación tras los cambios.

## Pendiente para QA (en el navegador)

- Probar en el admin: insertar el bloque, verificar que `initialMode` rechaza `999`/`abc`, que
  `initialTarget` ofrece Fichero/Carpeta, y que `initialMode='4755'` con `showSpecial` desmarcado da
  error al guardar.
- Frontend: escribir un octal inválido (p. ej. `6`) en el campo y hacer click fuera — debe volver al
  último valor válido, no quedarse mostrando el texto inválido.
- Frontend: alternar el toggle Fichero/Carpeta y confirmar que cambian las 9 glosas, el pie, el
  primer carácter del simbólico (`-` ↔ `d`) y el nombre de ejemplo en el comando — sin tocar el
  octal. Probar los presets (`755`, `4755` con `showSpecial` activo) y que tocar una casilla después
  devuelve el select a "Personalizado".
- Confirmar `s`/`S`/`t`/`T` en la cadena simbólica y que el pie marca como inútiles setuid-en-carpeta
  y sticky-en-fichero.
- Regresión: el botón copiar del bloque de código (`CodeBlock`) debe verse idéntico a como estaba —
  la prop `className` que ganó `CopyButton` tiene default `'ab-code-copy'`.
- Confirmar en DevTools → Network que un post sin el bloque no descarga su chunk.
- Tema oscuro en ambos modos, viewport 390px, y navegación completa con Tab/Espacio sin ratón.

## Correcciones de `/code-review`

Antes del commit corrí `/code-review` sobre el diff completo. Encontró 3 hallazgos, sin ninguno
crítico; los tres se corrigieron:

1. **`initialMode` sin cruzar con `showSpecial`.** El validador aceptaba un octal de 4 dígitos
   (p. ej. `4755`) aunque `showSpecial` siguiera en `false`: el post terminaba mostrando un octal y
   un simbólico con bit especial, pero sin el fieldset "Especiales" ni el pie que lo explica —
   un dígito/letra sin contexto. Arreglado: `validate` en `chmodCalculatorBlock.ts` ahora recibe
   `siblingData` (Payload se lo pasa a cualquier `validate` de campo) y rechaza el valor si trae
   bits especiales pero `showSpecial` está apagado, con un mensaje explicando por qué.
2. **El campo octal podía quedar huérfano.** Si el lector escribía un octal a medias (p. ej. `6`,
   que no matchea `/^[0-7]{3,4}$/`) y hacía click fuera, el campo se quedaba mostrando ese texto
   inválido para siempre, desincronizado del resto del widget (checkboxes/simbólico seguían en el
   último modo válido). Arreglado con un `onBlur` (`handleOctalBlur`) que revierte el campo al
   `mode` vigente si lo que quedó escrito no es un octal válido.
3. **Regex duplicado.** `OCTAL_MODE` estaba definido dos veces, literal, en `chmodCalculatorBlock.ts`
   y en `ChmodCalculator.tsx` — un cambio de formato en uno podía olvidarse en el otro. Extraído a
   `lib/chmod.ts` (`OCTAL_MODE` + `octalHasSpecialBits`), importado por ambos.

## Nota de entorno (no relacionada con este bloque)

Al levantar `pnpm dev` por primera vez en esta máquina, Turbopack falló con un `FATAL` panic al
procesar `app/globals.css` (`node process exited... 0xc0000142`). No era un error de CSS: el
`node_modules` local tenía paquetes rotos — el binario nativo
`@tailwindcss/oxide-win32-x64-msvc` (vacío, sin el `.node` real) y `feed` (ausente del todo). Se
resolvió con `rm -rf node_modules && pnpm install`. Si vuelve a pasar en otra máquina Windows, ese es
el primer sitio a mirar, no el CSS que se estaba editando en ese momento.
