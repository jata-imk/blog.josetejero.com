import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SeriesDetailPage } from '@/components/series/SeriesDetailPage'
import { getSeriesFigureContext } from '@/lib/data/figure-pages'
import { figureMetadata } from '@/lib/figure-metadata'

type Props = { params: Promise<{ slug: string; figureId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, figureId } = await params
  const context = await getSeriesFigureContext(slug, figureId)
  return context ? figureMetadata('series', context) : {}
}

export default async function SeriesFigurePage({ params }: Props) {
  const { slug, figureId } = await params
  const context = await getSeriesFigureContext(slug, figureId)
  if (!context) notFound()
  return <SeriesDetailPage slug={slug} initialFigureId={figureId} />
}

