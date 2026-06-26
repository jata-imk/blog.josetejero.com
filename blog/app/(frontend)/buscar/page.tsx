import { Suspense } from 'react'
import { SearchPageBar } from '../../../components/search/SearchPageBar'
import { Cat } from '../../../components/ui/Cat'
import { Tag } from '../../../components/ui/Tag'
import { Ic } from '../../../components/ui/Ic'
import { Badge } from '../../../components/ui/Badge'
import { Meta, MetaSep } from '../../../components/ui/Meta'
import { Thumb } from '../../../components/ui/Thumb'
import { EmptyState } from '../../../components/ui/EmptyState'
import { searchAll, getPostsInSeries, normalizeScope } from '../../../lib/data'
import type { Post, Series, Tag as TagType, Category } from '../../../payload-types'
import type { CatKey } from '../../../components/ui/Cat'

type SearchParams = Promise<{ q?: string; scope?: string }>

function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

function estimateRead(body: Post['body']): string {
  const raw = JSON.stringify(body ?? '')
  return `${Math.max(1, Math.round(raw.length / 1400))} min`
}

function primaryCat(post: Post): CatKey {
  const cats = (post.categories ?? []) as Array<number | Category>
  const obj = cats.find((c): c is Category => typeof c === 'object' && c !== null)
  return (obj?.slug as CatKey | undefined) ?? 'tutoriales'
}

function inSeries(post: Post): boolean {
  return !!post.series
}

/* ── scope tab nav ── */
type Tab = { label: string; scope: string; count: number }

function ScopeTabs({
  q,
  current,
  tabs,
}: {
  q: string
  current: string
  tabs: Tab[]
}) {
  function href(scope: string) {
    if (!q) return '/buscar'
    const base = `/buscar?q=${encodeURIComponent(q)}`
    return scope === 'all' ? base : `${base}&scope=${scope}`
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      flexWrap: 'wrap', marginTop: 24,
    }}>
      {tabs.map((t) => {
        const active = t.scope === current
        return (
          <a
            key={t.scope}
            href={href(t.scope)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 16px',
              borderRadius: 999,
              fontSize: 14, fontWeight: 600,
              textDecoration: 'none',
              background: active ? 'var(--ink)' : 'transparent',
              color: active ? 'var(--on-accent)' : 'var(--ink-3)',
              border: `1px solid ${active ? 'var(--ink)' : 'var(--line-2)'}`,
              transition: 'all .15s',
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{
                fontSize: 11.5, fontWeight: 700,
                background: active ? 'rgba(255,255,255,.2)' : 'var(--bg-soft-2)',
                color: active ? 'var(--on-accent)' : 'var(--muted)',
                padding: '1px 7px', borderRadius: 999,
                minWidth: 22, textAlign: 'center',
              }}>
                {t.count}
              </span>
            )}
          </a>
        )
      })}
    </div>
  )
}

/* ── section header ── */
function SectionHead({ label, count }: { label: string; count: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      marginBottom: 16, paddingBottom: 10,
      borderBottom: '1px solid var(--line)',
    }}>
      <span className="eyebrow">{label}</span>
      <span style={{
        fontSize: 12.5, fontWeight: 700,
        color: 'var(--muted)',
        background: 'var(--bg-soft-2)',
        padding: '2px 8px', borderRadius: 999,
      }}>{count}</span>
    </div>
  )
}

/* ── post list row (adapted to /buscar layout) ── */
function PostRow({ post }: { post: Post }) {
  const cat = primaryCat(post)
  return (
    <a className="list-row" href={`/blog/${post.slug}`} style={{ borderRadius: 'var(--r)' }}>
      <Thumb cat={cat} style={{ width: 96, height: 64, flexShrink: 0, borderRadius: 'var(--r)', border: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Cat cat={cat} />
          {inSeries(post) && <Badge variant="series" />}
        </div>
        <h3 style={{ fontSize: 15.5, fontWeight: 650, letterSpacing: '-.02em', lineHeight: 1.35, margin: 0 }}>
          {post.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Meta icon="calendar">{fmtDate(post.publishedAt)}</Meta>
          <MetaSep />
          <Meta icon="clock">{estimateRead(post.body)}</Meta>
        </div>
      </div>
    </a>
  )
}

/* ── series row ── */
function SeriesRow({ series, count }: { series: Series; count: number }) {
  return (
    <a
      href={`/series/${series.slug}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 16px', borderRadius: 'var(--r)',
        textDecoration: 'none', transition: 'background .15s',
      }}
      className="list-row"
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: 'var(--violet-tint)', border: '1px solid var(--line)',
        display: 'grid', placeItems: 'center', color: 'var(--violet)',
      }}>
        <Ic name="layers" size={18} sw={1.8} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15.5, fontWeight: 650, letterSpacing: '-.02em', lineHeight: 1.3 }}>
          {series.title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 3 }}>
          {count} {count === 1 ? 'parte' : 'partes'}
        </div>
      </div>
    </a>
  )
}

/* ── empty / no-results ── */
function NoQuery() {
  return (
    <div style={{ paddingTop: 48, textAlign: 'center' }}>
      <EmptyState
        icon="search"
        title="¿Qué estás buscando?"
        description="Escribe al menos 2 caracteres para buscar artículos, series, tags o categorías."
      />
    </div>
  )
}

function NoResults({ q }: { q: string }) {
  return (
    <div style={{ paddingTop: 48, textAlign: 'center' }}>
      <EmptyState
        icon="frown"
        title={`Sin resultados para «${q}»`}
        description="Prueba con otros términos o una búsqueda más corta."
      />
    </div>
  )
}

/* ── page ── */
export default async function BuscarPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = '', scope: rawScope } = await searchParams
  const scope = normalizeScope(rawScope)
  const activeScope = scope

  let posts: Post[] = []
  let series: Series[] = []
  let tags: TagType[] = []
  let categories: Category[] = []
  let seriesPostCounts: Record<number, number> = {}
  let counts = { posts: 0, series: 0, categories: 0, tags: 0 }

  const hasQuery = q.trim().length >= 2

  if (hasQuery) {
    const results = await searchAll(q, scope)
    posts = results.groups.posts
    series = results.groups.series
    tags = results.groups.tags
    categories = results.groups.categories
    counts = results.counts

    if (series.length > 0) {
      const postCounts = await Promise.all(
        series.map((s) => getPostsInSeries(s.id).then((p) => ({ id: s.id, count: p.length })))
      )
      seriesPostCounts = Object.fromEntries(postCounts.map((c) => [c.id, c.count]))
    }
  }

  const totalAll = counts.posts + counts.series + counts.categories + counts.tags

  const tabs: Tab[] = [
    { label: 'Todo',        scope: 'all',        count: totalAll },
    { label: 'Posts',       scope: 'posts',      count: counts.posts },
    { label: 'Series',      scope: 'series',     count: counts.series },
    { label: 'Tags',        scope: 'tags',       count: counts.tags },
    { label: 'Categorías',  scope: 'categories', count: counts.categories },
  ]

  const showPosts = (scope === 'all' || scope === 'posts') && posts.length > 0
  const showSeries = (scope === 'all' || scope === 'series') && series.length > 0
  const showTags = (scope === 'all' || scope === 'tags') && tags.length > 0
  const showCats = (scope === 'all' || scope === 'categories') && categories.length > 0

  return (
    <>
      <div className="wrap" style={{ paddingTop: 56, paddingBottom: 96 }}>
        {/* ── hero search area ── */}
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{
            fontSize: 40, fontWeight: 800, letterSpacing: '-.04em',
            lineHeight: 1.1, marginBottom: 28,
          }}>
            Buscar
          </h1>

          <Suspense>
            <SearchPageBar />
          </Suspense>

          {hasQuery && (
            <ScopeTabs q={q} current={activeScope} tabs={tabs} />
          )}
        </div>

        {/* ── results ── */}
        <div style={{ marginTop: 52 }}>
          {!hasQuery && <NoQuery />}

          {hasQuery && totalAll === 0 && <NoResults q={q} />}

          {hasQuery && totalAll > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>

              {showPosts && (
                <section>
                  <SectionHead label="Posts" count={counts.posts} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {posts.map((p) => <PostRow key={p.id} post={p} />)}
                  </div>
                </section>
              )}

              {showSeries && (
                <section>
                  <SectionHead label="Series" count={counts.series} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {series.map((s) => (
                      <SeriesRow key={s.id} series={s} count={seriesPostCounts[s.id] ?? 0} />
                    ))}
                  </div>
                </section>
              )}

              {showTags && (
                <section>
                  <SectionHead label="Tags" count={counts.tags} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {tags.map((t) => (
                      <a key={t.id} href={`/tags/${t.slug}`} style={{ textDecoration: 'none' }}>
                        <Tag>{t.name}</Tag>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {showCats && (
                <section>
                  <SectionHead label="Categorías" count={counts.categories} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {categories.map((c) => (
                      <a key={c.id} href={`/categorias/${c.slug}`} style={{ textDecoration: 'none' }}>
                        <Cat cat={c.slug as CatKey} />
                      </a>
                    ))}
                  </div>
                </section>
              )}

            </div>
          )}
        </div>
      </div>

    </>
  )
}
