import React from 'react'
import {
  RichText,
  type JSXConverters,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedBlockNode } from '@payloadcms/richtext-lexical'
import { Callout } from '@/components/blocks/Callout'
import { ChmodCalculator } from '@/components/blocks/ChmodCalculator'
import { CodeBlockClient } from '@/components/blocks/CodeBlockClient'
import { escapeHtml, type LexicalChildNode } from '@/lib/code-highlight'
import type { Media } from '@/payload-types'

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

type ChmodCalculatorFields = {
  blockType: 'chmodCalculator'
  initialMode?: string
  initialTarget?: 'file' | 'dir'
  showSpecial?: boolean | null
  title?: string
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
      // Override del `upload` default de @payloadcms/richtext-lexical: ese converter
      // arma un <picture> con un <source> por cada tamaño generado, usando el ancho
      // del *tamaño* como media query — no el aspect ratio de la imagen. Para un
      // original portrait eso sirve el crop 16:9 de `hero` en cualquier viewport de
      // escritorio (ver ADR 0023, ajuste 2026-08-04). Aquí usamos siempre el tamaño
      // `content` (solo-ancho, sin crop) y, si no se generó, el original — nunca un
      // tamaño recortado.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      upload: ({ node }: { node: any }) => {
        const doc = node?.value as Media | undefined
        if (!doc || typeof doc !== 'object') return null
        const alt = node.fields?.alt || doc.alt || ''
        if (!doc.mimeType?.startsWith('image')) {
          return (
            <a href={doc.url ?? undefined} rel="noopener noreferrer">
              {doc.filename}
            </a>
          )
        }
        const size = doc.sizes?.content
        const src = size?.url ?? doc.url ?? undefined
        const width = size?.width ?? doc.width ?? undefined
        const height = size?.height ?? doc.height ?? undefined
        return <img src={src} width={width ?? undefined} height={height ?? undefined} alt={alt} loading="lazy" />
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        chmodCalculator: ({ node }: { node: SerializedBlockNode<any> }) => {
          const typedNode = node as SerializedBlockNode<ChmodCalculatorFields>
          const fields = typedNode.fields ?? {}
          return (
            <ChmodCalculator
              initialMode={fields.initialMode}
              initialTarget={fields.initialTarget}
              showSpecial={fields.showSpecial}
              title={fields.title}
            />
          )
        },
      },
    }
    return converters
  }
}
