import React from 'react'
import {
  RichText,
  type JSXConverters,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedBlockNode } from '@payloadcms/richtext-lexical'
import { Callout } from '@/components/blocks/Callout'
import { CodeBlock } from '@/components/blocks/CodeBlock'

type CalloutFields = {
  blockType: 'callout'
  variant: 'note' | 'tip' | 'warning' | 'danger'
  title?: string
  content: Parameters<typeof RichText>[0]['data']
}

type CodeFields = {
  blockType: 'Code'
  language?: string
  code?: string
}

// Exported so pages can pass it directly to <RichText converters={bodyConverters} />.
export const bodyConverters: JSXConvertersFunction = ({ defaultConverters }) => {
  const converters: JSXConverters = {
    ...defaultConverters,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Code: ({ node }: { node: SerializedBlockNode<any> }) => {
        const typedNode = node as SerializedBlockNode<CodeFields>
        const { language, code } = typedNode.fields
        return <CodeBlock lang={language} code={code} />
      },
    },
  }
  return converters
}
