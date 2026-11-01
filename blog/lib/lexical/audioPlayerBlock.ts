import type { Block } from 'payload'

/**
 * Reproductor de audio (ADR 0042). Una pista por bloque: fila compacta con onda,
 * prompt plegable y modo foco. `pending` permite publicar la prueba antes de
 * tener el audio. Las opciones de `status` son la fuente única del tipo.
 */
export const AUDIO_STATUSES = ['ready', 'pending'] as const
export type AudioStatus = (typeof AUDIO_STATUSES)[number]

type AudioSibling = { status?: AudioStatus } | undefined

export const audioPlayerBlock: Block = {
  slug: 'audioPlayer',
  labels: { singular: 'Audio', plural: 'Audios' },
  fields: [
    {
      name: 'status',
      type: 'select',
      label: 'Estado',
      defaultValue: 'ready',
      required: true,
      options: [
        { label: 'Listo (con audio)', value: 'ready' },
        { label: 'Pendiente (sin audio todavía)', value: 'pending' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Título',
          required: true,
          admin: {
            description: 'Ej.: "Prueba 1 – MiniMax Music 2.6". Lo que va tras «–» es el nombre corto.',
            width: '60%',
          },
        },
        {
          name: 'provider',
          type: 'text',
          label: 'Proveedor (opcional)',
          admin: { description: 'Ej.: "MiniMax vía fal".', width: '40%' },
        },
      ],
    },
    {
      name: 'audio',
      type: 'upload',
      relationTo: 'media',
      label: 'Audio (MP3)',
      filterOptions: { mimeType: { contains: 'audio/' } },
      admin: { condition: (_, siblingData: AudioSibling) => siblingData?.status !== 'pending' },
      validate: (value: unknown, { siblingData }: { siblingData: AudioSibling }) =>
        siblingData?.status === 'pending' || Boolean(value) || 'Sube el audio o marca el bloque como pendiente.',
    },
    {
      name: 'prompt',
      type: 'textarea',
      label: 'Prompt (opcional)',
      admin: { description: 'Se muestra plegable bajo el reproductor, con botón de copiar.' },
    },
    {
      name: 'referenceImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen de referencia (opcional)',
      filterOptions: { mimeType: { contains: 'image/' } },
    },
    {
      name: 'peaks',
      type: 'json',
      label: 'Forma de onda',
      admin: {
        readOnly: true,
        description: 'Se llena por script. Si está vacía, la onda real se calcula al primer play.',
      },
    },
  ],
}
