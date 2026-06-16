/* ============================================================
   Aleliz Blog — Mobile variants: Home, Blog, Post, Serie, Sobre mí
   Rendered inside 390px artboards.
   ============================================================ */
const {
  Cat, Tag, Meta, Sep, Btn, Thumb, Ic, Breadcrumb, Callout, CodeBlock, K, F, S, C, N, P,
  Comment, CommentForm, SeriesStep, Skill, Avatar, AB_POSTS, AB_COMMENTS, AB_CATS, SKILLS,
} = window;

function MHeader({ active }) {
  return (
    <header className="ab-header">
      <div className="ab-header-in">
        <a className="ab-logo" style={{ fontSize: 15.5 }}><span className="ab-logo-mark" style={{ width: 24, height: 24 }}>A</span>Aleliz <span className="dot">Blog</span></a>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="ab-icon-btn" style={{ width: 34, height: 34 }}><Ic name="search" size={18} sw={2} /></button>
          <button className="ab-burger"><Ic name="menu" size={20} sw={2} /></button>
        </div>
      </div>
    </header>
  );
}
function MFooter() {
  return (
    <footer className="ab-footer"><div className="ab-footer-in" style={{ padding: 24, gap: 14 }}>
      <a className="ab-logo" style={{ fontSize: 15 }}><span className="ab-logo-mark" style={{ width: 22, height: 22 }}>A</span>Aleliz <span className="dot">Blog</span></a>
      <p className="ab-copy" style={{ fontSize: 12.5 }}>© 2026 José Alejandro Tejero Aguilar</p>
      <div className="ab-social"><button className="ab-icon-btn"><Ic name="github" size={17} /></button><button className="ab-icon-btn"><Ic name="twitter" size={17} /></button></div>
    </div></footer>
  );
}
function MPost({ post }) {
  return (
    <article className="ab-card ab-post">
      <Thumb cat={post.cat} label={post.thumbLabel} />
      <div className="ab-post-body" style={{ padding: '15px 15px 17px', gap: 8 }}>
        <Cat cat={post.cat} />
        <h3 className="ab-post-title" style={{ fontSize: 16.5 }}>{post.title}</h3>
        <div className="ab-post-foot"><Meta icon="calendar">{post.date}</Meta><Sep /><Meta icon="clock">{post.read}</Meta></div>
      </div>
    </article>
  );
}

function MobileHome() {
  return (
    <div className="ab ab-m">
      <MHeader active="Inicio" />
      <section style={{ textAlign: 'center', padding: '40px 18px 30px' }}>
        <div className="ab-eyebrow" style={{ marginBottom: 12, fontSize: 11 }}>Desarrollo · IA · Automatización</div>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-.035em', lineHeight: 1.12 }}>Hola, soy José Alejandro 👨‍💻</h1>
        <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.55, marginTop: 14 }}>Escribo sobre desarrollo web, automatización, IA, backend y frontend.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
          <Btn variant="grad" icon="bookOpen" style={{ justifyContent: 'center' }}>Leer el blog</Btn>
          <Btn variant="secondary" icon="layers" style={{ justifyContent: 'center' }}>Ver series</Btn>
        </div>
      </section>
      <section className="ab-wrap" style={{ paddingBottom: 30 }}>
        <h2 style={{ fontSize: 19, fontWeight: 750, letterSpacing: '-.02em', marginBottom: 16 }}>Posts destacados</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <MPost post={AB_POSTS.notion} /><MPost post={AB_POSTS.pg} />
        </div>
      </section>
      <section className="ab-wrap" style={{ paddingBottom: 36 }}>
        <h2 style={{ fontSize: 19, fontWeight: 750, letterSpacing: '-.02em', marginBottom: 14 }}>Categorías</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[['frontend',14],['backend',21],['ia',12],['devops',17]].map(([c, n]) => (
            <a key={c} className="ab-card" style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Cat cat={c} lg /><span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{n}</span></a>
          ))}
        </div>
      </section>
      <MFooter />
    </div>
  );
}

function MobileBlog() {
  return (
    <div className="ab ab-m">
      <MHeader active="Blog" />
      <section className="ab-wrap" style={{ paddingTop: 28, paddingBottom: 18 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-.035em' }}>Blog</h1>
        <p style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.55, marginTop: 8 }}>Artículos sobre desarrollo, datos e IA.</p>
        <div style={{ marginTop: 16 }}><window.SearchInput /></div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, overflowX: 'hidden' }}>
          <span className="ab-chip active">Todos</span><span className="ab-chip">Frontend</span><span className="ab-chip">Backend</span><span className="ab-chip">IA</span>
        </div>
      </section>
      <section className="ab-wrap" style={{ paddingBottom: 30 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <MPost post={AB_POSTS.notion} /><MPost post={AB_POSTS.pg} /><MPost post={AB_POSTS.astro} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}><window.Pager page={1} total={9} /></div>
      </section>
      <MFooter />
    </div>
  );
}

function MobilePost() {
  return (
    <div className="ab ab-m">
      <MHeader active="Blog" />
      <div className="ab-wrap" style={{ paddingTop: 22 }}>
        <Breadcrumb items={['Blog', 'IA', 'Notion…']} />
        <div style={{ marginTop: 14 }}><Cat cat="ia" /></div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.15, marginTop: 12 }}>Conectar API de Notion a OpenClaw</h1>
        <div className="ab-meta-row" style={{ marginTop: 14 }}><Meta icon="calendar">12 mar 2026</Meta><Sep /><Meta icon="clock">8 min</Meta></div>
      </div>
      <div className="ab-wrap" style={{ marginTop: 18 }}><Thumb cat="ia" label="// hero" style={{ aspectRatio: '16/9', borderRadius: 'var(--r-lg)' }} glow /></div>
      {/* collapsed TOC */}
      <div className="ab-wrap" style={{ marginTop: 20 }}>
        <button className="ab-card" style={{ width: '100%', padding: '13px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'var(--bg-soft)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 600 }}><Ic name="list" size={17} sw={2} />Tabla de contenidos</span>
          <Ic name="chevronDown" size={16} sw={2.2} style={{ color: 'var(--muted)' }} />
        </button>
      </div>
      <div className="ab-wrap ab-prose" style={{ marginTop: 22, fontSize: 16 }}>
        <p>Darle a un agente acceso de lectura a tu Notion suena trivial hasta que piensas en los <strong>scopes</strong> y el rate limit.</p>
        <h2 style={{ fontSize: 21 }}>Por qué un gateway</h2>
        <p>Exponer el token crudo es mala idea: pierdes control de cuotas y auditoría.</p>
        <Callout type="tip" title="Tip">Versiona el header <strong>Notion-Version</strong> para evitar sorpresas.</Callout>
        <CodeBlock lang="ts">{`const notion = `}<K>new</K>{` `}<F>Client</F>{`({
  auth: process.env.`}<N>TOKEN</N>{`
});`}</CodeBlock>
      </div>
      <div className="ab-wrap" style={{ marginTop: 30, paddingBottom: 36 }}>
        <h2 style={{ fontSize: 20, fontWeight: 750, marginBottom: 16 }}>Comentarios · 3</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Comment c={AB_COMMENTS[0]} i={0} /><Comment c={AB_COMMENTS[1]} i={1} />
        </div>
      </div>
      <MFooter />
    </div>
  );
}

function MobileSerie() {
  return (
    <div className="ab ab-m">
      <MHeader active="Series" />
      <section className="ab-wrap" style={{ paddingTop: 26, paddingBottom: 24 }}>
        <Thumb cat="frontend" label="// serie" style={{ aspectRatio: '16/9', borderRadius: 'var(--r-lg)', marginBottom: 18 }} glow />
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}><span className="ab-badge ab-badge-grad"><Ic name="layers" size={11} sw={2.2} />Serie</span><span className="ab-badge ab-badge-soft">Intermedio</span></div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.15 }}>Aprendiendo Next.js desde cero</h1>
        <p style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.55, marginTop: 10 }}>Una ruta guiada para construir un blog real con Next.js.</p>
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 500 }}><span>Progreso</span><span>3 / 6</span></div>
          <div className="ab-progress"><i style={{ width: '50%' }} /></div>
        </div>
        <div style={{ marginTop: 16 }}><Btn variant="grad" iconRight="arrowRight" style={{ width: '100%', justifyContent: 'center' }}>Continuar leyendo</Btn></div>
      </section>
      <section className="ab-wrap" style={{ paddingBottom: 34 }}>
        <h2 style={{ fontSize: 18, fontWeight: 750, marginBottom: 14 }}>Contenido</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SeriesStep n={1} state="done" title="Configurando el proyecto" />
          <SeriesStep n={2} state="done" title="Rutas dinámicas y datos" />
          <SeriesStep n={3} state="current" title="Renderizado de Markdown" />
          <SeriesStep n={4} state="soon" title="Metadata y Open Graph" />
        </div>
      </section>
      <MFooter />
    </div>
  );
}

function MobileAbout() {
  return (
    <div className="ab ab-m">
      <MHeader active="Sobre mí" />
      <section className="ab-wrap" style={{ paddingTop: 32, textAlign: 'center' }}>
        <div style={{ width: 84, height: 84, borderRadius: 24, margin: '0 auto 16px', background: 'var(--grad)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 30, fontWeight: 800, boxShadow: '0 8px 24px rgba(76,71,237,.3)' }}>JA</div>
        <h1 style={{ fontSize: 27, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.12 }}>Soy José Alejandro</h1>
        <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.55, marginTop: 12 }}>Desarrollador web enfocado en soluciones útiles, rápidas y bien estructuradas.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          <Btn variant="grad" icon="download" style={{ justifyContent: 'center' }}>Descargar CV</Btn>
          <Btn variant="secondary" icon="github" style={{ justifyContent: 'center' }}>Ver GitHub</Btn>
        </div>
      </section>
      <section className="ab-wrap" style={{ paddingTop: 36, paddingBottom: 36 }}>
        <h2 style={{ fontSize: 20, fontWeight: 750, marginBottom: 18 }}>Skills</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {['Lenguajes','Backend','Frontend'].map((g) => (
            <div key={g}>
              <div className="ab-toc-title" style={{ marginBottom: 10 }}>{g}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{SKILLS[g].map(([name, color, mark]) => <Skill key={name} name={name} color={color} mark={mark} />)}</div>
            </div>
          ))}
        </div>
      </section>
      <MFooter />
    </div>
  );
}

Object.assign(window, { MobileHome, MobileBlog, MobilePost, MobileSerie, MobileAbout, MHeader, MFooter, MPost });
