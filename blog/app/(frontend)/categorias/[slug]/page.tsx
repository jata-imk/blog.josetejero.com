import { notFound } from 'next/navigation'
import { PostCard } from '../../../../components/post/PostCard'
import { EmptyState } from '../../../../components/ui/EmptyState'
import { Cat } from '../../../../components/ui/Cat'
import { Breadcrumb } from '../../../../components/ui/Breadcrumb'
import { getCategoryWithPosts } from '../../../../lib/data'
import { coverImageOf } from '../../../../lib/media'
import type { Post, Category, Tag as TagType } from '../../../../payload-types'
import type { CatInfo } from '../../../../components/ui/Cat'

function primaryCategory(post: Post): CatInfo | null {
  const cats = (post.categories ?? []) as Array<number | Category>
  const obj = cats.find((c): c is Category => typeof c === 'object' && c !== null)
  return obj ? { name: obj.name, slug: obj.slug } : null
}

function fmtDate(iso?: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

function estimateReadTime(body: Post['body']): string {
  const raw = JSON.stringify(body ?? '')
  return `${Math.max(1, Math.round(raw.length / 1400))} min`
}

function postTags(post: Post): Array<{ name: string; slug: string }> {
  return ((post.tags ?? []) as Array<number | TagType>)
    .filter((t): t is TagType => typeof t === 'object' && t !== null)
    .map((t) => ({ name: t.name, slug: t.slug }))
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getCategoryWithPosts(slug)
  if (!data) notFound()

  const { category, posts } = data

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: category.name },
  ]

  return (
    <>
      <div className="wrap" style={{ paddingTop: 52, paddingBottom: 80 }}>
        <Breadcrumb items={breadcrumbItems} />

        <div style={{ marginTop: 32, marginBottom: 48 }}>
          <Cat name={category.name} slug={category.slug} lg />
          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.1, marginTop: 16 }}>
            {category.name}
          </h1>
          {category.description && (
            <p style={{ fontSize: 16, lineHeight: 1.6, marginTop: 14, maxWidth: 540, color: 'var(--ink-3)' }}>
              {category.description}
            </p>
          )}
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 10 }}>
            {posts.length} {posts.length === 1 ? 'artículo' : 'artículos'}
          </p>
        </div>

        {posts.length === 0 ? (
          <EmptyState
            title="Sin artículos todavía"
            description="Esta categoría aún no tiene posts publicados."
          />
        ) : (
          <div className="grid-posts">
            {posts.map((p, i) => (
              <PostCard
                key={p.id}
                category={primaryCategory(p)}
                title={p.title}
                excerpt={p.excerpt ?? ''}
                tags={postTags(p)}
                date={fmtDate(p.publishedAt)}
                readTime={estimateReadTime(p.body)}
                href={`/blog/${p.slug}`}
                image={coverImageOf(p, 'card')}
                priority={i === 0}
              />
            ))}
          </div>
        )}
      </div>

    </>
  )
}
