import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    group: 'Contenido',
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Nombre' },
    { name: 'slug', type: 'text', required: true, unique: true, label: 'Slug' },
    { name: 'description', type: 'textarea', label: 'Descripción' },
  ],
}
