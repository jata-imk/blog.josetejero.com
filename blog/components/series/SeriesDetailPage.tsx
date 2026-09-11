import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { SeriesStep, SeriesProgress } from '@/components/series/SeriesStep'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Prose } from '@/components/blocks/Prose'
import { FigureViewerProvider } from '@/components/image-viewer/FigureViewer'
import { StandaloneFigure } from '@/components/image-viewer/StandaloneFigure'
import { getSeriesWithPosts } from '@/lib/data'
import { extractViewerFigures } from '@/lib/figures'
import { makeBodyConverters } from '@/lib/lexical'
import { highlightLexicalCode, type LexicalChildNode } from '@/lib/code-highlight'

export async function SeriesDetailPage({ slug, initialFigureId }: { slug: string; initialFigureId?: string }) {
  const data = await getSeriesWithPosts(slug)
  if (!data) notFound()
  const { series, posts } = data
  const basePath = `/series/${series.slug}`
  const figures = extractViewerFigures(series.body, basePath)
  const initialFigureIndex = initialFigureId
    ? figures.findIndex((figure) => figure.id === initialFigureId)
    : -1
  if (initialFigureId && initialFigureIndex < 0) notFound()

  const seriesBody = series.body as Parameters<typeof highlightLexicalCode>[0] | undefined
  const highlightMap = await highlightLexicalCode(
    seriesBody ? (seriesBody as { root?: { children?: LexicalChildNode[] } }).root : undefined,
  )
  const doneCount = posts.filter((post) => post.stepStatus === 'done').length
  const progressPct = posts.length > 0 ? Math.round((doneCount / posts.length) * 100) : 0
  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Series', href: '/series' },
    { label: series.title },
  ]

  return (
    <FigureViewerProvider figures={figures} basePath={basePath} initialFigureId={initialFigureId}>
      {initialFigureIndex >= 0 && (
        <StandaloneFigure
          figure={figures[initialFigureIndex]}
          position={initialFigureIndex + 1}
          total={figures.length}
          basePath={basePath}
        />
      )}
      <div className="wrap" style={{ paddingTop: 52, paddingBottom: 80 }}>
        <Breadcrumb items={breadcrumbItems} />

        <div style={{ marginTop: 32, marginBottom: 48, maxWidth: 680 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Badge variant="series" />
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>
              {posts.length} {posts.length === 1 ? 'parte' : 'partes'}
            </span>
          </div>
          <h1 tabIndex={-1} style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.1 }}>
            {series.title}
          </h1>
          {series.description && (
            <p style={{ fontSize: 16, lineHeight: 1.6, marginTop: 16, color: 'var(--ink-3)' }}>
              {series.description}
            </p>
          )}
          {seriesBody && (
            <div style={{ marginTop: 24 }}>
              <Prose>
                <RichText
                  data={seriesBody as Parameters<typeof RichText>[0]['data']}
                  converters={makeBodyConverters(highlightMap, { figures })}
                />
              </Prose>
            </div>
          )}
          {posts.length > 0 && (
            <div style={{ marginTop: 28 }}><SeriesProgress value={progressPct} /></div>
          )}
        </div>

        {posts.length === 0 ? (
          <EmptyState title="Serie en preparación" description="Todavía no hay artículos publicados en esta serie." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 680 }}>
            {posts.map((post, index) => (
              <SeriesStep
                key={post.id}
                number={index + 1}
                title={post.title}
                state={post.stepStatus}
                href={`/blog/${post.slug}`}
                depth={(post as { seriesDepth?: number }).seriesDepth ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    </FigureViewerProvider>
  )
}
