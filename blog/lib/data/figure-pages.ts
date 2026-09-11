import 'server-only'
import { cache } from 'react'
import { getPostBySlug } from './posts'
import { getSeriesBySlug } from './series'
import { coverFigureOf, extractViewerFigures, type ViewerFigure } from '@/lib/figures'
import type { Post, Series } from '@/payload-types'

export type PostFigureContext = {
  parent: Post
  figure: ViewerFigure
  figures: ViewerFigure[]
  position: number
  basePath: string
}

export type SeriesFigureContext = {
  parent: Series
  figure: ViewerFigure
  figures: ViewerFigure[]
  position: number
  basePath: string
}

export const getPostFigureContext = cache(async (
  slug: string,
  figureId: string,
): Promise<PostFigureContext | null> => {
  const post = await getPostBySlug(slug)
  if (!post) return null
  const basePath = `/blog/${post.slug}`
  const figures = extractViewerFigures(post.body, basePath, coverFigureOf(post, basePath))
  const position = figures.findIndex((figure) => figure.id === figureId)
  if (position < 0) return null
  return { parent: post, figure: figures[position], figures, position, basePath }
})

export const getSeriesFigureContext = cache(async (
  slug: string,
  figureId: string,
): Promise<SeriesFigureContext | null> => {
  const series = await getSeriesBySlug(slug)
  if (!series) return null
  const basePath = `/series/${series.slug}`
  const figures = extractViewerFigures(series.body, basePath)
  const position = figures.findIndex((figure) => figure.id === figureId)
  if (position < 0) return null
  return { parent: series, figure: figures[position], figures, position, basePath }
})

