import type { Post, Series } from '@/payload-types'
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
  const doneCount = currentIndex >= 0 ? currentIndex : 0
  const progress = posts.length > 0 ? Math.round((doneCount / posts.length) * 100) : 0

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
        {posts.map((post, i) => {
          const state =
            i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'soon'
          return (
            <SeriesStep
              key={post.id}
              number={i + 1}
              title={post.title}
              state={state}
              href={state !== 'soon' ? `/blog/${post.slug}` : undefined}
            />
          )
        })}
      </div>

      {posts.length > 1 && (
        <div style={{ marginTop: 18 }}>
          <SeriesProgress value={progress} />
        </div>
      )}
    </div>
  )
}
