# 0003 — `Callout` como único bloque custom de Lexical

- Estado: aceptada
- Fecha: 2026-06-16
- Decidido por: board (José)

## Contexto
Lexical permite definir bloques custom. Es tentador crear muchos (galería, tabs, acordeón, embeds...),
pero cada bloque custom es código a mantener en editor + render. ¿Cuántos bloques custom permitimos?

## Opciones consideradas
- **Solo `Callout`** — un bloque para avisos (note/tip/warning/danger). Todo lo demás se cubre con
  nodos built-in (código, imágenes, listas, headings). YAGNI.
- **Varios bloques custom** — más expresividad, pero más superficie de mantenimiento y más formas de
  que el diseño se vuelva inconsistente.

## Decisión
**Un único bloque custom: `Callout`**, con `variant: note|tip|warning|danger`, `title`, y `content`
como richText anidado. Cualquier bloque custom adicional requiere su propio ADR.

## Consecuencias
- Más fácil: menos código, diseño consistente, editor simple.
- Más difícil: necesidades futuras de bloques ricos exigen decisión explícita (y eso es bueno: evita
  el crecimiento accidental de complejidad).
