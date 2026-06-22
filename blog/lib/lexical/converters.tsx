import React from 'react'
import {
  RichText,
  type JSXConverters,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedBlockNode } from '@payloadcms/richtext-lexical'
import { Callout } from '@/components/blocks/Callout'
import { CodeBlockClient } from '@/components/blocks/CodeBlockClient'
import { extractCodeText, escapeHtml, type LexicalChildNode } from '@/lib/code-highlight'

type CalloutFields = {
  blockType: 'callout'
  variant: 'note' | 'tip' | 'warning' | 'danger'
  title?: string
  content: Parameters<typeof RichText>[0]['data']
}

/**
 * Crea los converters del body. Recibe el mapa `texto → HTML resaltado` que la
 * página pre-calcula en servidor (ver `highlightLexicalCode`). El converter `code`
 * es síncrono y devuelve un Client Component con el HTML ya resaltado: Shiki queda
 * en servidor (ADR 0008) y solo el botón copiar viaja como cliente.
 */
export function makeBodyConverters(highlightMap: Map<string, string>): JSXConvertersFunction {
  return ({ defaultConverters }) => {
    const converters: JSXConverters = {
      ...defaultConverters,
      code: ({ node }: { node: { language?: string; children?: LexicalChildNode[] } }) => {
        const text = extractCodeText(node.children ?? [])
        const html = highlightMap.get(text) ?? escapeHtml(text)
        return <CodeBlockClient lang={node.language} code={text} html={html} />
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
      },
    }
    return converters
  }
}
