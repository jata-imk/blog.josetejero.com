import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '@/lib/access'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'authorName',
    group: 'Contenido',
    defaultColumns: ['authorName', 'status', 'post', 'createdAt'],
  },
  access: {
    create: () => true,
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'approved' } }
    },
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      label: 'Post',
    },
    { name: 'authorName', type: 'text', required: true, label: 'Nombre' },
    { name: 'authorEmail', type: 'email', label: 'Email' },
    { name: 'body', type: 'textarea', required: true, label: 'Comentario' },
    {
      name: 'status',
      type: 'select',
      label: 'Estado',
      options: [
        { label: 'Pendiente', value: 'pending' },
        { label: 'Aprobado', value: 'approved' },
        { label: 'Spam', value: 'spam' },
        { label: 'Rechazado', value: 'rejected' },
      ],
      defaultValue: 'pending',
      required: true,
      access: {
        create: ({ req }) => !!req.user,
        update: ({ req }) => !!req.user,
      },
    },
  ],
}
