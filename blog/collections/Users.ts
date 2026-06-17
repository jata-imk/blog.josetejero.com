import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nombre',
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rol',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      defaultValue: 'editor',
      required: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Avatar',
    },
  ],
}
