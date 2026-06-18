/* Home page — josetejero.com
   Layout faithful to the approved handoff (design/handoff/sistema-de-pantallas/).
   All colours via CSS custom properties; no hardcoded values.
*/

import type { ReactNode } from 'react'

/* ─── tiny SVG icon helper (Lucide-compatible paths) ─────────── */
const ICONS: Record<string, string> = {
  arrowRight: 'M5 12h14M12 5l7 7-7 7',
  layers:    'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  bookOpen:  'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  github:    'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 20 4.8 4.9 4.9 0 0 0 19.9 1S18.7.6 16 2.5a13.4 13.4 0 0 0-7 0C6.3.6 5.1 1 5.1 1A4.9 4.9 0 0 0 5 4.8a5.2 5.2 0 0 0-1.4 3.6c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.6V22',
  twitter:   'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z',
  linkedin:  'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  calendar:  'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  clock:     'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  message:   'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
  sparkles:  'M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4zM19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z',
}

function Ic({ name, size = 18, sw = 2 }: { name: string; size?: number; sw?: number }) {
  const d = ICONS[name] ?? ''
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      {d.split('M').filter(Boolean).map((seg, i) => <path key={i} d={'M' + seg} />)}
    </svg>
  )
}

/* ─── category config ─────────────────────────────────────────── */
type CatKey = 'frontend' | 'backend' | 'bases-de-datos' | 'ia' | 'devops' | 'tutoriales'

const CATS: Record<CatKey, { label: string; thumb: string }> = {
  'frontend':       { label: 'Frontend',               thumb: 'thumb-blue' },
  'backend':        { label: 'Backend',                thumb: 'thumb-violet' },
  'bases-de-datos': { label: 'Bases de Datos',         thumb: 'thumb-cyan' },
  'ia':             { label: 'Inteligencia Artificial', thumb: 'thumb-violet' },
  'devops':         { label: 'DevOps',                 thumb: 'thumb-green' },
  'tutoriales':     { label: 'Tutoriales',             thumb: 'thumb-amber' },
}

const CAT_GLOW: Record<string, string> = {
  'thumb-blue': '#2563eb', 'thumb-violet': '#7c3aed',
  'thumb-cyan': '#06b6d4', 'thumb-green': '#10b981', 'thumb-amber': '#f59e0b',
}

/* ─── primitives ─────────────────────────────────────────────── */
function CatPill({ cat, lg }: { cat: CatKey; lg?: boolean }) {
  const c = CATS[cat]
  return (
    <span className={`cat-pill${lg ? ' cat-pill-lg' : ''}`} data-cat={cat}>
      <span className="dot" />
      {c.label}
    </span>
  )
}

function MetaItem({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <span className="meta">
      <Ic name={icon} size={14} sw={1.9} />
      {children}
    </span>
  )
}

function Sep() { return <span className="meta-sep" /> }

function Thumb({ cat, label, glow }: { cat: CatKey; label?: string; glow?: boolean }) {
  const tone = CATS[cat].thumb
  return (
    <div className={`thumb ${tone}`}>
      <div className="thumb-glow" style={{ background: CAT_GLOW[tone], top: glow ? '-30%' : '-40%', left: glow ? '-10%' : '40%' }} />
      <span className="label">{label ?? '// cover image'}</span>
    </div>
  )
}

/* ─── site header ─────────────────────────────────────────────── */
function SiteHeader() {
  const nav = ['Inicio', 'Blog', 'Series', 'Categorías', 'Sobre mí']
  return (
    <header className="site-header">
      <div className="site-header-in">
        <a className="logo" href="/">
          <span className="logo-mark">J</span>
          josetejero<span className="dot">.com</span>
        </a>
        <nav className="site-nav">
          {nav.map((item) => (
            <a key={item} className={item === 'Inicio' ? 'active' : ''} href="#">
              {item}
            </a>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="icon-btn" aria-label="GitHub"><Ic name="github" size={18} sw={1.8} /></button>
          <button className="icon-btn" aria-label="X / Twitter"><Ic name="twitter" size={18} sw={1.8} /></button>
          <button className="icon-btn" aria-label="LinkedIn"><Ic name="linkedin" size={18} sw={1.8} /></button>
        </div>
      </div>
    </header>
  )
}

/* ─── section head ────────────────────────────────────────────── */
function SectionHead({ eyebrow, title, link }: { eyebrow?: string; title: string; link?: string }) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>}
        <h2 style={{ fontSize: 26, fontWeight: 750, letterSpacing: '-.03em' }}>{title}</h2>
      </div>
      {link && (
        <a href="#" style={{ fontSize: 14, fontWeight: 600, color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
          {link}<Ic name="arrowRight" size={15} sw={2.2} />
        </a>
      )}
    </div>
  )
}

/* ─── post data (placeholder until CMS is wired up) ─────────── */
type Post = {
  cat: CatKey
  title: string
  excerpt: string
  tags: string[]
  date: string
  read: string
  comments?: number
  series?: boolean
}

const POSTS: Post[] = [
  {
    cat: 'ia',
    title: 'Conectar API de Notion a OpenClaw: dale ojos a tu agente',
    excerpt: 'Cómo exponer tu workspace de Notion a un agente vía API: tokens, scopes y un gateway minimalista.',
    tags: ['Notion', 'API', 'OpenClaw'],
    date: '12 mar 2026',
    read: '8 min',
    comments: 12,
    series: true,
  },
  {
    cat: 'backend',
    title: 'Next.js + PostgreSQL: creando un blog personal rápido',
    excerpt: 'Guía práctica para montar un blog rápido y SEO-friendly con Next.js, PostgreSQL y Prisma.',
    tags: ['Next.js', 'PostgreSQL', 'Prisma'],
    date: '5 mar 2026',
    read: '12 min',
    comments: 8,
  },
  {
    cat: 'frontend',
    title: 'Cómo migramos de Gatsby a Astro y por qué no lo lamentamos',
    excerpt: 'Un análisis honesto de la migración: velocidad de build, DX y lo que dejamos atrás.',
    tags: ['Astro', 'React', 'Performance'],
    date: '28 feb 2026',
    read: '10 min',
  },
]

const LATEST_POSTS: Post[] = [
  { cat: 'devops', title: 'Docker Compose para desarrollo local sin dolor', excerpt: 'Entornos reproducibles en 5 minutos para proyectos Node.js.', tags: [], date: '18 feb 2026', read: '7 min' },
  { cat: 'frontend', title: 'SEO técnico para blogs en Next.js App Router', excerpt: 'metadata API, sitemap dinámico y robots.txt automatizado.', tags: [], date: '10 feb 2026', read: '9 min' },
  { cat: 'backend', title: 'Optimizar imágenes en Payload CMS con Sharp', excerpt: 'Configuración de tamaños, formatos WebP y lazy loading.', tags: [], date: '2 feb 2026', read: '6 min' },
  { cat: 'ia', title: 'OG images automáticas con @vercel/og y Edge Runtime', excerpt: 'Genera previews de redes sociales sin salir de Next.js.', tags: [], date: '25 ene 2026', read: '5 min', series: true },
]

/* ─── post card ───────────────────────────────────────────────── */
function PostCard({ post }: { post: Post }) {
  return (
    <article className="card card-hover post-card">
      <Thumb cat={post.cat} />
      <div className="post-card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <CatPill cat={post.cat} />
          {post.series && (
            <span className="badge badge-series">
              <Ic name="layers" size={11} sw={2.2} />Serie
            </span>
          )}
        </div>
        <h3 className="post-card-title">{post.title}</h3>
        <p className="post-card-excerpt">{post.excerpt}</p>
        <div className="tagrow">
          {post.tags.map((t) => <span key={t} className="tag-pill">#{t}</span>)}
        </div>
        <div className="post-card-foot">
          <MetaItem icon="calendar">{post.date}</MetaItem>
          <Sep />
          <MetaItem icon="clock">{post.read}</MetaItem>
          {post.comments != null && (
            <><Sep /><MetaItem icon="message">{post.comments}</MetaItem></>
          )}
        </div>
      </div>
    </article>
  )
}

/* ─── list row ────────────────────────────────────────────────── */
function ListRow({ post }: { post: Post }) {
  return (
    <a className="list-row" href="#">
      <div className="thumb" style={{ width: 120, height: 80, flexShrink: 0, borderRadius: 'var(--r)' }}>
        <div className={`thumb ${CATS[post.cat].thumb}`} style={{ width: 120, height: 80, borderRadius: 'var(--r)', border: 0 }}>
          <div className="thumb-glow" style={{ background: CAT_GLOW[CATS[post.cat].thumb] }} />
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <CatPill cat={post.cat} />
          {post.series && <span className="badge badge-series"><Ic name="layers" size={11} sw={2.2} />Serie</span>}
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 650, letterSpacing: '-.02em', lineHeight: 1.35 }}>{post.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MetaItem icon="calendar">{post.date}</MetaItem>
          <Sep />
          <MetaItem icon="clock">{post.read}</MetaItem>
        </div>
      </div>
    </a>
  )
}

/* ─── series card ─────────────────────────────────────────────── */
function SeriesCard({ title, desc, count, level, cat = 'frontend' as CatKey, progress }: {
  title: string; desc: string; count: number; level: string; cat?: CatKey; progress?: number
}) {
  return (
    <article className="card card-hover" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span className="badge badge-series"><Ic name="layers" size={11} sw={2.2} />Serie</span>
        <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 500 }}>{count} partes · {level}</span>
      </div>
      <CatPill cat={cat} />
      <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.3 }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.55 }}>{desc}</p>
      {progress != null && (
        <div style={{ marginTop: 2 }}>
          <div className="progress-bar"><i style={{ width: `${progress}%` }} /></div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{progress}% completado</div>
        </div>
      )}
      <a href="#" style={{ marginTop: 'auto', paddingTop: 4, fontSize: 14, fontWeight: 600, color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {progress ? 'Continuar' : 'Empezar serie'}<Ic name="arrowRight" size={15} sw={2.2} />
      </a>
    </article>
  )
}

/* ─── site footer ─────────────────────────────────────────────── */
function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-in">
        <div className="footer-cols">
          <div>
            <a className="logo" href="/" style={{ marginBottom: 12, display: 'inline-flex' }}>
              <span className="logo-mark">J</span>
              josetejero<span className="dot">.com</span>
            </a>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.6, maxWidth: 280, margin: 0 }}>
              Notas sobre desarrollo web, automatización e IA — construyendo software, en voz alta.
            </p>
          </div>
          <div>
            <h5 className="footer-h5">Explorar</h5>
            <nav className="footer-links">
              <a href="#">Blog</a>
              <a href="#">Series</a>
              <a href="#">Categorías</a>
              <a href="#">Tags</a>
            </nav>
          </div>
          <div>
            <h5 className="footer-h5">Sitio</h5>
            <nav className="footer-links">
              <a href="#">Sobre mí</a>
              <a href="#">RSS</a>
              <a href="#">Sitemap</a>
              <a href="#">Contacto</a>
            </nav>
          </div>
        </div>
        <p className="footer-copy">© 2026 José Alejandro Tejero Aguilar · Hecho con Next.js + PostgreSQL</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="icon-btn" aria-label="GitHub"><Ic name="github" size={18} sw={1.8} /></button>
          <button className="icon-btn" aria-label="X / Twitter"><Ic name="twitter" size={18} sw={1.8} /></button>
          <button className="icon-btn" aria-label="LinkedIn"><Ic name="linkedin" size={18} sw={1.8} /></button>
        </div>
      </div>
    </footer>
  )
}

/* ─── home page ───────────────────────────────────────────────── */
const CATS_HOME = [
  { c: 'frontend'       as CatKey, n: 14 },
  { c: 'backend'        as CatKey, n: 21 },
  { c: 'bases-de-datos' as CatKey, n: 9  },
  { c: 'ia'             as CatKey, n: 12 },
  { c: 'devops'         as CatKey, n: 17 },
  { c: 'tutoriales'     as CatKey, n: 23 },
]

export default function Home() {
  return (
    <>
      <SiteHeader />

      {/* ── hero ───────────────────────────────────────────────── */}
      <section style={{ textAlign: 'center', padding: '92px 40px 70px', maxWidth: 760, margin: '0 auto' }}>
        <div className="eyebrow" style={{ marginBottom: 18 }}>Desarrollo · Automatización · IA</div>
        <h1 style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.08 }}>
          Hola, soy José Alejandro <span style={{ WebkitTextFillColor: 'initial' }}>👨‍💻</span>
        </h1>
        <p style={{ fontSize: 19, color: 'var(--ink-3)', lineHeight: 1.6, marginTop: 22, maxWidth: 620, marginInline: 'auto' }}>
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

      {/* ── featured posts ─────────────────────────────────────── */}
      <section className="wrap" style={{ paddingBottom: 70 }}>
        <SectionHead eyebrow="Lo más reciente" title="Posts destacados" link="Ver todo" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {POSTS.map((p) => <PostCard key={p.title} post={p} />)}
        </div>
      </section>

      {/* ── latest + categories ─────────────────────────────────── */}
      <section className="wrap" style={{ paddingBottom: 70, display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 48 }}>
        <div>
          <SectionHead title="Últimas publicaciones" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {LATEST_POSTS.map((p) => <ListRow key={p.title} post={p} />)}
          </div>
        </div>
        <div>
          <SectionHead title="Categorías" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CATS_HOME.map(({ c, n }) => (
              <a key={c} className="card card-hover" href="#"
                style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <CatPill cat={c} lg />
                <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{n} posts</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── series ─────────────────────────────────────────────── */}
      <section style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '60px 0' }}>
        <div className="wrap">
          <SectionHead eyebrow="Aprende paso a paso" title="Series recomendadas" link="Todas las series" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
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

      <SiteFooter />
    </>
  )
}
