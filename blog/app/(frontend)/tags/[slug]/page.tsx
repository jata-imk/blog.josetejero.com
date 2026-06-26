import { notFound } from 'next/navigation'
import { PostCard } from '../../../../components/post/PostCard'
import { EmptyState } from '../../../../components/ui/EmptyState'
import { Tag } from '../../../../components/ui/Tag'
import { Breadcrumb } from '../../../../components/ui/Breadcrumb'
import { getTagWithPosts } from '../../../../lib/data'
import type { Post, Category } from '../../../../payload-types'
import type { CatKey } from '../../../../components/ui/Cat'

function primaryCatSlug(post: Post): CatKey {
  const cats = (post.categories ?? []) as Array<number | Category>
  const obj = cats.find((c): c is Category => typeof c === 'object' && c !== null)
  return (obj?.slug as CatKey | undefined) ?? 'tutoriales'
}

function fmtDate(iso?: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

function estimateReadTime(body: Post['body']): string {
  const raw = JSON.stringify(body ?? '')
  return `${Math.max(1, Math.round(raw.length / 1400))} min`
}

function postTags(post: Post): string[] {
  return ((post.tags ?? []) as Array<number | { name: string }>)
    .filter((t): t is { name: string } => typeof t === 'object' && t !== null)
    .map((t) => t.name)
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getTagWithPosts(slug)
  if (!data) notFound()

  const { tag, posts } = data

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: `#${tag.name}` },
  ]

  return (
    <>
      <div className="wrap" style={{ paddingTop: 52, paddingBottom: 80 }}>
        <Breadcrumb items={breadcrumbItems} />

        <div style={{ marginTop: 32, marginBottom: 48 }}>
          <Tag>{tag.name}</Tag>
          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.1, marginTop: 16 }}>
            #{tag.name}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 10 }}>
            {posts.length} {posts.length === 1 ? 'artículo' : 'artículos'}
          </p>
        </div>

        {posts.length === 0 ? (
          <EmptyState
            title="Sin artículos todavía"
            description="Esta etiqueta aún no tiene posts publicados."
          />
        ) : (
          <div className="grid-posts">
            {posts.map((p) => (
              <PostCard
                key={p.id}
                cat={primaryCatSlug(p)}
                title={p.title}
                excerpt={p.excerpt ?? ''}
                tags={postTags(p)}
                date={fmtDate(p.publishedAt)}
                readTime={estimateReadTime(p.body)}
                href={`/blog/${p.slug}`}
              />
            ))}
          </div>
        )}
      </div>

    </>
  )
}
