import type { Block } from 'payload'

/**
 * Video y comparación de video (ADR 0041). Con un resultado es el reproductor
 * genérico del blog; con 2-3 añade selector de pestañas y lightbox sincronizado.
 * Las opciones de `mode`, `accent` y `aspect` son la fuente única: el componente
 * importa los tipos desde aquí.
 */
export const VIDEO_MODES = ['texto', 'imagen', 'video'] as const
export const VIDEO_ACCENTS = ['blue', 'violet', 'cyan', 'amber', 'rose'] as const
export const VIDEO_ASPECTS = ['horizontal', 'vertical', 'square'] as const

export type VideoMode = (typeof VIDEO_MODES)[number]
export type VideoAccent = (typeof VIDEO_ACCENTS)[number]
export type VideoAspect = (typeof VIDEO_ASPECTS)[number]

export const videoCompareBlock: Block = {
  slug: 'videoCompare',
  labels: { singular: 'Video / comparación', plural: 'Videos / comparaciones' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título (opcional)',
    },
    {
      name: 'mode',
      type: 'select',
      label: 'Modo',
      admin: { description: 'Solo se muestra si hay prompt.' },
      options: [
        { label: 'Texto → video', value: 'texto' },
        { label: 'Imagen → video', value: 'imagen' },
        { label: 'Video → video', value: 'video' },
      ],
    },
    {
      name: 'prompt',
      type: 'textarea',
      label: 'Prompt (opcional)',
      admin: {
        description: 'Vacío = reproductor simple, sin cabecera ni bloque "Antes".',
      },
    },
    {
      name: 'input',
      type: 'upload',
      relationTo: 'media',
      label: 'Entrada (imagen o video de origen)',
      admin: {
        condition: (_, siblingData) => siblingData?.mode === 'imagen' || siblingData?.mode === 'video',
      },
    },
    {
      name: 'doodle',
      type: 'text',
      label: 'Anotación a mano (opcional)',
      admin: { description: 'Ej.: "mismo prompt, sin retoques". Se oculta en móvil.' },
    },
    {
      name: 'results',
      type: 'array',
      label: 'Resultados',
      labels: { singular: 'Resultado', plural: 'Resultados' },
      minRows: 1,
      maxRows: 3,
      required: true,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Modelo / etiqueta',
              admin: { description: 'Obligatorio si hay más de un resultado.', width: '60%' },
            },
            {
              name: 'accent',
              type: 'select',
              label: 'Color',
              defaultValue: 'blue',
              required: true,
              admin: { width: '40%' },
              options: [
                { label: 'Azul', value: 'blue' },
                { label: 'Violeta', value: 'violet' },
                { label: 'Cian', value: 'cyan' },
                { label: 'Ámbar', value: 'amber' },
                { label: 'Rosa', value: 'rose' },
              ],
            },
          ],
        },
        {
          name: 'video',
          type: 'upload',
          relationTo: 'media',
          label: 'Video',
          required: true,
          filterOptions: { mimeType: { contains: 'video/' } },
        },
        {
          name: 'poster',
          type: 'upload',
          relationTo: 'media',
          label: 'Poster (opcional)',
          filterOptions: { mimeType: { contains: 'image/' } },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'aspect',
              type: 'select',
              label: 'Formato',
              defaultValue: 'horizontal',
              required: true,
              admin: { width: '40%' },
              options: [
                { label: 'Horizontal 16:9', value: 'horizontal' },
                { label: 'Vertical 9:16', value: 'vertical' },
                { label: 'Cuadrado 1:1', value: 'square' },
              ],
            },
            {
              name: 'note',
              type: 'text',
              label: 'Nota técnica (opcional)',
              admin: { description: 'Ej.: "8 s · 720p · $0.40"', width: '60%' },
            },
          ],
        },
      ],
      validate: (value: unknown) => {
        if (!Array.isArray(value) || value.length < 2) return true
        const unnamed = value.some((row) => !(row as { label?: string })?.label?.trim())
        return unnamed ? 'Con varios resultados, cada uno necesita su etiqueta de modelo.' : true
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Pie de figura (opcional)',
    },
  ],
}
