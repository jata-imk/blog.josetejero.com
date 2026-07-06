import { PostCard } from '../../../components/post/PostCard'
import { FeaturedCard } from '../../../components/post/FeaturedCard'
import { Pagination } from '../../../components/ui/Pagination'
import { Breadcrumb } from '../../../components/ui/Breadcrumb'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Ic } from '../../../components/ui/Ic'
import { BlogSearchForm } from '../../../components/search/BlogSearchForm'
import { SortSelect } from '../../../components/blog/SortSelect'
import type { Metadata } from 'next'
import {
  getPosts,
  getFeaturedPost,
  getCategories,
  getPopularTags,
} from '../../../lib/data'
import { coverImageOf } from '../../../lib/media'
import { alternatesFor } from '../../../lib/seo'
import type { Post, Category, Tag as TagType } from '../../../payload-types'
import type { CatInfo } from '../../../components/ui/Cat'

const POSTS_PER_PAGE = 12

/* ============================================================
   Metadata del listado (ADR 0029) — el caso con paginación/filtros.

   Estrategia de canonicals:
   - Cada página de paginación es SU PROPIA canonical (/blog?page=2
     → canonical /blog?page=2). Es la recomendación de Google: cada
     página del listado tiene contenido distinto, no son duplicados.
   - Los filtros (?cat=, ?tag=, ?sort=) NO entran a la canonical:
     una vista filtrada muestra un subconjunto que ya existe en
     /categorias/[slug] y /tags/[slug] — esas son las URLs oficiales
     de ese contenido, y así el crédito de búsqueda no se fragmenta.
   ============================================================ */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}): Promise<Metadata> {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam ?? 1))

  return {
    // "Página N" distingue los títulos en resultados de búsqueda y
    // evita que Google vea títulos idénticos en URLs distintas
    title: page > 1 ? `Blog — Página ${page}` : 'Blog',
    description:
      'Artículos sobre desarrollo web, bases de datos, IA y las cosas que voy aprendiendo al construir software.',
    alternates: alternatesFor(page > 1 ? `/blog?page=${page}` : '/blog'),
  }
}

function primaryCategory(post: Post): CatInfo | null {
  const cats = (post.categories ?? []) as Array<number | Category>
  const obj = cats.find((c): c is Category => typeof c === 'object' && c !== null)
  return obj ? { name: obj.name, slug: obj.slug } : null
}

function fmtDate(iso?: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
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

function buildHref(params: {
  page?: number
  cat?: string
  tag?: string
  sort?: '-publishedAt' | 'publishedAt'
}): string {
  const p = new URLSearchParams()
  if (params.cat) p.set('cat', params.cat)
  if (params.tag) p.set('tag', params.tag)
  if (params.sort && params.sort !== '-publishedAt') p.set('sort', params.sort)
  if (params.page && params.page > 1) p.set('page', String(params.page))
  const qs = p.toString()
  return qs ? `/blog?${qs}` : '/blog'
}

const breadcrumbItems = [{ label: 'Inicio', href: '/' }, { label: 'Blog' }]

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; cat?: string; tag?: string; sort?: string }>
}) {
  const { page: pageParam, cat, tag, sort: sortParam } = await searchParams
  const page = Math.max(1, Number(pageParam ?? 1))
  const sort: '-publishedAt' | 'publishedAt' =
    sortParam === 'publishedAt' ? 'publishedAt' : '-publishedAt'
  const hasFilter = Boolean(cat || tag)

  const [{ docs: posts, totalPages, totalDocs }, featuredPost, categories, popularTags] =
    await Promise.all([
      getPosts({ limit: POSTS_PER_PAGE, page, category: cat, tag, sort, excludeFeatured: !hasFilter }),
      hasFilter ? Promise.resolve(null) : getFeaturedPost(),
      getCategories(),
      getPopularTags(10),
    ])

  return (
    <>
      {/* ── Hero: título + buscador + filtros ─────────── */}
      <section style={{ paddingTop: 52, paddingBottom: 28 }}>
        <div className="wrap">
          <Breadcrumb items={breadcrumbItems} />

          <div style={{ marginTop: 28 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Todos los artículos</div>
            <h1
              style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.1 }}
            >
              Blog
            </h1>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.6,
                marginTop: 14,
                maxWidth: 560,
                color: 'var(--ink-3)',
              }}
            >
              Artículos sobre desarrollo web, bases de datos, IA y las cosas que voy aprendiendo al
              construir software.
            </p>
          </div>

          <div style={{ marginTop: 24 }}>
            <BlogSearchForm />
          </div>

          {/* Tabs de categoría */}
          <div
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}
            role="navigation"
            aria-label="Filtrar por categoría"
          >
            <a href="/blog" className={`ab-chip${!cat ? ' active' : ''}`}>
              Todos
            </a>
            {categories.map((c) => (
              <a
                key={c.id}
                href={buildHref({ cat: c.slug, tag, sort })}
                className={`ab-chip${cat === c.slug ? ' active' : ''}`}
              >
                {c.name}
              </a>
            ))}
          </div>

          {/* Tags populares */}
          {popularTags.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                flexWrap: 'wrap',
                marginTop: 14,
              }}
            >
              <span
                style={{
                  fontSize: 12.5,
                  color: 'var(--muted)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <Ic name="sparkles" size={14} sw={2.2} />
                Tags populares
              </span>
              {popularTags.map((t) => (
                <a
                  key={t.id}
                  href={buildHref({ tag: t.slug, cat, sort })}
                  className="tag-pill"
                  style={
                    tag === t.slug
                      ? { background: 'var(--blue-tint)', color: 'var(--blue)' }
                      : undefined
                  }
                >
                  #{t.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Post destacado (solo sin filtros activos) ─── */}
      {featuredPost && (
        <section style={{ paddingBottom: 28 }}>
          <div className="wrap">
            <FeaturedCard
              category={primaryCategory(featuredPost)}
              title={featuredPost.title}
              excerpt={featuredPost.excerpt ?? ''}
              date={fmtDate(featuredPost.publishedAt)}
              readTime={estimateReadTime(featuredPost.body)}
              href={`/blog/${featuredPost.slug}`}
              image={coverImageOf(featuredPost, 'card')}
            />
          </div>
        </section>
      )}

      {/* ── Grid de artículos ─────────────────────────── */}
      <section style={{ paddingBottom: 80 }}>
        <div className="wrap">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 22,
              gap: 16,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>
              Todos los artículos{' '}
              <span style={{ color: 'var(--muted)', fontWeight: 500 }}>· {totalDocs}</span>
            </h2>
            <SortSelect sort={sort} cat={cat} tag={tag} />
          </div>

          {posts.length === 0 ? (
            <EmptyState
              icon="search"
              title="Sin resultados"
              description={
                hasFilter
                  ? 'No hay artículos con los filtros seleccionados. Prueba otra combinación.'
                  : 'Todavía no hay artículos publicados.'
              }
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
                  inSeries={Boolean(p.series)}
                  href={`/blog/${p.slug}`}
                  image={coverImageOf(p, 'card')}
                  priority={i === 0}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ marginTop: 52, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                getHref={(p) => buildHref({ page: p, cat, tag, sort })}
              />
            </div>
          )}
        </div>
      </section>

    </>
  )
}
