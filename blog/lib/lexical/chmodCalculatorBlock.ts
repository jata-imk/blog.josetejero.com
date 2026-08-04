import type { Block } from 'payload'
import { OCTAL_MODE, octalHasSpecialBits } from '@/lib/chmod'

export const chmodCalculatorBlock: Block = {
  slug: 'chmodCalculator',
  labels: { singular: 'Calculadora chmod', plural: 'Calculadoras chmod' },
  fields: [
    {
      name: 'initialMode',
      type: 'text',
      label: 'Permisos iniciales (octal)',
      required: true,
      defaultValue: '644',
      validate: (value: unknown, { siblingData }: { siblingData?: { showSpecial?: boolean } }) => {
        if (typeof value !== 'string' || !OCTAL_MODE.test(value)) {
          return 'Usa de 3 a 4 dígitos octales (0-7), p. ej. 644 o 4755.'
        }
        if (octalHasSpecialBits(value) && !siblingData?.showSpecial) {
          return 'Este modo incluye setuid/setgid/sticky: activa "Mostrar bits especiales" primero, o el lector verá un bit sin explicación.'
        }
        return true
      },
    },
    {
      name: 'initialTarget',
      type: 'select',
      label: 'Objetivo inicial',
      required: true,
      defaultValue: 'file',
      options: [
        { label: 'Fichero', value: 'file' },
        { label: 'Carpeta', value: 'dir' },
      ],
    },
    {
      name: 'showSpecial',
      type: 'checkbox',
      label: 'Mostrar bits especiales (setuid/setgid/sticky)',
      defaultValue: false,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Título (opcional)',
    },
  ],
}
