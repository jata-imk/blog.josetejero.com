import {
  BlocksFeature,
  CodeBlock,
  EXPERIMENTAL_TableFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { calloutBlock } from './calloutBlock'
import { chmodCalculatorBlock } from './chmodCalculatorBlock'

// Factory — each call returns a fresh instance so Payload can sanitize each
// collection's editor independently without shared-state mutation.
export function makeBodyEditor() {
  return lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      EXPERIMENTAL_TableFeature(),
      BlocksFeature({ blocks: [calloutBlock, chmodCalculatorBlock, CodeBlock()] }),
    ],
  })
}
