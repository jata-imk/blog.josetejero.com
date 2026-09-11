import type { Metadata } from 'next'
import type { PostFigureContext, SeriesFigureContext } from '@/lib/data/figure-pages'
import { figureAccessibleLabel } from '@/lib/figures'
import { alternatesFor, SITE_LOCALE, SITE_NAME } from '@/lib/seo'

export function figureMetadata(
  scope: 'blog' | 'series',
  context: PostFigureContext | SeriesFigureContext,
): Metadata {
  const { figure, position, basePath } = context
  const parentTitle = context.parent.title
  const label = figureAccessibleLabel(figure, position + 1)
  const description = figure.caption || figure.alt || `Figura ${position + 1} de ${parentTitle}.`
  const socialImage = `/api/figure-og/${scope}/${encodeURIComponent(context.parent.slug)}/${encodeURIComponent(figure.id)}`

  return {
    title: `${label} — ${parentTitle}`,
    description,
    alternates: alternatesFor(basePath),
    robots: { index: false, follow: true },
    openGraph: {
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type: scope === 'blog' ? 'article' : 'website',
      title: `${label} — ${parentTitle}`,
      description,
      url: figure.sharePath,
      images: [{ url: socialImage, width: 1200, height: 630, alt: label }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${label} — ${parentTitle}`,
      description,
      images: [{ url: socialImage, alt: label }],
    },
  }
}

