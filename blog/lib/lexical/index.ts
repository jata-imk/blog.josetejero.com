/**
 * Pipeline server-first de Lexical → React (ADR 0012).
 *
 * - `makeBodyConverters`: crea converters JSX con soporte para headings con ID,
 *   code blocks resaltados (Shiki), y Callout anidado.
 * - `extractToc`: deriva la tabla de contenidos (h2/h3) desde el árbol Lexical
 *   sin persistirla.
 */

export { makeBodyConverters } from './converters'
export { extractToc } from './toc'
export { calloutBlock } from './calloutBlock'
export { chmodCalculatorBlock } from './chmodCalculatorBlock'
