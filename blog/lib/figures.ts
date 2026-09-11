import type { Media, Post, Series } from '@/payload-types'

export type ViewerFigure = {
  id: string
  kind: 'cover' | 'body'
  previewSrc: string
  thumbnailSrc: string
  fullSrc: string
  width?: number
  height?: number
  mimeType: string
  alt: string
  caption: string
  filename?: string
  socialFilename?: string
  socialMimeType?: string
  sharePath: string
}

export type LexicalUploadNode = {
  type?: string
  id?: string
  value?: unknown
  fields?: {
    alt?: unknown
    caption?: unknown
    [key: string]: unknown
  }
  children?: unknown[]
  [key: string]: unknown
}

type RichTextDocument = Post['body'] | Series['body'] | null | undefined

function textField(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function imageMedia(value: unknown): Media | null {
  if (!value || typeof value !== 'object') return null
  const media = value as Media
  return media.mimeType?.startsWith('image/') && media.url ? media : null
}

function sharePath(basePath: string, id: string): string {
  return `${basePath}/figura/${encodeURIComponent(id)}`
}

/**
 * Normaliza un upload ya poblado por Payload. Esta función también la consume
 * el converter: una sola fuente de verdad para URL, texto y dimensiones.
 */
export function figureFromUploadNode(
  node: LexicalUploadNode,
  basePath: string,
): ViewerFigure | null {
  const id = textField(node.id)
  const media = imageMedia(node.value)
  if (!id || !media || !media.url || !media.mimeType) return null

  const preview = media.sizes?.content
  return {
    id,
    kind: 'body',
    previewSrc: preview?.url ?? media.url,
    thumbnailSrc: media.sizes?.thumbnail?.url ?? preview?.url ?? media.url,
    fullSrc: media.url,
    width: preview?.width ?? media.width ?? undefined,
    height: preview?.height ?? media.height ?? undefined,
    mimeType: media.mimeType,
    alt: textField(node.fields?.alt) || textField(media.alt),
    caption: textField(node.fields?.caption) || textField(media.caption),
    filename: media.filename ?? undefined,
    socialFilename: preview?.filename ?? media.filename ?? undefined,
    socialMimeType: preview?.mimeType ?? media.mimeType,
    sharePath: sharePath(basePath, id),
  }
}

export function coverFigureOf(
  post: Pick<Post, 'coverImage'>,
  basePath: string,
): ViewerFigure | null {
  const media = imageMedia(post.coverImage)
  if (!media || !media.url || !media.mimeType) return null
  const preview = media.sizes?.hero

  return {
    id: 'portada',
    kind: 'cover',
    previewSrc: preview?.url ?? media.url,
    thumbnailSrc: media.sizes?.thumbnail?.url ?? preview?.url ?? media.url,
    fullSrc: media.url,
    width: preview?.width ?? media.width ?? undefined,
    height: preview?.height ?? media.height ?? undefined,
    mimeType: media.mimeType,
    alt: textField(media.alt),
    caption: textField(media.caption),
    filename: media.filename ?? undefined,
    socialFilename: preview?.filename ?? media.filename ?? undefined,
    socialMimeType: preview?.mimeType ?? media.mimeType,
    sharePath: sharePath(basePath, 'portada'),
  }
}

function childNodes(value: unknown): LexicalUploadNode[] {
  return Array.isArray(value) ? (value.filter(Boolean) as LexicalUploadNode[]) : []
}

function collectUploads(
  nodes: LexicalUploadNode[],
  basePath: string,
  figures: ViewerFigure[],
): void {
  for (const node of nodes) {
    if (node.type === 'upload') {
      const figure = figureFromUploadNode(node, basePath)
      if (figure) figures.push(figure)
    }

    collectUploads(childNodes(node.children), basePath, figures)

    // Callout guarda otro documento Lexical dentro de `fields.content`.
    const content = node.fields?.content
    if (content && typeof content === 'object') {
      const root = (content as { root?: { children?: unknown[] } }).root
      collectUploads(childNodes(root?.children), basePath, figures)
    }
  }
}

/** Deriva las figuras del documento en el mismo orden en que se pintan. */
export function extractViewerFigures(
  body: RichTextDocument,
  basePath: string,
  cover?: ViewerFigure | null,
): ViewerFigure[] {
  const figures = cover ? [cover] : []
  const root = body?.root as { children?: unknown[] } | undefined
  collectUploads(childNodes(root?.children), basePath, figures)
  const occurrences = new Map<string, number>()
  for (const figure of figures) occurrences.set(figure.id, (occurrences.get(figure.id) ?? 0) + 1)
  return figures.filter((figure) => occurrences.get(figure.id) === 1)
}

export function figureAccessibleLabel(figure: ViewerFigure, position?: number): string {
  return (
    figure.caption ||
    figure.alt ||
    figure.filename ||
    (position ? `Figura ${position}` : 'Figura')
  )
}
