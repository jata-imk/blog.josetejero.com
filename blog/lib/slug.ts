import type { CollectionBeforeValidateHook } from 'payload'

const reAccents = /[\u0300-\u036f]/g
const reSymbols = /[^\w\s-]/g
const reSpaces = /[\s]+/g
const reHyphens = /-+/g

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(reAccents, '')
    .toLowerCase()
    .replace(reSymbols, '')
    .replace(reSpaces, '-')
    .replace(reHyphens, '-')
    .replace(/^-+|-+$/g, '')
}

export function autoSlug(sourceField: string): CollectionBeforeValidateHook {
  return ({ data }) => {
    const slug = data?.slug as string | undefined
    if (slug && slug.trim() !== '') return data

    const source = data?.[sourceField] as string | undefined
    if (!source || source.trim() === '') return data

    return { ...data, slug: slugify(source) }
  }
}
