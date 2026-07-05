import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '@/lib/access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    // Los archivos de media (portadas de posts, etc.) se sirven en el sitio público
    // (incluido /_next/image, que hace un fetch HTTP real a /api/media/file/**, no
    // Local API, y por eso SÍ aplica control de acceso). Deben ser legibles sin auth.
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  upload: {
    // Paisaje 16:9 en las tres — las portadas reales son horizontales (2:1 y variantes cercanas).
    // `card` era 768x1024 (retrato 3:4): con fit:cover eso recortaba casi todo el ancho del
    // original y dejaba una tira vertical ampliada. Los contenedores del frontend (.post-card
    // .thumb, .post-hero .thumb) ya son 16:9, así que igualar el tamaño aquí evita el doble recorte.
    imageSizes: [
      { name: 'thumbnail', width: 480, height: 270, position: 'centre' },
      { name: 'card', width: 960, height: 540, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'image/svg+xml'],
  },
  admin: {
    group: 'Admin',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
    },
  ],
}
