import { notFound } from 'next/navigation'
import { SeriesStep, SeriesProgress } from '../../../../components/series/SeriesStep'
import { EmptyState } from '../../../../components/ui/EmptyState'
import { Badge } from '../../../../components/ui/Badge'
import { Breadcrumb } from '../../../../components/ui/Breadcrumb'
import { getSeriesWithPosts } from '../../../../lib/data'

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getSeriesWithPosts(slug)
  if (!data) notFound()

  const { series, posts } = data

  const doneCount = posts.filter((p) => p.stepStatus === 'done').length
  const progressPct = posts.length > 0 ? Math.round((doneCount / posts.length) * 100) : 0

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Series', href: '/series' },
    { label: series.title },
  ]

  return (
    <>
      <div className="wrap" style={{ paddingTop: 52, paddingBottom: 80 }}>
        <Breadcrumb items={breadcrumbItems} />

        <div style={{ marginTop: 32, marginBottom: 48, maxWidth: 680 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Badge variant="series" />
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>
              {posts.length} {posts.length === 1 ? 'parte' : 'partes'}
            </span>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.1 }}>
            {series.title}
          </h1>
          {series.description && (
            <p style={{ fontSize: 16, lineHeight: 1.6, marginTop: 16, color: 'var(--ink-3)' }}>
              {series.description}
            </p>
          )}
          {posts.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <SeriesProgress value={progressPct} />
            </div>
          )}
        </div>

        {posts.length === 0 ? (
          <EmptyState
            title="Serie en preparación"
            description="Todavía no hay artículos publicados en esta serie."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 680 }}>
            {posts.map((post, index) => (
              <SeriesStep
                key={post.id}
                number={index + 1}
                title={post.title}
                state={post.stepStatus}
                href={`/blog/${post.slug}`}
              />
            ))}
          </div>
        )}
      </div>

    </>
  )
}
