# 2026-06-19 — Engineer — TOD-38: Hacer visible Callout en la UI del editor de Payload

## Diagnóstico

El bloque Callout ya estaba definido (`lib/lexical/calloutBlock.ts`) y cableado en
`collections/Posts.ts` vía `BlocksFeature({ blocks: [calloutBlock] })`, pero **no aparecía
en la UI del editor Lexical** dentro del admin de Payload.

La causa: el **import map** (`app/(payload)/admin/importMap.js`) no contenía la entrada
`BlocksFeatureClient`. Payload v3 usa este archivo auto-generado para mapear los componentes
cliente del editor Lexical (cada feature tiene su contraparte client-side). Sin esa entrada,
el admin no puede instanciar el bloque en el toolbar del editor ni mostrar el formulario de
inserción.

## Qué hice

1. `npx payload generate:importmap` → regeneró el import map, añadiendo `BlocksFeatureClient`
2. `npx payload generate:types` → regeneró `payload-types.ts`
3. `npx tsc --noEmit` → limpio
4. `npx next build` → build exitoso

## Verificación

El build pasa. QA debe verificar en el admin de Payload:

- Abrir un post → el campo "Cuerpo" (Lexical editor) debe mostrar "Callout" en el menú de
  inserción de bloques (+).
- Insertar un Callout → debe mostrar el formulario con selector de variante (Nota/Consejo/
  Atención/Peligro), campo de título y rich text anidado.

## Por qué el import map

En Payload v3, el editor Lexical separa server y client:
- `Features` server-side (`BlocksFeature`) definen el schema de datos.
- `FeatureClients` client-side (ej. `BlocksFeatureClient`) son los componentes React que
  renderizan la UI dentro del editor.

El `importMap.js` es el puente entre ambos. Se genera con `payload generate:importmap`
escaneando la config de Payload. Si no se ejecuta después de añadir un bloque, el cliente
nunca sabe que ese bloque existe.
