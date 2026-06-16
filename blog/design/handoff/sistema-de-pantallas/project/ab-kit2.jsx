/* ============================================================
   Aleliz Blog — Kit part 2: callouts, code, comments, SEO,
   TOC, breadcrumb, pagination, author, skills, empty states,
   series steps, search.
   ============================================================ */
const { Ic, Btn, Thumb, Cat, Tag, Meta, Sep, AB_CATS } = window;

/* ---------- breadcrumb ---------- */
function Breadcrumb({ items }) {
  return (
    <nav className="ab-crumb">
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Ic name="chevronRight" size={14} sw={2} />}
          {i === items.length - 1 ? <span className="cur">{it}</span> : <a>{it}</a>}
        </React.Fragment>
      ))}
    </nav>
  );
}

/* ---------- callouts ---------- */
function Callout({ type = 'note', title, children }) {
  const map = { note: ['info','Nota'], tip: ['lightbulb','Tip'], warn: ['alert','Advertencia'] };
  const [icon, def] = map[type] || map.note;
  return (
    <div className={`ab-callout ab-callout-${type}`}>
      <span className="ic"><Ic name={icon} size={14} sw={2.2} /></span>
      <div><b>{title || def}</b>{children}</div>
    </div>
  );
}

/* ---------- code block ---------- */
function CodeBlock({ lang = 'tsx', children, copied }) {
  return (
    <div className="ab-code">
      <div className="ab-code-bar">
        <span className="ab-code-dots"><i style={{ background: '#ff5f57' }} /><i style={{ background: '#febc2e' }} /><i style={{ background: '#28c840' }} /></span>
        <span className="ab-code-lang">{lang}</span>
        <button className="ab-code-copy">
          <Ic name={copied ? 'check' : 'copy'} size={13} sw={2} />{copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre><code>{children}</code></pre>
    </div>
  );
}
/* token helpers for code highlighting */
const K = ({ children }) => <span className="tk-key">{children}</span>;
const F = ({ children }) => <span className="tk-fn">{children}</span>;
const S = ({ children }) => <span className="tk-str">{children}</span>;
const C = ({ children }) => <span className="tk-com">{children}</span>;
const N = ({ children }) => <span className="tk-num">{children}</span>;
const P = ({ children }) => <span className="tk-pun">{children}</span>;

/* ---------- TOC ---------- */
function TOC({ items, title = 'En esta página' }) {
  return (
    <div className="ab-toc">
      <div className="ab-toc-title">{title}</div>
      {items.map((it, i) => (
        <a key={i} className={`${it.sub ? 'sub' : ''} ${it.active ? 'active' : ''}`}>{it.label}</a>
      ))}
    </div>
  );
}

/* ---------- comments ---------- */
const AVATAR_COLORS = ['#2563eb','#7c3aed','#06b6d4','#10b981','#f59e0b','#e11d48'];
function Avatar({ name, i = 0 }) {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return <div className="ab-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>{initials}</div>;
}
function Comment({ c, i }) {
  return (
    <div className="ab-comment">
      <Avatar name={c.name} i={i} />
      <div className="ab-comment-body">
        <div className="ab-comment-head">
          <span className="ab-comment-name">{c.name}</span>
          <span className="ab-comment-date">{c.date}</span>
          {c.status === 'pending' && <span className="ab-status ab-status-pending"><span className="d" />Pendiente de moderación</span>}
        </div>
        <p className="ab-comment-text">{c.text}</p>
        <div className="ab-comment-actions"><button><Ic name="reply" size={13} sw={2} />Responder</button></div>
      </div>
    </div>
  );
}
function CommentForm({ state = 'idle' }) {
  return (
    <div className="ab-card" style={{ padding: 22 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div className="ab-field"><label>Nombre</label><input className="ab-input" placeholder="Tu nombre" defaultValue={state !== 'idle' ? 'Ana Velasco' : ''} /></div>
        <div className="ab-field"><label>Email</label><input className="ab-input" placeholder="tu@email.com" defaultValue={state !== 'idle' ? 'ana@mail.com' : ''} /></div>
      </div>
      <div className="ab-field" style={{ marginBottom: 14 }}>
        <label>Comentario</label>
        <textarea className="ab-textarea" rows={3} placeholder="Comparte tu opinión…" defaultValue={state === 'error' ? 'Excelente artículo, justo lo que buscaba.' : ''} />
      </div>
      {state === 'error' && <div className="ab-status ab-status-err" style={{ marginBottom: 14 }}><span className="d" />No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.</div>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Los comentarios pueden pasar por moderación antes de publicarse.</span>
        <Btn variant="primary" icon="send" loading={state === 'sending'}>{state === 'sending' ? 'Enviando' : 'Publicar comentario'}</Btn>
      </div>
    </div>
  );
}

/* ---------- SEO preview ---------- */
function SEOPreview() {
  return (
    <div className="ab-seo">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span className="ab-seo-tag"><Ic name="trending" size={12} sw={2.4} />SEO Preview</span>
        <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Visible solo en modo CMS / admin</span>
      </div>
      <div className="ab-serp" style={{ marginBottom: 16 }}>
        <div className="url">aleliz.xyz › blog › nextjs-postgresql-blog</div>
        <div className="ttl">Next.js + PostgreSQL: creando un blog personal rápido</div>
        <div className="desc">Guía práctica para montar un blog rápido y SEO-friendly con Next.js, PostgreSQL y Prisma. Rutas dinámicas, metadata y rendimiento.</div>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {[['Meta title','Next.js + PostgreSQL: creando un blog personal rápido','58/60'],
          ['Meta description','Guía práctica para montar un blog rápido y SEO-friendly…','142/160'],
          ['Canonical URL','https://aleliz.xyz/blog/nextjs-postgresql-blog',''],
          ['OG image','og/nextjs-postgresql.png · 1200×630','✓']].map(([k, v, n]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 12, fontSize: 13 }}>
            <span className="mono" style={{ color: 'var(--violet)', minWidth: 116, fontWeight: 500 }}>{k}</span>
            <span style={{ color: 'var(--ink-2)', flex: 1 }}>{v}</span>
            {n && <span className="mono" style={{ color: n === '✓' ? 'var(--green)' : 'var(--muted)', fontSize: 11.5 }}>{n}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- pagination / prev-next ---------- */
function Pager({ page = 1, total = 6 }) {
  return (
    <div className="ab-pager">
      <button disabled={page === 1}><Ic name="arrowLeft" size={15} sw={2} /></button>
      {Array.from({ length: total }, (_, i) => i + 1).slice(0, 5).map((n) => (
        <button key={n} className={n === page ? 'active' : ''}>{n}</button>
      ))}
      <span style={{ color: 'var(--muted)', padding: '0 4px' }}>…</span>
      <button>{total}</button>
      <button><Ic name="arrowRight" size={15} sw={2} /></button>
    </div>
  );
}
function PrevNext({ prev, next }) {
  return (
    <div className="ab-prevnext">
      <a className="ab-pn prev"><span className="dir"><Ic name="arrowLeft" size={14} sw={2} />Anterior</span><div className="pn-title">{prev}</div></a>
      <a className="ab-pn next"><span className="dir">Siguiente<Ic name="arrowRight" size={14} sw={2} /></span><div className="pn-title">{next}</div></a>
    </div>
  );
}

/* ---------- author card ---------- */
function AuthorCard() {
  return (
    <div className="ab-author">
      <div className="ab-author-av">JA</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15.5, fontWeight: 700 }}>José Alejandro Tejero</div>
        <p style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.5, marginTop: 2 }}>Ingeniero mecatrónico y desarrollador web. Escribe sobre backend, IA y automatización.</p>
      </div>
      <Btn variant="secondary" sm icon="user">Seguir</Btn>
    </div>
  );
}

/* ---------- skills ---------- */
function Skill({ name, color = '#2563eb', mark }) {
  return <span className="ab-skill"><span className="si" style={{ background: color }}>{mark || name[0]}</span>{name}</span>;
}

/* ---------- empty state ---------- */
function EmptyState({ icon = 'frown', title, children, action }) {
  return (
    <div className="ab-empty">
      <div className="ab-empty-ic"><Ic name={icon} size={24} sw={1.8} /></div>
      <h4>{title}</h4>
      <p>{children}</p>
      {action}
    </div>
  );
}

/* ---------- series step ---------- */
function SeriesStep({ n, state = 'todo', title, excerpt, date, read }) {
  return (
    <a className={`ab-step ${state}`}>
      <div className="ab-step-num">{state === 'done' ? <Ic name="check" size={17} sw={2.6} /> : n}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)' }}>Parte {n}</span>
          {state === 'soon' && <span className="ab-badge ab-badge-soft">Próximamente</span>}
          {state === 'current' && <span className="ab-badge ab-badge-grad" style={{ fontSize: 10.5 }}>Aquí vas</span>}
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 650, letterSpacing: '-.02em' }}>{title}</h3>
        {excerpt && <p style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.5, marginTop: 4 }}>{excerpt}</p>}
        {date && <div className="ab-meta-row" style={{ marginTop: 8 }}><Meta icon="calendar">{date}</Meta><Sep /><Meta icon="clock">{read}</Meta></div>}
      </div>
    </a>
  );
}

/* ---------- series card (compact, for grids) ---------- */
function SeriesCard({ title, desc, count, level, cat = 'frontend', progress }) {
  return (
    <article className="ab-card ab-card-hover" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span className="ab-badge ab-badge-series"><Ic name="layers" size={11} sw={2.2} />Serie</span>
        <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 500 }}>{count} partes · {level}</span>
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.3 }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.55 }}>{desc}</p>
      {progress != null && (
        <div style={{ marginTop: 2 }}>
          <div className="ab-progress"><i style={{ width: progress + '%' }} /></div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{progress}% completado</div>
        </div>
      )}
      <a style={{ marginTop: 'auto', paddingTop: 4, fontSize: 14, fontWeight: 600, color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {progress ? 'Continuar' : 'Empezar serie'}<Ic name="arrowRight" size={15} sw={2.2} />
      </a>
    </article>
  );
}

/* ---------- search input ---------- */
function SearchInput({ lg, placeholder = 'Buscar posts, series, tags o categorías…', value, kbd }) {
  return (
    <div className={`ab-search ${lg ? 'ab-search-lg' : ''}`}>
      <Ic name="search" className="lead" sw={2} />
      <input placeholder={placeholder} defaultValue={value} />
      {kbd && <span className="kbd">⌘K</span>}
    </div>
  );
}

Object.assign(window, {
  Breadcrumb, Callout, CodeBlock, K, F, S, C, N, P, TOC, Avatar, Comment, CommentForm,
  SEOPreview, Pager, PrevNext, AuthorCard, Skill, EmptyState, SeriesStep, SeriesCard, SearchInput,
});
