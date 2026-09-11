import type { Metadata } from 'next'
import { getSeriesBySlug } from '@/lib/data'
import { alternatesFor } from '@/lib/seo'
import { SeriesDetailPage } from '@/components/series/SeriesDetailPage'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const series = await getSeriesBySlug(slug)
  if (!series) return {}
  return {
    title: series.title,
    description: series.description ?? `Serie: ${series.title}.`,
    alternates: alternatesFor(`/series/${series.slug}`),
  }
}

export default async function SeriesPage({ params }: Props) {
  const { slug } = await params
  return <SeriesDetailPage slug={slug} />
}
