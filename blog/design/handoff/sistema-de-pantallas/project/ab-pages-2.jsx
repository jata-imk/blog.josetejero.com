/* ============================================================
   Aleliz Blog — Pages 2: Serie, Categoría, Tag, Búsqueda,
   Sobre mí, 404
   ============================================================ */
const {
  Header, Footer, Cat, Tag, Meta, Sep, Btn, PostCard, FeaturedCard, ListRow, Thumb, Ic,
  Breadcrumb, TOC, Pager, SeriesStep, SeriesCard, SearchInput, EmptyState, Skill, Avatar,
  AB_POSTS, AB_CATS, SectionHead,
} = window;

/* ════════════════════════════ SERIE ════════════════════════════ */
function SeriePage() {
  return (
    <div className="ab">
      <Header active="Series" />
      <div className="ab-wrap" style={{ paddingTop: 32 }}>
        <Breadcrumb items={['Inicio', 'Series', 'Aprendiendo Next.js desde cero']} />
      </div>
      {/* hero */}
      <section className="ab-wrap" style={{ paddingTop: 26, paddingBottom: 36 }}>
        <div className="ab-card" style={{ overflow: 'hidden', display: 'grid', gridTemplateColumns: '1.3fr 1fr' }}>
          <div style={{ padding: '38px 40px', display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span className="ab-badge ab-badge-grad"><Ic name="layers" size={12} sw={2.2} />Serie</span>
              <span className="ab-badge ab-badge-soft">Intermedio</span>
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-.035em', lineHeight: 1.12 }}>Aprendiendo Next.js desde cero</h1>
            <p style={{ fontSize: 16.5, color: 'var(--ink-3)', lineHeight: 1.6 }}>
              Una ruta guiada para construir un blog real con Next.js: del primer componente al deploy en producción, con SEO y datos.
            </p>
            <div className="ab-meta-row">
              <Meta icon="layers">6 partes</Meta><Sep /><Meta icon="refresh">Act. 12 mar 2026</Meta><Sep /><Meta icon="bookOpen">~58 min</Meta>
            </div>
            <div style={{ marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--muted)', marginBottom: 7, fontWeight: 500 }}><span>Tu progreso</span><span>3 / 6 · 50%</span></div>
              <div className="ab-progress"><i style={{ width: '50%' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <Btn variant="grad" iconRight="arrowRight">Continuar leyendo</Btn>
              <Btn variant="secondary" icon="list">Ver índice</Btn>
            </div>
          </div>
          <Thumb cat="frontend" label="// serie · next.js" glow />
        </div>
      </section>

      {/* ordered posts */}
      <section className="ab-wrap-narrow" style={{ maxWidth: 860, paddingBottom: 56 }}>
        <SectionHead title="Contenido de la serie" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SeriesStep n={1} state="done" title="Configurando el proyecto Next.js" excerpt="App Router, estructura de carpetas y convenciones." date="Ene 8, 2026" read="7 min" />
          <SeriesStep n={2} state="done" title="Rutas dinámicas y datos con PostgreSQL" excerpt="Conexión, queries y generación estática de páginas." date="Ene 15, 2026" read="11 min" />
          <SeriesStep n={3} state="done" title="Renderizado de Markdown y MDX" excerpt="Del contenido al HTML con componentes embebidos." date="Ene 22, 2026" read="9 min" />
          <SeriesStep n={4} state="current" title="Metadata dinámica y Open Graph" excerpt="SEO técnico por ruta y generación de OG images." date="Feb 1, 2026" read="8 min" />
          <SeriesStep n={5} state="soon" title="Comentarios y moderación" excerpt="Formulario, estados y cola de aprobación." />
          <SeriesStep n={6} state="soon" title="Deploy y optimización de rendimiento" excerpt="Cache, imágenes y Core Web Vitals." />
        </div>
      </section>

      {/* related series */}
      <section style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '56px 0' }}>
        <div className="ab-wrap">
          <SectionHead title="Series relacionadas" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            <SeriesCard title="PostgreSQL para proyectos personales" desc="Modelado, índices y consultas que escalan." count={5} level="Básico" cat="bases-de-datos" />
            <SeriesCard title="SEO técnico para desarrolladores" desc="Schema, sitemaps y arquitectura de contenido." count={4} level="Intermedio" cat="tutoriales" />
            <SeriesCard title="Automatización con APIs e IA" desc="Conecta servicios y agentes para automatizar." count={4} level="Avanzado" cat="ia" />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

/* ════════════════════════════ CATEGORÍA ════════════════════════════ */
function CategoryPage() {
  return (
    <div className="ab">
      <Header active="Categorías" />
      <div className="ab-wrap" style={{ paddingTop: 32 }}>
        <Breadcrumb items={['Inicio', 'Categorías', 'Backend']} />
      </div>
      <section className="ab-wrap" style={{ paddingTop: 26, paddingBottom: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--violet)' }} />
          <h1 style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-.04em' }}>Backend</h1>
        </div>
        <p style={{ fontSize: 18, color: 'var(--ink-3)', lineHeight: 1.6, marginTop: 14, maxWidth: 620 }}>
          APIs, arquitectura, frameworks y todo lo que ocurre del lado del servidor. PHP, Python y Node.js en la práctica.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 18 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>21 posts</span>
          <span className="ab-sep" />
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Tags:</span>
            {['Laravel','FastAPI','Node.js','API','Prisma'].map((t) => <a key={t} className="ab-tag" style={{ fontSize: 12.5 }}>#{t}</a>)}
          </div>
        </div>
      </section>
      <section className="ab-wrap" style={{ paddingBottom: 40 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <span className="ab-chip active">Más recientes</span><span className="ab-chip">Más leídos</span><span className="ab-chip">Series primero</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          <PostCard post={AB_POSTS.pg} /><PostCard post={AB_POSTS.og} /><PostCard post={AB_POSTS.comments} />
          <PostCard post={AB_POSTS.notion} /><PostCard post={AB_POSTS.apikeys} /><PostCard post={AB_POSTS.seo} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}><Pager page={1} total={4} /></div>
      </section>
      <Footer />
    </div>
  );
}

/* ════════════════════════════ TAG ════════════════════════════ */
function TagPage() {
  return (
    <div className="ab">
      <Header active="Blog" />
      <div className="ab-wrap" style={{ paddingTop: 32 }}>
        <Breadcrumb items={['Inicio', 'Tags', '#PostgreSQL']} />
      </div>
      <section className="ab-wrap" style={{ paddingTop: 26, paddingBottom: 30 }}>
        <h1 style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--cyan)' }}>#</span>PostgreSQL
        </h1>
        <p style={{ fontSize: 17, color: 'var(--ink-3)', lineHeight: 1.6, marginTop: 12, maxWidth: 600 }}>
          La base de datos relacional que uso para casi todo. Modelado, rendimiento y trucos de producción.
        </p>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)', marginTop: 14, display: 'inline-block' }}>8 posts etiquetados</span>
      </section>
      <section className="ab-wrap" style={{ paddingBottom: 40, display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 48, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <ListRow post={AB_POSTS.pg} /><ListRow post={AB_POSTS.comments} /><ListRow post={AB_POSTS.og} /><ListRow post={AB_POSTS.seo} />
        </div>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div>
            <div className="ab-toc-title">Tags relacionados</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{['Prisma','Next.js','API','Docker','SQL'].map((t) => <a key={t} className="ab-tag" style={{ fontSize: 12.5 }}>#{t}</a>)}</div>
          </div>
          <div>
            <div className="ab-toc-title">Aparece en categorías</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Cat cat="bases-de-datos" /><Cat cat="backend" /><Cat cat="tutoriales" /></div>
          </div>
        </aside>
      </section>
      <Footer />
    </div>
  );
}

/* ════════════════════════════ BÚSQUEDA ════════════════════════════ */
function SearchPage() {
  return (
    <div className="ab">
      <Header active="Blog" />
      <section className="ab-wrap-narrow" style={{ maxWidth: 720, paddingTop: 56 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.035em', textAlign: 'center', marginBottom: 22 }}>Buscar</h1>
        <SearchInput lg value="postgres" />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
          <span className="ab-chip active">Todo</span><span className="ab-chip">Posts</span><span className="ab-chip">Series</span><span className="ab-chip">Tags</span><span className="ab-chip">Categorías</span>
        </div>
      </section>
      <section className="ab-wrap-narrow" style={{ maxWidth: 720, paddingTop: 40, paddingBottom: 56, display: 'flex', flexDirection: 'column', gap: 30 }}>
        <ResultGroup label="Posts" count={4}>
          <ListRow post={AB_POSTS.pg} /><ListRow post={AB_POSTS.comments} />
        </ResultGroup>
        <ResultGroup label="Series" count={1}>
          <a className="ab-row" style={{ alignItems: 'center' }}>
            <div className="ab-step-num" style={{ background: 'var(--violet-tint)', color: 'var(--violet)' }}><Ic name="layers" size={17} sw={2.2} /></div>
            <div><h3 style={{ fontSize: 15.5, fontWeight: 650 }}>PostgreSQL para proyectos personales</h3><p style={{ fontSize: 13, color: 'var(--ink-3)' }}>5 partes · Básico</p></div>
          </a>
        </ResultGroup>
        <ResultGroup label="Tags" count={2}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '4px 16px' }}><a className="ab-chip"><span className="hash">#</span>PostgreSQL</a><a className="ab-chip"><span className="hash">#</span>Postgres-Prisma</a></div>
        </ResultGroup>
        <ResultGroup label="Categorías" count={1}>
          <div style={{ padding: '4px 16px' }}><Cat cat="bases-de-datos" lg /></div>
        </ResultGroup>
      </section>
      <Footer />
    </div>
  );
}
function ResultGroup({ label, count, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10, paddingLeft: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</h3>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{count}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ════════════════════════════ SOBRE MÍ ════════════════════════════ */
const SKILLS = {
  Lenguajes: [['PHP','#777bb3'],['Python','#3776ab'],['JavaScript','#f7df1e','JS'],['TypeScript','#3178c6','TS'],['SQL','#0891b2']],
  Backend: [['Laravel','#ff2d20'],['FastAPI','#059669'],['Flask','#0f172a'],['Node.js','#10b981'],['Express','#475569']],
  Frontend: [['React','#06b6d4'],['Vue.js','#42b883'],['Astro','#7c3aed'],['Tailwind','#06b6d4'],['Inertia','#9553e9']],
  'Bases de Datos': [['MySQL','#00758f'],['PostgreSQL','#336791'],['MongoDB','#10b981'],['Prisma','#0f172a']],
  'DevOps & Infra': [['Linux','#f59e0b'],['Docker','#2563eb'],['Nginx','#059669'],['Git','#e11d48'],['CI/CD','#7c3aed']],
  'Inteligencia Artificial': [['OpenAI','#10b981'],['Claude','#d97706'],['Web Scraping','#7c3aed'],['Agentes','#2563eb']],
};
function AboutPage() {
  return (
    <div className="ab">
      <Header active="Sobre mí" />
      {/* hero */}
      <section className="ab-wrap" style={{ paddingTop: 56, paddingBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 44, alignItems: 'center' }}>
          <div>
            <div className="ab-eyebrow" style={{ marginBottom: 14 }}>Sobre mí</div>
            <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.1 }}>Soy José Alejandro, desarrollador web</h1>
            <p style={{ fontSize: 18.5, color: 'var(--ink-3)', lineHeight: 1.6, marginTop: 18 }}>
              Enfocado en crear soluciones útiles, rápidas y bien estructuradas. Ingeniero mecatrónico que disfruta el código como estilo de vida.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
              <Btn variant="grad" icon="download">Descargar CV</Btn>
              <Btn variant="secondary" icon="github">Ver GitHub</Btn>
              <Btn variant="ghost" icon="mail">Contactar</Btn>
            </div>
          </div>
          <div className="ab-card" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ width: 96, height: 96, borderRadius: 26, margin: '0 auto 14px', background: 'var(--grad)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 34, fontWeight: 800, boxShadow: '0 8px 24px rgba(76,71,237,.3)' }}>JA</div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>José Alejandro Tejero</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 2 }}>Ingeniero Mecatrónico · Mérida, MX</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
              <button className="ab-icon-btn" style={{ border: '1px solid var(--line-2)' }}><Ic name="github" size={17} sw={1.8} /></button>
              <button className="ab-icon-btn" style={{ border: '1px solid var(--line-2)' }}><Ic name="twitter" size={17} sw={1.8} /></button>
              <button className="ab-icon-btn" style={{ border: '1px solid var(--line-2)' }}><Ic name="linkedin" size={17} sw={1.8} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* bio */}
      <section className="ab-wrap-narrow" style={{ maxWidth: 760, paddingTop: 44 }}>
        <div className="ab-prose">
          <p>Me gusta mi trabajo, y más allá de verlo como tal, lo disfruto como un estilo de vida. He trabajado en los sectores turístico, financiero y gobierno, incluyendo proyectos con geotecnologías y sistemas de mapas.</p>
          <p>Me adapto a lo que se necesite: desde el análisis inicial hasta la implementación final. También le meto a proyectos personales que van desde scrapers con IA hasta sistemas de rastreo vehicular en tiempo real.</p>
        </div>
      </section>

      {/* experience timeline */}
      <section className="ab-wrap-narrow" style={{ maxWidth: 760, paddingTop: 48 }}>
        <h2 style={{ fontSize: 24, fontWeight: 750, letterSpacing: '-.03em', marginBottom: 24 }}>Experiencia</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <TimelineItem org="Ayuntamiento de Mérida" role="Desarrollador Web" period="Abr 2024 — Actualidad" desc="Migración y optimización de sistemas cartográficos con MapLibre, geoprocesos y APIs con FastAPI." active />
          <TimelineItem org="Financial Assesment Group" role="Desarrollador Full-Stack" period="Jul 2023 — Mar 2024" desc="Migración de software financiero a Laravel, Vue.js y Docker; despliegues en múltiples servidores." />
          <TimelineItem org="Lex Go Tours" role="Desarrollador CRM" period="Sep 2021 — Jul 2023" desc="CRM interno con pasarelas de pago, APIs de hotelería y mensajería en tiempo real (WhatsApp Business)." last />
        </div>
      </section>

      {/* CV */}
      <section className="ab-wrap-narrow" style={{ maxWidth: 760, paddingTop: 44 }}>
        <div className="ab-card" style={{ padding: 22, display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 52, height: 64, borderRadius: 9, background: '#fff', border: '1px solid var(--line-2)', display: 'grid', placeItems: 'center', color: 'var(--rose)', flexShrink: 0, boxShadow: 'var(--sh-1)' }}><Ic name="fileText" size={24} sw={1.8} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Curriculum Vitae</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 2 }}>PDF · 2 páginas · actualizado mar 2026</div>
          </div>
          <Btn variant="secondary" icon="download">Descargar PDF</Btn>
        </div>
      </section>

      {/* skills */}
      <section className="ab-wrap-narrow" style={{ maxWidth: 760, paddingTop: 52, paddingBottom: 64 }}>
        <h2 style={{ fontSize: 24, fontWeight: 750, letterSpacing: '-.03em', marginBottom: 6 }}>Skills</h2>
        <p style={{ fontSize: 15, color: 'var(--ink-3)', marginBottom: 26 }}>Herramientas con las que trabajo a diario, agrupadas por área.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {Object.entries(SKILLS).map(([group, items]) => (
            <div key={group}>
              <div className="ab-toc-title" style={{ marginBottom: 12 }}>{group}</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {items.map(([name, color, mark]) => <Skill key={name} name={name} color={color} mark={mark} />)}
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
function TimelineItem({ org, role, period, desc, active, last }) {
  return (
    <div style={{ display: 'flex', gap: 18 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: active ? 'var(--grad)' : '#fff', border: active ? 'none' : '2px solid var(--line-2)', marginTop: 4, boxShadow: active ? '0 0 0 4px var(--blue-tint)' : 'none' }} />
        {!last && <div style={{ width: 2, flex: 1, background: 'var(--line-2)', marginTop: 4 }} />}
      </div>
      <div style={{ paddingBottom: 28 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--blue)' }}>{period}</div>
        <div style={{ fontSize: 17, fontWeight: 700, marginTop: 3 }}>{role} <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}>· {org}</span></div>
        <p style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.55, marginTop: 6 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ════════════════════════════ 404 ════════════════════════════ */
function NotFoundPage() {
  return (
    <div className="ab" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <Header active="" />
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '90px 40px' }}>
        <div className="ab-404-code">404</div>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-.03em', marginTop: 12 }}>Esta página no existe</h1>
        <p style={{ fontSize: 17, color: 'var(--ink-3)', lineHeight: 1.6, marginTop: 14, maxWidth: 420 }}>
          Puede que el enlace haya cambiado o que el contenido ya no esté disponible.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
          <Btn variant="grad" icon="home">Volver al inicio</Btn>
          <Btn variant="secondary" icon="bookOpen">Ir al blog</Btn>
        </div>
        <div style={{ marginTop: 40, display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--muted)' }}>
          <Ic name="search" size={15} sw={2} />¿Buscabas algo? Prueba la <a style={{ color: 'var(--blue)', fontWeight: 600 }}>búsqueda</a>.
        </div>
      </section>
      <Footer />
    </div>
  );
}

Object.assign(window, { SeriePage, CategoryPage, TagPage, SearchPage, ResultGroup, AboutPage, NotFoundPage, SKILLS, TimelineItem });
