import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '@/lib/access'
import { autoSlug } from '@/lib/slug'
import { makeBodyEditor } from '@/lib/lexical/bodyEditor'

export const Series: CollectionConfig = {
  slug: 'series',
  admin: {
    useAsTitle: 'title',
    group: 'Contenido',
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
    { name: 'slug', type: 'text', required: true, unique: true, label: 'Slug' },
    { name: 'description', type: 'textarea', label: 'Descripción corta (tarjetas)' },
    {
      name: 'body',
      type: 'richText',
      label: 'Portada / directorio (rich)',
      editor: makeBodyEditor(),
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen de portada',
    },
  ],
}
