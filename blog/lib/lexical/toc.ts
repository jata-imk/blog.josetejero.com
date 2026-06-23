import 'server-only'
import type { TocItem } from '@/components/blocks/TableOfContents'
import type { LexicalChildNode } from '@/lib/code-highlight'

/**
 * Extrae la tabla de contenidos desde el árbol Lexical. Solo recoge h2 y h3
 * porque son los niveles semánticos de navegación lateral; h1 es el título
 * principal del post y no necesita repetirse en el TOC.
 *
 * El `id` se deriva del texto del heading usando la misma lógica que el
 * converter aplicará al renderizar, garantizando que los links `#slug`
 * apunten a los elementos correctos en el DOM.
 */
export function extractToc(
  root: { children?: LexicalChildNode[] } | null | undefined,
): TocItem[] {
  const items: TocItem[] = []
  collectHeadings(root?.children ?? [], items)
  return items
}

function collectHeadings(children: LexicalChildNode[], out: TocItem[]): void {
  for (const node of children) {
    if (node.type === 'heading') {
      const tag = (node as LexicalChildNode & { tag?: string }).tag
      if (tag === 'h2' || tag === 'h3') {
        const text = extractHeadingText(node.children ?? [])
        if (text) {
          out.push({
            id: slugifyHeading(text),
            label: text,
            level: tag === 'h2' ? 2 : 3,
          })
        }
      }
    }
    // Recursión: los headings también pueden estar anidados dentro de otros
    // contenedores en el árbol, aunque en la práctica los headings de nivel
    // superior raramente anidan contenido complejo.
    if (node.children) collectHeadings(node.children, out)
  }
}

function extractHeadingText(children: LexicalChildNode[]): string {
  let result = ''
  for (const child of children) {
    if (typeof child.text === 'string') {
      result += child.text
    }
    if (child.children) {
      result += extractHeadingText(child.children)
    }
  }
  return result.trim()
}

/**
 * Convierte el texto de un heading en un slug válido para usar como ID.
 * Usa la misma lógica básica que el slugify del proyecto para mantener
 * coherencia, pero sin los filtros de unicidad de colección.
 */
function slugifyHeading(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // quita símbolos
    .replace(/[\s]+/g, '-') // espacios a guiones
    .replace(/-+/g, '-') // colapsa guiones múltiples
    .replace(/^-+|-+$/g, '') // trim de guiones
}
