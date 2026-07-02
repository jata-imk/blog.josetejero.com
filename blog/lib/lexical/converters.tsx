import React from 'react'
import {
  RichText,
  type JSXConverters,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedBlockNode } from '@payloadcms/richtext-lexical'
import { Callout } from '@/components/blocks/Callout'
import { CodeBlockClient } from '@/components/blocks/CodeBlockClient'
import { escapeHtml, type LexicalChildNode } from '@/lib/code-highlight'

type CalloutFields = {
  blockType: 'callout'
  variant: 'note' | 'tip' | 'warning' | 'danger'
  title?: string
  content: Parameters<typeof RichText>[0]['data']
}

type CodeBlockFields = {
  blockType: 'Code'
  language?: string
  /** El `CodeBlock` premade de Payload guarda el código como string aquí. */
  code?: string
}

type HeadingNode = {
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  children?: LexicalChildNode[]
}

type TableCellNode = {
  headerState?: number
  colSpan?: number
  rowSpan?: number
  children?: LexicalChildNode[]
}

/**
 * Extrae el texto plano de un heading para generar su ID.
 */
function extractHeadingText(children: LexicalChildNode[] | undefined): string {
  if (!children) return ''
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
 * Convierte texto de heading en slug para ID (coherente con toc.ts).
 */
function slugifyHeading(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Crea los converters del body. Recibe el mapa `texto → HTML resaltado` que la
 * página pre-calcula en servidor (ver `highlightLexicalCode`). El converter del
 * bloque `Code` (premade de Payload) es síncrono y devuelve un Client Component
 * con el HTML ya resaltado: Shiki queda en servidor (ADR 0008) y solo el botón
 * copiar viaja como cliente.
 */
export function makeBodyConverters(highlightMap: Map<string, string>): JSXConvertersFunction {
  return ({ defaultConverters }) => {
    const converters: JSXConverters = {
      ...defaultConverters,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      heading: (args: any) => {
        const node = args.node as HeadingNode
        const Tag = node.tag ?? 'h2'
        const text = extractHeadingText(node.children)
        const id = text ? slugifyHeading(text) : undefined
        const children = args.nodesToJSX({ nodes: node.children ?? [] })
        return <Tag id={id}>{children}</Tag>
      },
      // Override de la tabla default de @payloadcms/richtext-lexical: usa
      // estilos inline (#ccc, padding fijo) que no siguen los design tokens
      // del blog. Reemplazamos por clases .ab-table-* (app/globals.css).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      table: (args: any) => {
        const children = args.nodesToJSX({ nodes: args.node.children ?? [] })
        return (
          <div className="ab-table-wrap">
            <table className="ab-table">
              <tbody>{children}</tbody>
            </table>
          </div>
        )
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tablerow: (args: any) => {
        const children = args.nodesToJSX({ nodes: args.node.children ?? [] })
        return <tr>{children}</tr>
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tablecell: (args: any) => {
        const node = args.node as TableCellNode
        const children = args.nodesToJSX({ nodes: node.children ?? [] })
        const Tag = (node.headerState ?? 0) > 0 ? 'th' : 'td'
        return (
          <Tag colSpan={node.colSpan && node.colSpan > 1 ? node.colSpan : undefined}
            rowSpan={node.rowSpan && node.rowSpan > 1 ? node.rowSpan : undefined}>
            {children}
          </Tag>
        )
      },
      blocks: {
        ...defaultConverters.blocks,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callout: ({ node }: { node: SerializedBlockNode<any> }) => {
          const typedNode = node as SerializedBlockNode<CalloutFields>
          const fields = typedNode.fields ?? {}
          const { variant, title, content } = fields
          return (
            <Callout kind={variant} title={title ?? undefined}>
              {content ? (
                <RichText data={content} converters={converters} disableContainer />
              ) : null}
            </Callout>
          )
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Code: ({ node }: { node: SerializedBlockNode<any> }) => {
          const typedNode = node as SerializedBlockNode<CodeBlockFields>
          const fields = typedNode.fields ?? {}
          const text = fields.code ?? ''
          const html = highlightMap.get(text) ?? escapeHtml(text)
          return <CodeBlockClient lang={fields.language} code={text} html={html} />
        },
      },
    }
    return converters
  }
}
