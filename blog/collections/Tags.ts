import type { CollectionConfig } from 'payload'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    group: 'Contenido',
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Nombre' },
    { name: 'slug', type: 'text', required: true, unique: true, label: 'Slug' },
  ],
}
