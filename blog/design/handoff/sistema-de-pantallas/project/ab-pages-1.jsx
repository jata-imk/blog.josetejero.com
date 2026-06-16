/* ============================================================
   Aleliz Blog — Pages 1: Home, Blog index, Post, Comments
   ============================================================ */
const {
  Header, Footer, Cat, Tag, Meta, Sep, Btn, PostCard, FeaturedCard, ListRow, Thumb, Ic,
  Breadcrumb, Callout, CodeBlock, K, F, S, C, N, P, TOC, Comment, CommentForm, SEOPreview,
  Pager, PrevNext, AuthorCard, SeriesStep, SeriesCard, SearchInput, EmptyState, Avatar,
  AB_POSTS, AB_COMMENTS, AB_CATS,
} = window;

const CAT_LIST = ['frontend','backend','bases-de-datos','ia','devops','tutoriales','opinion'];
const POP_TAGS = ['Next.js','PostgreSQL','React','Astro','API','Docker','SEO','Prisma'];

/* ════════════════════════════ HOME ════════════════════════════ */
function HomePage() {
  const cats = [
    { c: 'frontend', n: 14 }, { c: 'backend', n: 21 }, { c: 'bases-de-datos', n: 9 },
    { c: 'ia', n: 12 }, { c: 'devops', n: 17 }, { c: 'tutoriales', n: 23 },
  ];
  return (
    <div className="ab">
      <Header active="Inicio" />
      {/* hero */}
      <section style={{ textAlign: 'center', padding: '92px 40px 70px', maxWidth: 760, margin: '0 auto' }}>
        <div className="ab-eyebrow" style={{ marginBottom: 18 }}>Desarrollo · Automatización · IA</div>
        <h1 style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.08 }}>
          Hola, soy José Alejandro <span style={{ WebkitTextFillColor: 'initial' }}>👨‍💻</span>
        </h1>
        <p style={{ fontSize: 19, color: 'var(--ink-3)', lineHeight: 1.6, marginTop: 22, maxWidth: 620, marginInline: 'auto' }}>
          Escribo sobre desarrollo web, automatización, inteligencia artificial, backend, frontend
          y aprendizajes construyendo software.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 34 }}>
          <Btn variant="grad" icon="bookOpen">Leer el blog</Btn>
          <Btn variant="secondary" icon="layers">Ver series</Btn>
        </div>
      </section>

      {/* featured */}
      <section className="ab-wrap" style={{ paddingBottom: 70 }}>
        <SectionHead eyebrow="Lo más reciente" title="Posts destacados" link="Ver todo" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          <PostCard post={AB_POSTS.notion} /><PostCard post={AB_POSTS.pg} /><PostCard post={AB_POSTS.astro} />
        </div>
      </section>

      {/* latest + categories split */}
      <section className="ab-wrap" style={{ paddingBottom: 70, display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 48 }}>
        <div>
          <SectionHead title="Últimas publicaciones" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <ListRow post={AB_POSTS.comments} /><ListRow post={AB_POSTS.seo} /><ListRow post={AB_POSTS.images} /><ListRow post={AB_POSTS.og} />
          </div>
        </div>
        <div>
          <SectionHead title="Categorías" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cats.map(({ c, n }) => (
              <a key={c} className="ab-card ab-card-hover" style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Cat cat={c} lg />
                <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{n} posts</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* series */}
      <section style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '60px 0' }}>
        <div className="ab-wrap">
          <SectionHead eyebrow="Aprende paso a paso" title="Series recomendadas" link="Todas las series" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            <SeriesCard title="Construyendo un blog moderno con Next.js" desc="De cero a producción: rutas, datos, SEO y deploy." count={6} level="Intermedio" progress={50} />
            <SeriesCard title="PostgreSQL para proyectos personales" desc="Modelado, índices y consultas que escalan sin dolor." count={5} level="Básico" cat="bases-de-datos" />
            <SeriesCard title="Automatización con APIs e IA" desc="Conecta servicios y agentes para hacer el trabajo aburrido." count={4} level="Avanzado" cat="ia" />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function SectionHead({ eyebrow, title, link }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
      <div>
        {eyebrow && <div className="ab-eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>}
        <h2 style={{ fontSize: 26, fontWeight: 750, letterSpacing: '-.03em' }}>{title}</h2>
      </div>
      {link && <a style={{ fontSize: 14, fontWeight: 600, color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>{link}<Ic name="arrowRight" size={15} sw={2.2} /></a>}
    </div>
  );
}

/* ════════════════════════════ BLOG INDEX (priority) ════════════════════════════ */
function BlogIndexPage() {
  return (
    <div className="ab">
      <Header active="Blog" />
      <section style={{ padding: '60px 0 32px' }}>
        <div className="ab-wrap">
          <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-.04em' }}>Blog</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-3)', lineHeight: 1.6, marginTop: 12, maxWidth: 600 }}>
            Artículos sobre desarrollo web, bases de datos, IA y las cosas que voy aprendiendo al construir software.
          </p>
          <div style={{ maxWidth: 520, marginTop: 26 }}><SearchInput kbd /></div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
            <span className="ab-chip active">Todos</span>
            {CAT_LIST.map((c) => <span key={c} className="ab-chip">{AB_CATS[c].label}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 14 }}>
            <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Ic name="trending" size={14} sw={2.2} />Tags populares</span>
            {POP_TAGS.map((t) => <a key={t} className="ab-tag" style={{ fontSize: 12.5 }}>#{t}</a>)}
          </div>
        </div>
      </section>

      <section className="ab-wrap" style={{ paddingBottom: 28 }}>
        <FeaturedCard post={AB_POSTS.notion} />
      </section>

      <section className="ab-wrap" style={{ paddingBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>Todos los artículos <span style={{ color: 'var(--muted)', fontWeight: 500 }}>· 105</span></h2>
          <button className="ab-chip" style={{ gap: 7 }}><Ic name="filter" size={14} sw={2} />Más recientes<Ic name="chevronDown" size={13} sw={2.2} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          <PostCard post={AB_POSTS.pg} /><PostCard post={AB_POSTS.seo} /><PostCard post={AB_POSTS.comments} />
          <PostCard post={AB_POSTS.astro} /><PostCard post={AB_POSTS.images} /><PostCard post={AB_POSTS.og} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}><Pager page={1} total={9} /></div>
      </section>
      <Footer />
    </div>
  );
}

/* ════════════════════════════ POST INDIVIDUAL ════════════════════════════ */
function PostPage() {
  const toc = [
    { label: 'Por qué un gateway', active: true }, { label: 'Crear el token de Notion' },
    { label: 'Scopes y permisos', sub: true }, { label: 'Exponer la API al agente' },
    { label: 'Rate limiting', sub: true }, { label: 'Probando la conexión' }, { label: 'Conclusión' },
  ];
  return (
    <div className="ab">
      <Header active="Blog" />
      {/* article header */}
      <div className="ab-wrap-narrow" style={{ maxWidth: 820, paddingTop: 32 }}>
        <Breadcrumb items={['Inicio', 'Blog', 'Inteligencia Artificial', 'Conectar API de Notion…']} />
        <div style={{ marginTop: 22 }}><Cat cat="ia" lg /></div>
        <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.035em', lineHeight: 1.12, marginTop: 16 }}>
          Conectar API de Notion a OpenClaw: dale ojos a tu agente para leer tus notas
        </h1>
        <p style={{ fontSize: 19, color: 'var(--ink-3)', lineHeight: 1.6, marginTop: 18 }}>
          Cómo exponer tu workspace de Notion a un agente vía API: tokens, scopes y un gateway minimalista para lecturas seguras.
        </p>
        <div className="ab-meta-row" style={{ marginTop: 22 }}>
          <span className="ab-meta"><Avatar name="José Alejandro" i={1} /></span>
          <span style={{ fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 500 }}>José Alejandro Tejero</span><Sep />
          <Meta icon="calendar">12 mar 2026</Meta><Sep />
          <Meta icon="refresh">Act. 18 mar</Meta><Sep />
          <Meta icon="clock">8 min de lectura</Meta><Sep />
          <Meta icon="message">12 comentarios</Meta>
        </div>
        <div className="ab-tagrow" style={{ marginTop: 16 }}><Tag hash>Notion</Tag><Tag hash>API</Tag><Tag hash>OpenClaw</Tag></div>
      </div>

      <div className="ab-wrap" style={{ marginTop: 30 }}>
        <Thumb cat="ia" label="// hero · notion → openclaw" style={{ aspectRatio: '21/9', borderRadius: 'var(--r-xl)' }} glow />
      </div>

      {/* body + sticky toc */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '44px 40px 0', display: 'grid', gridTemplateColumns: '1fr 232px', gap: 56, alignItems: 'start' }}>
        <article className="ab-prose" style={{ maxWidth: 720 }}>
          <p>Darle a un agente acceso de lectura a tu Notion suena trivial hasta que piensas en los <strong>scopes</strong>, la rotación de tokens y el rate limit. En este post montamos un <a>gateway minimalista</a> que media entre el agente y la API oficial.</p>
          <Callout type="note" title="Antes de empezar">Necesitas una integración interna creada en <strong>notion.so/my-integrations</strong> y permisos de lectura sobre las páginas que quieras exponer.</Callout>
          <h2>Por qué un gateway</h2>
          <p>Exponer el token crudo al agente es una mala idea: pierdes control de cuotas, no puedes auditar y la rotación se vuelve un dolor. Un gateway añade una capa fina donde validas, registras y limitas.</p>
          <h2>Crear el token de Notion</h2>
          <p>Crea la integración, copia el secret y compártelo solo con las páginas necesarias. Guárdalo cifrado — nunca en el cliente.</p>
          <CodeBlock lang="typescript">
{`import { Client } from `}<S>"@notionhq/client"</S>{`;

`}<K>const</K>{` notion = `}<K>new</K>{` `}<F>Client</F>{`({ auth: process.env.`}<N>NOTION_TOKEN</N>{` });

`}<C>// solo lecturas: el gateway nunca escribe</C>{`
`}<K>export async function</K>{` `}<F>readPage</F>{`(id: string) {
  `}<K>return</K>{` notion.pages.`}<F>retrieve</F>{`({ page_id: id });
}`}
          </CodeBlock>
          <h3>Scopes y permisos</h3>
          <p>Limita la integración a lo mínimo. Si el agente solo lee notas, no le des capacidad de escritura ni acceso a bases de datos sensibles.</p>
          <Callout type="tip" title="Tip">Versiona el header <strong>Notion-Version</strong>. Cambios silenciosos en la API pueden romper tu parser sin avisar.</Callout>
          <h2>Exponer la API al agente</h2>
          <p>El agente habla con tu gateway, no con Notion. Devuelve un payload limpio y predecible:</p>
          <blockquote>El agente no necesita conocer la forma de Notion. Necesita una respuesta estable que pueda razonar.</blockquote>
          <h3>Rate limiting</h3>
          <Callout type="warn" title="Advertencia">Notion limita a ~3 req/s. Sin una cola, una ráfaga del agente te dará <strong>429</strong>. Añade backoff exponencial.</Callout>
          <h2>Probando la conexión</h2>
          <p>Con todo en su sitio, una llamada de prueba debería devolver el título de la página y validar los scopes de un vistazo.</p>
        </article>

        <aside style={{ position: 'sticky', top: 88, alignSelf: 'start' }}>
          <TOC items={toc} />
          <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="ab-btn ab-btn-secondary ab-btn-sm" style={{ justifyContent: 'flex-start' }}><Ic name="link" size={15} sw={2} />Copiar enlace</button>
            <button className="ab-btn ab-btn-secondary ab-btn-sm" style={{ justifyContent: 'flex-start' }}><Ic name="twitter" size={15} sw={2} />Compartir</button>
          </div>
        </aside>
      </div>

      {/* series belonging */}
      <div className="ab-wrap-narrow" style={{ maxWidth: 820, marginTop: 48 }}>
        <div className="ab-card" style={{ padding: 24, background: 'var(--grad-soft)', borderColor: '#e2dafb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="ab-badge ab-badge-grad"><Ic name="layers" size={12} sw={2.2} />Serie</span>
            <span style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>Este post forma parte de <strong>Automatización con APIs e IA</strong></span>
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SeriesStep n={1} state="done" title="Tu primer agente con OpenClaw" />
            <SeriesStep n={2} state="current" title="Conectar API de Notion a OpenClaw" />
            <SeriesStep n={3} state="soon" title="Memoria persistente con PostgreSQL" />
          </div>
        </div>
      </div>

      {/* prev/next */}
      <div className="ab-wrap-narrow" style={{ maxWidth: 820, marginTop: 36 }}>
        <PrevNext prev="Configurar API Keys en OpenClaw" next="Memoria persistente con PostgreSQL" />
      </div>

      {/* related */}
      <div className="ab-wrap" style={{ marginTop: 56 }}>
        <SectionHead title="Posts relacionados" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          <PostCard post={AB_POSTS.apikeys} /><PostCard post={AB_POSTS.pg} /><PostCard post={AB_POSTS.comments} />
        </div>
      </div>

      {/* SEO preview (admin aux) */}
      <div className="ab-wrap-narrow" style={{ maxWidth: 820, marginTop: 56 }}><SEOPreview /></div>

      {/* comments */}
      <div className="ab-wrap-narrow" style={{ maxWidth: 820, marginTop: 48, paddingBottom: 64 }}>
        <CommentsSection />
      </div>
      <Footer />
    </div>
  );
}

function CommentsSection({ empty }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <h2 style={{ fontSize: 24, fontWeight: 750, letterSpacing: '-.03em' }}>Comentarios</h2>
        {!empty && <span className="ab-badge ab-badge-soft" style={{ fontSize: 13, textTransform: 'none', letterSpacing: 0 }}>3</span>}
      </div>
      <div style={{ marginTop: 18 }}><CommentForm /></div>
      {empty ? (
        <div style={{ marginTop: 24 }}>
          <EmptyState icon="message" title="Sé la primera persona en comentar.">Aún no hay comentarios en este post. Comparte tu opinión o duda arriba.</EmptyState>
        </div>
      ) : (
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 26 }}>
          {AB_COMMENTS.map((c, i) => <Comment key={i} c={c} i={i} />)}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { HomePage, BlogIndexPage, PostPage, CommentsSection, SectionHead, CAT_LIST, POP_TAGS });
