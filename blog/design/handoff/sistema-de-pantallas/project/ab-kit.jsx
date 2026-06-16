/* ============================================================
   Aleliz Blog — Kit part 1: icons, data, primitives, header,
   footer, thumbnails, chips, buttons, post cards.
   Exports everything to window for cross-script use.
   ============================================================ */

/* ---------- Lucide-style icon set (stroke, 24x24) ---------- */
const AB_ICONS = {
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  github: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 20 4.8 4.9 4.9 0 0 0 19.9 1S18.7.6 16 2.5a13.4 13.4 0 0 0-7 0C6.3.6 5.1 1 5.1 1A4.9 4.9 0 0 0 5 4.8a5.2 5.2 0 0 0-1.4 3.6c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.6V22',
  twitter: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z',
  linkedin: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  arrowRight: 'M5 12h14M12 5l7 7-7 7',
  arrowLeft: 'M19 12H5M12 19l-7-7 7-7',
  chevronRight: 'M9 18l6-6-6-6',
  chevronDown: 'M6 9l6 6 6-6',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  refresh: 'M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  message: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
  copy: 'M20 9H11a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  check: 'M20 6L9 17l-5-5',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
  lightbulb: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z',
  alert: 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01',
  layers: 'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  tag: 'M20.6 13.4 12 22l-9-9V3h10l8 8a1.9 1.9 0 0 1-.4 2.4zM7 7h.01',
  folder: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  filter: 'M22 3H2l8 9.5V19l4 2v-8.5L22 3z',
  fileText: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  home: 'M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  hash: 'M4 9h16M4 15h16M10 3 8 21M16 3l-2 18',
  bookOpen: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  trending: 'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6',
  sparkles: 'M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4zM19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 7l-10 6L2 7',
  menu: 'M3 12h18M3 6h18M3 18h18',
  reply: 'M9 17l-5-5 5-5M4 12h11a5 5 0 0 1 5 5v1',
  external: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4z',
  frown: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 15s1.5-2 4-2 4 2 4 2M9 9h.01M15 9h.01',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  link: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
  briefcase: 'M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2',
};

function Ic({ name, size = 18, sw = 2, style, className }) {
  const d = AB_ICONS[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      {(d || '').split('M').filter(Boolean).map((seg, i) => <path key={i} d={'M' + seg} />)}
    </svg>
  );
}

/* ---------- category registry ---------- */
const AB_CATS = {
  'frontend':       { label: 'Frontend',          slug: 'frontend',       thumb: 't-blue' },
  'backend':        { label: 'Backend',           slug: 'backend',        thumb: 't-violet' },
  'bases-de-datos': { label: 'Bases de Datos',     slug: 'bases-de-datos', thumb: 't-cyan' },
  'ia':             { label: 'Inteligencia Artificial', slug: 'ia',        thumb: 't-violet' },
  'devops':         { label: 'DevOps',             slug: 'devops',         thumb: 't-green' },
  'tutoriales':     { label: 'Tutoriales',         slug: 'tutoriales',     thumb: 't-amber' },
  'opinion':        { label: 'Opinión',            slug: 'opinion',        thumb: 't-mix' },
};

/* ---------- Thumb (placeholder cover) ---------- */
function Thumb({ cat = 'frontend', label, style, className = '', glow }) {
  const tone = (AB_CATS[cat] || AB_CATS.frontend).thumb;
  const glowColors = { 't-blue':'#2563eb','t-violet':'#7c3aed','t-cyan':'#06b6d4','t-green':'#10b981','t-amber':'#f59e0b','t-mix':'#7c3aed' };
  return (
    <div className={`ab-thumb ${tone} ${className}`} style={style}>
      <div className="ab-thumb-glow" style={{ background: glowColors[tone], top: glow ? '-30%' : '-40%', left: glow ? '-10%' : '40%' }} />
      <span className="label">{label || '// cover image'}</span>
    </div>
  );
}

/* ---------- header / footer ---------- */
function Header({ active = 'Inicio', items = ['Inicio','Blog','Series','Categorías','Sobre mí'], compact }) {
  return (
    <header className="ab-header">
      <div className="ab-header-in" style={compact ? { gap: 14 } : null}>
        <a className="ab-logo">
          <span className="ab-logo-mark">A</span>
          Aleliz <span className="dot">Blog</span>
        </a>
        <nav className="ab-nav">
          {items.map((it) => <a key={it} className={it === active ? 'active' : ''}>{it}</a>)}
        </nav>
        <div className="ab-social">
          <button className="ab-icon-btn" aria-label="GitHub"><Ic name="github" size={18} sw={1.8} /></button>
          <button className="ab-icon-btn" aria-label="X"><Ic name="twitter" size={18} sw={1.8} /></button>
          <button className="ab-icon-btn" aria-label="LinkedIn"><Ic name="linkedin" size={18} sw={1.8} /></button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="ab-footer">
      <div className="ab-footer-in">
        <div className="ab-footer-cols">
          <div>
            <a className="ab-logo" style={{ marginBottom: 12 }}><span className="ab-logo-mark">A</span>Aleliz <span className="dot">Blog</span></a>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.6, maxWidth: 280 }}>
              Notas sobre desarrollo web, automatización e IA — construyendo software, en voz alta.
            </p>
          </div>
          <div>
            <h5>Explorar</h5>
            <div className="ab-footer-links"><a>Blog</a><a>Series</a><a>Categorías</a><a>Tags</a></div>
          </div>
          <div>
            <h5>Sitio</h5>
            <div className="ab-footer-links"><a>Sobre mí</a><a>RSS</a><a>Sitemap</a><a>Contacto</a></div>
          </div>
        </div>
        <p className="ab-copy">© 2026 José Alejandro Tejero Aguilar · Hecho con Next.js + PostgreSQL</p>
        <div className="ab-social">
          <button className="ab-icon-btn"><Ic name="github" size={18} sw={1.8} /></button>
          <button className="ab-icon-btn"><Ic name="twitter" size={18} sw={1.8} /></button>
          <button className="ab-icon-btn"><Ic name="linkedin" size={18} sw={1.8} /></button>
        </div>
      </div>
    </footer>
  );
}

/* ---------- small primitives ---------- */
function Cat({ cat, lg, dot = true }) {
  const c = AB_CATS[cat] || AB_CATS.frontend;
  return <span className={`ab-cat ${lg ? 'ab-cat-lg' : ''}`} data-cat={cat}>{dot && <span className="ab-cat-dot" />}{c.label}</span>;
}
function Tag({ children, hash }) { return <a className="ab-tag">{hash ? '#' : ''}{children}</a>; }
function Meta({ icon, children }) { return <span className="ab-meta"><Ic name={icon} size={15} sw={1.9} />{children}</span>; }
function Sep() { return <span className="ab-sep" />; }

function Btn({ variant = 'primary', sm, icon, iconRight, children, loading, disabled, style }) {
  const cls = `ab-btn ab-btn-${variant} ${sm ? 'ab-btn-sm' : ''} ${loading ? 'ab-btn-loading' : ''}`;
  return (
    <button className={cls} disabled={disabled} style={style}>
      {icon && <Ic name={icon} size={sm ? 15 : 16} sw={2} />}
      {children}
      {iconRight && <Ic name={iconRight} size={sm ? 15 : 16} sw={2} />}
    </button>
  );
}

/* ---------- post cards ---------- */
function PostCard({ post, hover = true }) {
  return (
    <article className={`ab-card ab-post ${hover ? 'ab-card-hover' : ''}`}>
      <Thumb cat={post.cat} label={post.thumbLabel} />
      <div className="ab-post-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Cat cat={post.cat} />
          {post.series && <span className="ab-badge ab-badge-series"><Ic name="layers" size={11} sw={2.2} />Serie</span>}
        </div>
        <h3 className="ab-post-title">{post.title}</h3>
        {post.excerpt && <p className="ab-post-excerpt">{post.excerpt}</p>}
        <div className="ab-tagrow">{(post.tags || []).map((t) => <Tag key={t}>{t}</Tag>)}</div>
        <div className="ab-post-foot">
          <Meta icon="calendar">{post.date}</Meta><Sep />
          <Meta icon="clock">{post.read}</Meta>
          {post.comments != null && <><Sep /><Meta icon="message">{post.comments}</Meta></>}
        </div>
      </div>
    </article>
  );
}

function FeaturedCard({ post }) {
  return (
    <article className="ab-card ab-feat ab-card-hover">
      <Thumb cat={post.cat} label={post.thumbLabel} glow />
      <div className="ab-feat-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span className="ab-badge ab-badge-grad"><Ic name="sparkles" size={12} sw={2.2} />Destacado</span>
          <Cat cat={post.cat} />
        </div>
        <h2 className="ab-feat-title">{post.title}</h2>
        <p style={{ fontSize: 16, color: 'var(--ink-3)', lineHeight: 1.6 }}>{post.excerpt}</p>
        <div className="ab-meta-row" style={{ marginTop: 4 }}>
          <Meta icon="calendar">{post.date}</Meta><Sep /><Meta icon="clock">{post.read}</Meta>
          {post.comments != null && <><Sep /><Meta icon="message">{post.comments} comentarios</Meta></>}
        </div>
        <div style={{ marginTop: 6 }}><Btn variant="grad" iconRight="arrowRight">Leer artículo</Btn></div>
      </div>
    </article>
  );
}

function ListRow({ post }) {
  return (
    <a className="ab-row">
      <Thumb cat={post.cat} label="" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Cat cat={post.cat} />{post.series && <span className="ab-badge ab-badge-series"><Ic name="layers" size={11} sw={2.2} />Serie</span>}</div>
        <h3 style={{ fontSize: 16, fontWeight: 650, letterSpacing: '-.02em' }}>{post.title}</h3>
        {post.excerpt && <p style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>{post.excerpt}</p>}
        <div className="ab-meta-row"><Meta icon="calendar">{post.date}</Meta><Sep /><Meta icon="clock">{post.read}</Meta></div>
      </div>
    </a>
  );
}

Object.assign(window, {
  AB_ICONS, Ic, AB_CATS, Thumb, Header, Footer, Cat, Tag, Meta, Sep, Btn,
  PostCard, FeaturedCard, ListRow,
});
