import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'
import { calloutBlock } from '@/lib/lexical/calloutBlock'

import { isAdmin, isAdminOrEditor } from '@/lib/access'
import { autoSlug } from '@/lib/slug'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    group: 'Contenido',
    defaultColumns: ['title', 'status', 'publishedAt', 'author'],
  },
  access: {
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [autoSlug('title')],
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Título' },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: { position: 'sidebar' },
    },
    { name: 'excerpt', type: 'textarea', label: 'Extracto' },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen de portada',
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: 'Autor',
      admin: { position: 'sidebar' },
      defaultValue: ({ user }) => user?.id,
      access: {
        update: isAdmin,
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Estado',
      options: [
        { label: 'Borrador', value: 'draft' },
        { label: 'Publicado', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Fecha de publicación',
      admin: { position: 'sidebar' },
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Cuerpo',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({ blocks: [calloutBlock] }),
        ],
      }),
    },
    {
      name: 'series',
      type: 'relationship',
      relationTo: 'series',
      label: 'Serie',
      admin: { position: 'sidebar' },
    },
    {
      name: 'seriesOrder',
      type: 'number',
      label: 'Orden en la serie',
      admin: { position: 'sidebar' },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Categorías',
      admin: { position: 'sidebar' },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Tags',
      admin: { position: 'sidebar' },
    },
  ],
}
