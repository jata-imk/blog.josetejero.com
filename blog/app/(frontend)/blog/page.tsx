import { Header } from '../../../components/layout/Header'
import { Footer } from '../../../components/layout/Footer'
import { PostCard } from '../../../components/post/PostCard'
import { Breadcrumb } from '../../../components/ui/Breadcrumb'
import { getPosts } from '../../../lib/data'
import type { Post, Category } from '../../../payload-types'
import type { CatKey } from '../../../components/ui/Cat'

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

const breadcrumbItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Blog' },
]

export default async function BlogPage() {
  const posts = await getPosts(100)

  return (
    <>
      <Header activePath="/blog" />

      <div className="wrap" style={{ paddingTop: 52, paddingBottom: 80 }}>
        <Breadcrumb items={breadcrumbItems} />

        <div style={{ marginTop: 32, marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Todos los artículos</div>
          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.1 }}>
            Blog
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, marginTop: 14, maxWidth: 540, color: 'var(--ink-3)' }}>
            Desarrollo web, automatización, inteligencia artificial y aprendizajes construyendo software.
          </p>
        </div>

        {posts.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: 15 }}>
            Todavía no hay posts publicados.
          </p>
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

      <Footer />
    </>
  )
}
