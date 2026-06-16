/* ============================================================
   Aleliz Blog — Comment/Search states + mini design system
   ============================================================ */
const {
  Ic, Btn, Cat, Tag, Meta, Sep, Thumb, Callout, CodeBlock, K, F, S, C, N, P,
  Comment, CommentForm, EmptyState, SearchInput, Skill, Avatar, AB_COMMENTS,
} = window;

/* ---------- a tiny framed panel for state cards ---------- */
function StatePanel({ title, children, pad = 24 }) {
  return (
    <div className="ab" style={{ padding: pad }}>
      {title && <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>{title}</div>}
      {children}
    </div>
  );
}

/* ════════ COMMENT STATES ════════ */
function StComEmpty() {
  return (
    <StatePanel title="Estado vacío">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 750 }}>Comentarios</h2><span className="ab-badge ab-badge-soft" style={{ textTransform: 'none' }}>0</span>
      </div>
      <CommentForm />
      <div style={{ marginTop: 18 }}><EmptyState icon="message" title="Sé la primera persona en comentar.">Aún no hay comentarios. Comparte tu opinión o duda.</EmptyState></div>
    </StatePanel>
  );
}
function StComSending() {
  return (
    <StatePanel title="Enviando comentario"><CommentForm state="sending" /></StatePanel>
  );
}
function StComError() {
  return (
    <StatePanel title="Error de envío"><CommentForm state="error" /></StatePanel>
  );
}
function StComList() {
  return (
    <StatePanel title="Lista · pendiente + aprobados">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Comment c={{ ...AB_COMMENTS[0], status: 'pending', date: 'hace un momento' }} i={0} />
        <div style={{ height: 1, background: 'var(--line)' }} />
        <Comment c={AB_COMMENTS[1]} i={1} />
        <Comment c={AB_COMMENTS[2]} i={2} />
      </div>
    </StatePanel>
  );
}

/* ════════ SEARCH STATES ════════ */
function StSearchInitial() {
  return (
    <StatePanel title="Estado inicial" pad={0}>
      <div style={{ padding: '34px 28px 20px' }}><SearchInput lg value="" /></div>
      <EmptyState icon="search" title="Busca entre artículos, series y temas técnicos.">Escribe para encontrar posts, series, tags o categorías.</EmptyState>
      <div style={{ padding: '0 28px 30px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 10 }}>BÚSQUEDAS POPULARES</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>{['Next.js','PostgreSQL','Docker','OpenClaw','SEO'].map((t) => <a key={t} className="ab-chip">{t}</a>)}</div>
      </div>
    </StatePanel>
  );
}
function StSearchEmpty() {
  return (
    <StatePanel title="Sin resultados" pad={0}>
      <div style={{ padding: '34px 28px 20px' }}><SearchInput lg value="kubernetes mesh xyz" /></div>
      <EmptyState icon="frown" title="No se encontraron resultados.">No hay coincidencias para tu búsqueda. Prueba con otros términos o revisa la ortografía.</EmptyState>
    </StatePanel>
  );
}

/* ════════ DESIGN SYSTEM ════════ */
function DSColors() {
  const groups = [
    ['Superficies', [['#ffffff','bg','con borde'],['#f8fafc','bg-soft'],['#f1f5f9','bg-soft-2']]],
    ['Tinta', [['#0f172a','ink'],['#334155','ink-2'],['#64748b','ink-3'],['#94a3b8','muted']]],
    ['Acentos', [['#2563eb','blue'],['#7c3aed','violet'],['#06b6d4','cyan'],['#10b981','green'],['#f59e0b','amber']]],
  ];
  return (
    <StatePanel title="Color">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {groups.map(([name, items]) => (
          <div key={name}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 10 }}>{name}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
              {items.map(([hex, label, note]) => (
                <div key={label}>
                  <div className="ab-swatch" style={{ background: hex }} />
                  <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 7, fontWeight: 500 }}>{label}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)' }}>{hex}{note ? ' · ' + note : ''}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 10 }}>Gradiente — solo momentos clave</div>
          <div style={{ height: 56, borderRadius: 'var(--r)', background: 'var(--grad)' }} />
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 7 }}>linear-gradient(115deg, #2563eb → #7c3aed)</div>
        </div>
      </div>
    </StatePanel>
  );
}
function DSType() {
  const rows = [
    ['Display', '52 / 800', 'Hola, soy José', { fontSize: 38, fontWeight: 800, letterSpacing: '-.04em' }],
    ['H1', '40 / 800', 'Título de artículo', { fontSize: 30, fontWeight: 800, letterSpacing: '-.035em' }],
    ['H2', '25 / 750', 'Sección del post', { fontSize: 23, fontWeight: 750, letterSpacing: '-.03em' }],
    ['Body', '17 / 1.75', 'Texto de lectura cómodo con line-height generoso.', { fontSize: 17, color: 'var(--ink-2)', lineHeight: 1.6 }],
    ['Small', '14 / 500', 'Metadata, captions y etiquetas.', { fontSize: 14, color: 'var(--ink-3)', fontWeight: 500 }],
    ['Mono', '13.5', 'const blog = fast;', { fontFamily: 'JetBrains Mono, monospace', fontSize: 13.5, color: 'var(--ink-2)' }],
  ];
  return (
    <StatePanel title="Tipografía · Inter / JetBrains Mono">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map(([name, spec, sample, st]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'baseline', gap: 18, padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
            <div style={{ width: 90, flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)' }}>{spec}</div>
            </div>
            <div style={st}>{sample}</div>
          </div>
        ))}
      </div>
    </StatePanel>
  );
}
function DSSpacing() {
  return (
    <StatePanel title="Radio, sombra y espaciado">
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 12 }}>Border radius</div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 26 }}>
        {[['sm', 8], ['md', 12], ['lg', 16], ['xl', 20]].map(([l, r]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'var(--blue-tint)', border: '1px solid #c7dafd', borderRadius: r }} />
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 7 }}>{l} · {r}px</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 12 }}>Sombras (whisper-soft)</div>
      <div style={{ display: 'flex', gap: 18, marginBottom: 26 }}>
        {[['sh-1', 'var(--sh-1)'], ['sh-2', 'var(--sh-2)'], ['sh-3', 'var(--sh-3)']].map(([l, sh]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ width: 84, height: 56, background: '#fff', border: '1px solid var(--line)', borderRadius: 12, boxShadow: sh }} />
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 9 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 12 }}>Escala de espaciado (4px)</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        {[4, 8, 12, 16, 24, 32, 48].map((s) => (
          <div key={s} style={{ textAlign: 'center' }}>
            <div style={{ width: s, height: s, background: 'var(--violet)', borderRadius: 3, margin: '0 auto' }} />
            <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>{s}</div>
          </div>
        ))}
      </div>
    </StatePanel>
  );
}
function DSButtons() {
  return (
    <StatePanel title="Botones · estados">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Row label="Primary"><Btn variant="primary">Por defecto</Btn><Btn variant="primary" icon="bookOpen">Con icono</Btn><Btn variant="primary" loading>Loading</Btn><Btn variant="primary" disabled>Disabled</Btn></Row>
        <Row label="Gradient"><Btn variant="grad" iconRight="arrowRight">Leer artículo</Btn><Btn variant="grad" icon="download">Descargar</Btn></Row>
        <Row label="Secondary"><Btn variant="secondary">Secondary</Btn><Btn variant="secondary" icon="github">GitHub</Btn></Row>
        <Row label="Ghost"><Btn variant="ghost">Ghost</Btn><Btn variant="ghost" icon="mail">Contactar</Btn></Row>
        <Row label="Focus"><button className="ab-btn ab-btn-secondary" style={{ boxShadow: 'var(--ring)', borderColor: 'var(--blue)' }}>Focus ring</button></Row>
      </div>
    </StatePanel>
  );
}
function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 86, fontSize: 12, color: 'var(--muted)', fontWeight: 600, flexShrink: 0 }}>{label}</span>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}
function DSChips() {
  return (
    <StatePanel title="Chips, pills y badges">
      <Row label="Categorías"><Cat cat="frontend" /><Cat cat="backend" /><Cat cat="bases-de-datos" /><Cat cat="ia" /><Cat cat="devops" /><Cat cat="tutoriales" /></Row>
      <div style={{ height: 16 }} />
      <Row label="Filtros"><span className="ab-chip active">Todos</span><span className="ab-chip">Frontend</span><span className="ab-chip">Backend</span></Row>
      <div style={{ height: 16 }} />
      <Row label="Tags"><a className="ab-tag">#Next.js</a><a className="ab-tag">#PostgreSQL</a><a className="ab-tag">#Docker</a></Row>
      <div style={{ height: 16 }} />
      <Row label="Badges"><span className="ab-badge ab-badge-grad"><Ic name="sparkles" size={12} sw={2.2} />Destacado</span><span className="ab-badge ab-badge-series"><Ic name="layers" size={11} sw={2.2} />Serie</span><span className="ab-badge ab-badge-soft">Borrador</span></Row>
      <div style={{ height: 16 }} />
      <Row label="Estados"><span className="ab-status ab-status-pending"><span className="d" />Pendiente</span><span className="ab-status ab-status-ok"><span className="d" />Aprobado</span><span className="ab-status ab-status-err"><span className="d" />Error</span></Row>
    </StatePanel>
  );
}
function DSElements() {
  return (
    <StatePanel title="Callouts, código e inputs">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Callout type="note" title="Nota">Información de contexto relevante para el lector.</Callout>
        <Callout type="tip" title="Tip">Un atajo o buena práctica que ahorra tiempo.</Callout>
        <Callout type="warn" title="Advertencia">Algo que puede romperse si no tienes cuidado.</Callout>
        <CodeBlock lang="bash">{`$ `}<F>npx</F>{` create-next-app@latest blog
$ `}<F>cd</F>{` blog && `}<F>npm</F>{` run dev`}</CodeBlock>
        <div className="ab-field"><label>Input de texto</label><input className="ab-input" placeholder="Escribe aquí…" /></div>
        <div className="ab-field"><label>Input enfocado</label><input className="ab-input" defaultValue="postgres" style={{ borderColor: 'var(--blue)', boxShadow: 'var(--ring)' }} /></div>
      </div>
    </StatePanel>
  );
}

Object.assign(window, {
  StatePanel, StComEmpty, StComSending, StComError, StComList, StSearchInitial, StSearchEmpty,
  DSColors, DSType, DSSpacing, DSButtons, DSChips, DSElements, Row,
});
