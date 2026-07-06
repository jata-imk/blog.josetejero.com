import { notFound } from 'next/navigation'
import { ListRow } from '../../../../components/post/ListRow'
import { EmptyState } from '../../../../components/ui/EmptyState'
import { Tag } from '../../../../components/ui/Tag'
import { Cat } from '../../../../components/ui/Cat'
import { Breadcrumb } from '../../../../components/ui/Breadcrumb'
import type { Metadata } from 'next'
import { getTagWithPosts, getTagBySlug } from '../../../../lib/data'
import { alternatesFor } from '../../../../lib/seo'
import { coverImageOf } from '../../../../lib/media'
import type { Post, Category } from '../../../../payload-types'
import type { CatInfo } from '../../../../components/ui/Cat'

function primaryCategory(post: Post): CatInfo | null {
  const cats = (post.categories ?? []) as Array<number | Category>
  const obj = cats.find((c): c is Category => typeof c === 'object' && c !== null)
  return obj ? { name: obj.name, slug: obj.slug } : null
}

function fmtDate(iso?: string | null): string {
  if (!iso) return '--'
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

function estimateReadTime(body: Post['body']): string {
  const raw = JSON.stringify(body ?? '')
  return `${Math.max(1, Math.round(raw.length / 1400))} min`
}

// Metadata dinámica del tag (ADR 0029): nombre y descripción salen
// del CMS; la canonical es la ruta oficial de la taxonomía.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTagBySlug(slug)
  if (!tag) return {}
  return {
    title: `#${tag.name}`,
    description: tag.description?.trim() || `Posts etiquetados con #${tag.name}.`,
    alternates: alternatesFor(`/tags/${tag.slug}`),
  }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getTagWithPosts(slug)
  if (!data) notFound()

  const { tag, posts, relatedTags, categories } = data
  const description = tag.description?.trim() || `Posts etiquetados con #${tag.name}.`

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Tags', href: '/tags' },
    { label: `#${tag.name}` },
  ]

  return (
    <>
      <div className="wrap tag-page" style={{ paddingTop: 52, paddingBottom: 80 }}>
        <Breadcrumb items={breadcrumbItems} />

        <section className="tag-page-hero">
          <h1 className="tag-page-title">
            <span>#</span>{tag.name}
          </h1>
          <p>{description}</p>
          <strong>
            {posts.length} {posts.length === 1 ? 'post etiquetado' : 'posts etiquetados'}
          </strong>
        </section>

        {posts.length === 0 ? (
          <EmptyState
            title="Sin articulos todavia"
            description="Esta etiqueta aun no tiene posts publicados."
          />
        ) : (
          <section className="tag-page-grid">
            <div className="tag-page-list">
              {posts.map((p) => (
                <ListRow
                  key={p.id}
                  category={primaryCategory(p)}
                  title={p.title}
                  excerpt={p.excerpt ?? undefined}
                  date={fmtDate(p.publishedAt)}
                  readTime={estimateReadTime(p.body)}
                  inSeries={Boolean(p.series)}
                  href={`/blog/${p.slug}`}
                  image={coverImageOf(p, 'thumbnail')}
                />
              ))}
            </div>

            {(relatedTags.length > 0 || categories.length > 0) && (
              <aside className="tag-page-aside" aria-label="Contexto del tag">
                {relatedTags.length > 0 && (
                  <div>
                    <div className="ab-toc-title">Tags relacionados</div>
                    <div className="tagrow">
                      {relatedTags.map((related) => (
                        <Tag key={related.id} slug={related.slug}>{related.name}</Tag>
                      ))}
                    </div>
                  </div>
                )}

                {categories.length > 0 && (
                  <div>
                    <div className="ab-toc-title">Aparece en categorias</div>
                    <div className="tag-page-cats">
                      {categories.map((category) => (
                        <a key={category.id} href={`/categorias/${category.slug}`}>
                          <Cat name={category.name} slug={category.slug} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            )}
          </section>
        )}
      </div>
    </>
  )
}
