import { notFound } from 'next/navigation'
import { PostCard } from '../../../../components/post/PostCard'
import { EmptyState } from '../../../../components/ui/EmptyState'
import { Cat } from '../../../../components/ui/Cat'
import { Breadcrumb } from '../../../../components/ui/Breadcrumb'
import { getCategoryWithPosts } from '../../../../lib/data'
import type { Post, Category, Tag as TagType } from '../../../../payload-types'
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
  const catKey = category.slug as CatKey

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
          <Cat cat={catKey} lg />
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
