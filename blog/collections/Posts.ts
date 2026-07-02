import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '@/lib/access'
import { autoSlug } from '@/lib/slug'
import { makeBodyEditor } from '@/lib/lexical/bodyEditor'

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
  endpoints: [
    {
      path: '/:id/import-md',
      method: 'post',
      handler: async (req) => {
        // Guard — solo admin/editor autenticado
        if (!req.user) {
          return new Response(JSON.stringify({ error: 'No autenticado' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const id = (req.routeParams as Record<string, string>)?.id
        if (!id) {
          return new Response(JSON.stringify({ error: 'Falta el id del post' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        let md: string
        try {
          const body = await req.json?.() as { md?: string } | undefined
          md = body?.md ?? ''
        } catch {
          return new Response(JSON.stringify({ error: 'Body inválido (espera JSON { md: string })' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        if (!md.trim()) {
          return new Response(JSON.stringify({ error: 'El campo md está vacío' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        // Import dinámico para evitar cargar el converter en el bundle del cliente
        const { mdToLexicalBody } = await import('@/lib/import/mdToLexical')
        const { uploadImageFromUrl } = await import('@/lib/import/uploadImage')

        const result = await mdToLexicalBody(md, {
          uploadImage: (src) => uploadImageFromUrl(req.payload, src),
        })

        await req.payload.update({
          collection: 'posts',
          id: Number(id),
          data: { body: result.body },
          // Evitar disparar hooks de slug/validación innecesarios
          overrideAccess: false,
          user: req.user,
        })

        return new Response(JSON.stringify({ ok: true, report: result.report }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  ],
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
      editor: makeBodyEditor(),
    },
    {
      // Campo UI: muestra el botón "Importar Markdown" junto al campo body
      name: 'importMarkdown',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/ImportMarkdownField#ImportMarkdownField',
        },
      },
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
      name: 'seriesDepth',
      type: 'number',
      label: 'Nivel en la serie',
      defaultValue: 0,
      admin: { position: 'sidebar', description: '0 = raíz, 1 = sub-artículo (indentación visual)' },
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
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Destacado',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
}
