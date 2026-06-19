import { Header } from '../../components/layout/Header'
import { Footer } from '../../components/layout/Footer'
import { PostCard } from '../../components/post/PostCard'
import { ListRow } from '../../components/post/ListRow'
import { Cat } from '../../components/ui/Cat'
import { Badge } from '../../components/ui/Badge'
import { Ic } from '../../components/ui/Ic'
import type { CatKey } from '../../components/ui/Cat'

/* ── section head helper ──────────────────────────────────────── */
function SectionHead({
  eyebrow,
  title,
  link,
}: {
  eyebrow?: string
  title: string
  link?: string
}) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>}
        <h2 style={{ fontSize: 26, fontWeight: 750, letterSpacing: '-.03em' }}>{title}</h2>
      </div>
      {link && (
        <a
          href="#"
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
  cat = 'frontend',
  progress,
}: {
  title: string
  desc: string
  count: number
  level: string
  cat?: CatKey
  progress?: number
}) {
  return (
    <article className="card card-hover" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <Badge variant="series" />
        <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--muted)' }}>
          {count} partes · {level}
        </span>
      </div>
      <Cat cat={cat} />
      <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.3 }}>{title}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-3)' }}>{desc}</p>
      {progress != null && (
        <div style={{ marginTop: 2 }}>
          <div className="progress-bar"><i style={{ width: `${progress}%` }} /></div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{progress}% completado</div>
        </div>
      )}
      <a
        href="#"
        style={{ marginTop: 'auto', paddingTop: 4, fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)' }}
      >
        {progress ? 'Continuar' : 'Empezar serie'}<Ic name="arrowRight" size={15} sw={2.2} />
      </a>
    </article>
  )
}

/* ── placeholder data (remove once CMS is wired up) ──────────── */
const FEATURED_POSTS = [
  {
    cat: 'ia' as CatKey,
    title: 'Conectar API de Notion a OpenClaw: dale ojos a tu agente',
    excerpt: 'Cómo exponer tu workspace de Notion a un agente vía API: tokens, scopes y un gateway minimalista.',
    tags: ['Notion', 'API', 'OpenClaw'],
    date: '12 mar 2026',
    readTime: '8 min',
    commentCount: 12,
    inSeries: true,
  },
  {
    cat: 'backend' as CatKey,
    title: 'Next.js + PostgreSQL: creando un blog personal rápido',
    excerpt: 'Guía práctica para montar un blog rápido y SEO-friendly con Next.js, PostgreSQL y Payload CMS.',
    tags: ['Next.js', 'PostgreSQL', 'Payload'],
    date: '5 mar 2026',
    readTime: '12 min',
    commentCount: 8,
  },
  {
    cat: 'frontend' as CatKey,
    title: 'Cómo migramos de Gatsby a Astro y por qué no lo lamentamos',
    excerpt: 'Un análisis honesto de la migración: velocidad de build, DX y lo que dejamos atrás.',
    tags: ['Astro', 'React', 'Performance'],
    date: '28 feb 2026',
    readTime: '10 min',
  },
]

const LATEST_POSTS = [
  { cat: 'devops' as CatKey, title: 'Docker Compose para desarrollo local sin dolor', date: '18 feb 2026', readTime: '7 min' },
  { cat: 'frontend' as CatKey, title: 'SEO técnico para blogs en Next.js App Router', date: '10 feb 2026', readTime: '9 min' },
  { cat: 'backend' as CatKey, title: 'Optimizar imágenes en Payload CMS con Sharp', date: '2 feb 2026', readTime: '6 min' },
  { cat: 'ia' as CatKey, title: 'OG images automáticas con @vercel/og y Edge Runtime', date: '25 ene 2026', readTime: '5 min', inSeries: true },
]

const CATS_HOME: { c: CatKey; n: number }[] = [
  { c: 'frontend',       n: 14 },
  { c: 'backend',        n: 21 },
  { c: 'bases-de-datos', n: 9  },
  { c: 'ia',             n: 12 },
  { c: 'devops',         n: 17 },
  { c: 'tutoriales',     n: 23 },
]

/* ── page ─────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      <Header activePath="/" />

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
        <SectionHead eyebrow="Lo más reciente" title="Posts destacados" link="Ver todo" />
        <div className="grid-posts">
          {FEATURED_POSTS.map((p) => <PostCard key={p.title} {...p} />)}
        </div>
      </section>

      {/* latest + categories */}
      <section className="wrap grid-latest" style={{ paddingBottom: 70 }}>
        <div>
          <SectionHead title="Últimas publicaciones" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {LATEST_POSTS.map((p) => <ListRow key={p.title} {...p} />)}
          </div>
        </div>
        <div>
          <SectionHead title="Categorías" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CATS_HOME.map(({ c, n }) => (
              <a key={c} className="card card-hover" href="#"
                style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Cat cat={c} lg />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)' }}>{n} posts</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* series */}
      <section className="bg-bg-soft border-t border-b border-line" style={{ padding: '60px 0' }}>
        <div className="wrap">
          <SectionHead eyebrow="Aprende paso a paso" title="Series recomendadas" link="Todas las series" />
          <div className="grid-series">
            <SeriesCard
              title="Construyendo un blog moderno con Next.js"
              desc="De cero a producción: rutas, datos, SEO y deploy."
              count={6} level="Intermedio" progress={50}
            />
            <SeriesCard
              title="PostgreSQL para proyectos personales"
              desc="Modelado, índices y consultas que escalan sin dolor."
              count={5} level="Básico" cat="bases-de-datos"
            />
            <SeriesCard
              title="Automatización con APIs e IA"
              desc="Conecta servicios y agentes para hacer el trabajo aburrido."
              count={4} level="Avanzado" cat="ia"
            />
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
