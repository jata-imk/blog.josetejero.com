import React from 'react'
import {
  RichText,
  type JSXConverters,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedBlockNode } from '@payloadcms/richtext-lexical'
import { Callout } from '@/components/blocks/Callout'
import { CodeBlockClient } from '@/components/blocks/CodeBlockClient'

type CalloutFields = {
  blockType: 'callout'
  variant: 'note' | 'tip' | 'warning' | 'danger'
  title?: string
  content: Parameters<typeof RichText>[0]['data']
}

type LexicalChildNode = {
  type: string
  text?: string
  children?: LexicalChildNode[]
}

function extractCodeText(children: LexicalChildNode[]): string {
  const lines: string[] = []

  for (const child of children) {
    if (child.type === 'line') {
      let lineText = ''
      if (child.children && Array.isArray(child.children)) {
        for (const token of child.children) {
          if (token.type === 'tab') {
            lineText += '\t'
          } else if ('text' in token && typeof token.text === 'string') {
            lineText += token.text
          }
        }
      }
      lines.push(lineText)
    } else if (child.type === 'linebreak') {
      lines.push('')
    } else if (child.type === 'tab') {
      if (lines.length === 0) lines.push('')
      lines[lines.length - 1] += '\t'
    } else if ('text' in child && typeof child.text === 'string') {
      if (lines.length === 0) lines.push('')
      lines[lines.length - 1] += child.text
    }
  }

  return lines.join('\n')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Exported so pages can pass it directly to <RichText converters={bodyConverters} />.
export const bodyConverters: JSXConvertersFunction = ({ defaultConverters }) => {
  const converters: JSXConverters = {
    ...defaultConverters,
    code: ({ node }: { node: { language?: string; children?: LexicalChildNode[] } }) => {
      const children = node.children ?? []
      const text = extractCodeText(children)
      const language = node.language
      // Return CodeBlockClient directly with escaped HTML fallback
      // CodeBlockClient will progressively enhance with Shiki highlighting on the client
      return <CodeBlockClient lang={language} code={text} html={escapeHtml(text)} />
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
            {content
              ? <RichText data={content} converters={converters} disableContainer />
              : null}
          </Callout>
        )
      },
    },
  }
  return converters
}
