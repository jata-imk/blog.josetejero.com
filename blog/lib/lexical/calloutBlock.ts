import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

export const calloutBlock: Block = {
  slug: 'callout',
  labels: { singular: 'Callout', plural: 'Callouts' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      label: 'Variante',
      required: true,
      defaultValue: 'note',
      options: [
        { label: 'Nota',      value: 'note' },
        { label: 'Consejo',   value: 'tip' },
        { label: 'Atención',  value: 'warning' },
        { label: 'Peligro',   value: 'danger' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      label: 'Título (opcional)',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Contenido',
      required: true,
      editor: lexicalEditor(),
    },
  ],
}
