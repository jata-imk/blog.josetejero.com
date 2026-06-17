import type { CollectionConfig } from 'payload'

export const Series: CollectionConfig = {
  slug: 'series',
  admin: {
    useAsTitle: 'title',
    group: 'Contenido',
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Título' },
    { name: 'slug', type: 'text', required: true, unique: true, label: 'Slug' },
    { name: 'description', type: 'textarea', label: 'Descripción' },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen de portada',
    },
  ],
}
