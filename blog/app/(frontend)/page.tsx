import { PostCard } from '../../components/post/PostCard'
import { ListRow } from '../../components/post/ListRow'
import { Cat } from '../../components/ui/Cat'
import { Badge } from '../../components/ui/Badge'
import { Ic } from '../../components/ui/Ic'
import type { CatInfo } from '../../components/ui/Cat'
import { getPosts, getCategories, getSeriesList } from '../../lib/data'
import type { Post, Category, Tag as TagType } from '../../payload-types'

/* ── section head helper ──────────────────────────────────────── */
function SectionHead({
  eyebrow,
  title,
  link,
  linkHref,
}: {
  eyebrow?: string
  title: string
  link?: string
  linkHref?: string
}) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>}
        <h2 style={{ fontSize: 26, fontWeight: 750, letterSpacing: '-.03em' }}>{title}</h2>
      </div>
      {link && linkHref && (
        <a
          href={linkHref}
          style={{ fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', color: 'var(--blue)' }}
        >
          {link}<Ic name="arrowRight" size={15} sw={2.2} />
        </a>
      )}
    </div>
  )
}

/* ── series card (home variant) ───────────────────────────────── */
function SeriesCard({
  title,
  desc,
  count,
  level,
  progress,
  href = '#',
}: {
  title: string
  desc: string
  count?: number
  level?: string
  progress?: number
  href?: string
}) {
  return (
    <article className="card card-hover" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <Badge variant="series" />
        {count != null && level && (
          <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--muted)' }}>
            {count} partes · {level}
          </span>
        )}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.3 }}>{title}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-3)' }}>{desc}</p>
      {progress != null && (
        <div style={{ marginTop: 2 }}>
          <div className="progress-bar"><i style={{ width: `${progress}%` }} /></div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{progress}% completado</div>
        </div>
      )}
      <a
        href={href}
        style={{ marginTop: 'auto', paddingTop: 4, fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)' }}
      >
        {progress ? 'Continuar' : 'Empezar serie'}<Ic name="arrowRight" size={15} sw={2.2} />
      </a>
    </article>
  )
}

/* ── helpers ──────────────────────────────────────────────────── */
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

/* ── page ─────────────────────────────────────────────────────── */
export default async function Home() {
  const [{ docs: allPosts }, categories, seriesList] = await Promise.all([
    getPosts(7),
    getCategories(),
    getSeriesList(),
  ])

  const featuredPosts = allPosts.slice(0, 3)
  const latestPosts = allPosts.slice(3, 7)

  return (
    <>
      {/* hero */}
      <section style={{ textAlign: 'center', padding: '92px 40px 70px', maxWidth: 760, margin: '0 auto' }}>
        <div className="eyebrow" style={{ marginBottom: 18 }}>Desarrollo · Automatización · IA</div>
        <h1 style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.08 }}>
          Hola, soy José Alejandro <span style={{ WebkitTextFillColor: 'initial' }}>👨‍💻</span>
        </h1>
        <p style={{ fontSize: 19, lineHeight: 1.6, marginTop: 22, maxWidth: 620, marginInline: 'auto', color: 'var(--ink-3)' }}>
          Escribo sobre desarrollo web, automatización, inteligencia artificial, backend, frontend
          y aprendizajes construyendo software.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 34 }}>
          <a href="/blog" className="btn btn-grad">
            <Ic name="bookOpen" size={16} sw={2} />Leer el blog
          </a>
          <a href="/series" className="btn btn-secondary">
            <Ic name="layers" size={16} sw={2} />Ver series
          </a>
        </div>
      </section>

      {/* featured posts */}
      <section className="wrap" style={{ paddingBottom: 70 }}>
        <SectionHead eyebrow="Lo más reciente" title="Posts destacados" link="Ver todo" linkHref="/blog" />
        <div className="grid-posts">
          {featuredPosts.map((p) => (
            <PostCard
              key={p.id}
              category={primaryCategory(p)}
              title={p.title}
              excerpt={p.excerpt ?? ''}
              tags={postTags(p)}
              date={fmtDate(p.publishedAt)}
              readTime={estimateReadTime(p.body)}
              href={`/blog/${p.slug}`}
            />
          ))}
        </div>
      </section>

      {/* latest + categories */}
      <section className="wrap grid-latest" style={{ paddingBottom: 70 }}>
        <div>
          <SectionHead title="Últimas publicaciones" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {latestPosts.map((p) => (
              <ListRow
                key={p.id}
                category={primaryCategory(p)}
                title={p.title}
                date={fmtDate(p.publishedAt)}
                readTime={estimateReadTime(p.body)}
                href={`/blog/${p.slug}`}
              />
            ))}
          </div>
        </div>
        <div>
          <SectionHead title="Categorías" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {categories.map((cat) => (
              <a key={cat.id} className="card card-hover" href={`/categorias/${cat.slug}`}
                style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Cat name={cat.name} slug={cat.slug} lg />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* series */}
      <section className="bg-bg-soft border-t border-b border-line" style={{ padding: '60px 0' }}>
        <div className="wrap">
          <SectionHead eyebrow="Aprende paso a paso" title="Series recomendadas" link="Todas las series" linkHref="/series" />
          <div className="grid-series">
            {seriesList.slice(0, 3).map((s) => (
              <SeriesCard
                key={s.id}
                title={s.title}
                desc={s.description ?? ''}
                href={`/series/${s.slug}`}
              />
            ))}
          </div>
        </div>
      </section>

    </>
  )
}
