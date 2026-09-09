import type { Post, Series } from '@/payload-types'
import { seriesStepStatus } from '@/lib/data'
import { Badge } from '@/components/ui/Badge'
import { SeriesStep, SeriesProgress } from './SeriesStep'

type SeriesPost = Pick<Post, 'id' | 'title' | 'slug' | 'seriesOrder'>

export function SeriesNav({
  series,
  posts,
  currentPostId,
}: {
  series: Series
  posts: SeriesPost[]
  currentPostId: number
}) {
  const currentIndex = posts.findIndex((p) => p.id === currentPostId)
  // Progreso de lectura: el post actual cuenta como leído, así que el último
  // post de la serie llega al 100%.
  const readCount = currentIndex >= 0 ? currentIndex + 1 : 0
  const progress = posts.length > 0 ? Math.round((readCount / posts.length) * 100) : 0

  return (
    <div
      className="card"
      style={{
        padding: 24,
        background: 'var(--grad-soft)',
        borderColor: 'var(--violet-tint)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Badge variant="series" />
        <span style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>
          Este post forma parte de <strong>{series.title}</strong>
        </span>
      </div>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {posts.map((post, i) => (
          <SeriesStep
            key={post.id}
            number={i + 1}
            title={post.title}
            state={seriesStepStatus(i, currentIndex)}
            // Todos los posts de la lista están publicados: siempre navegables.
            href={`/blog/${post.slug}`}
          />
        ))}
      </div>

      {posts.length > 1 && (
        <div style={{ marginTop: 18 }}>
          <SeriesProgress value={progress} />
        </div>
      )}
    </div>
  )
}
