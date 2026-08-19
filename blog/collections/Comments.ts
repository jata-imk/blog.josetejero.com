import type { CollectionConfig } from 'payload'

import { revalidateCommentPost } from '@/hooks/revalidate-post'
import { isAdmin, isAdminOrEditor } from '@/lib/access'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'authorName',
    group: 'Contenido',
    defaultColumns: ['authorName', 'status', 'post', 'createdAt'],
  },
  access: {
    // El alta pública NO pasa por aquí: la hace `createComment()` con la Local API, que ignora el
    // access control. Cerrarlo obliga a los bots a usar /api/comments/create, donde sí hay honeypot
    // y rate limit (ADR 0032).
    create: ({ req }) => !!req.user,
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'approved' } }
    },
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        await revalidateCommentPost(req.payload, doc.post)
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await revalidateCommentPost(req.payload, doc.post)
      },
    ],
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      label: 'Post',
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'comments',
      label: 'Respuesta a',
      admin: {
        description:
          'Comentario al que responde. Solo se admite un nivel: un comentario con padre no puede tener respuestas.',
      },
    },
    { name: 'authorName', type: 'text', required: true, label: 'Nombre' },
    {
      name: 'authorEmail',
      type: 'email',
      label: 'Email',
      access: {
        // Dato personal: visible en el admin, nunca en la API pública.
        read: ({ req }) => !!req.user,
      },
    },
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
