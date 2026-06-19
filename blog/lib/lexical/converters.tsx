import React from 'react'
import {
  RichText,
  type JSXConverters,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedBlockNode } from '@payloadcms/richtext-lexical'
import { Callout } from '@/components/blocks/Callout'

type CalloutFields = {
  blockType: 'callout'
  variant: 'note' | 'tip' | 'warning' | 'danger'
  title?: string
  content: Parameters<typeof RichText>[0]['data']
}

// Exported so pages can pass it directly to <RichText converters={bodyConverters} />.
export const bodyConverters: JSXConvertersFunction = ({ defaultConverters }) => {
  const converters: JSXConverters = {
    ...defaultConverters,
    blocks: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callout: ({ node }: { node: SerializedBlockNode<any> }) => {
        const typedNode = node as SerializedBlockNode<CalloutFields>
        const { variant, title, content } = typedNode.fields
        return (
          <Callout kind={variant} title={title ?? undefined}>
            <RichText data={content} converters={converters} disableContainer />
          </Callout>
        )
      },
    },
  }
  return converters
}
