/* ============================================================
   Aleliz Blog — Canvas assembly + render entry
   Add ?measure=1 to the URL to print natural heights for tuning.
   ============================================================ */
const W = window;

/* Each artboard: [id, label, Component, width, height] */
const SECTIONS = [
  {
    id: 'pages', title: 'Páginas · Desktop',
    subtitle: 'Las pantallas principales del blog a 1180px. Doble-clic para enfocar.',
    boards: [
      ['blog',   'Blog index ★',      W.BlogIndexPage, 1180, 2360],
      ['home',   'Home / Inicio',     W.HomePage,      1180, 2752],
      ['post',   'Post individual',   W.PostPage,      1180, 5348],
      ['serie',  'Serie',             W.SeriePage,     1180, 2320],
      ['cat',    'Categoría',         W.CategoryPage,  1180, 1846],
      ['tag',    'Tag',               W.TagPage,       1180, 1408],
      ['search', 'Búsqueda',          W.SearchPage,    1180, 1456],
      ['about',  'Sobre mí',          W.AboutPage,     1180, 2382],
      ['e404',   '404',               W.NotFoundPage,  1180, 1040],
    ],
  },
  {
    id: 'comments', title: 'Comentarios · Estados',
    subtitle: 'Vacío, enviando, error y lista con moderación.',
    boards: [
      ['c-empty', 'Estado vacío',  W.StComEmpty,   560, 712],
      ['c-list',  'Lista',         W.StComList,    560, 540],
      ['c-send',  'Enviando',      W.StComSending, 560, 360],
      ['c-err',   'Error',         W.StComError,   560, 408],
    ],
  },
  {
    id: 'search-states', title: 'Búsqueda · Estados',
    subtitle: 'Estado inicial y sin resultados.',
    boards: [
      ['s-init',  'Estado inicial',  W.StSearchInitial, 560, 470],
      ['s-empty', 'Sin resultados',  W.StSearchEmpty,   560, 396],
    ],
  },
  {
    id: 'mobile', title: 'Mobile',
    subtitle: 'Variantes responsive en una sola columna · 390px.',
    boards: [
      ['m-home',  'Home',     W.MobileHome,  390, 1356],
      ['m-blog',  'Blog',     W.MobileBlog,  390, 1180],
      ['m-post',  'Post',     W.MobilePost,  390, 1448],
      ['m-serie', 'Serie',    W.MobileSerie, 390, 1170],
      ['m-about', 'Sobre mí', W.MobileAbout, 390, 1100],
    ],
  },
  {
    id: 'system', title: 'Sistema de diseño',
    subtitle: 'Tokens y componentes reutilizables para Next.js + Tailwind.',
    boards: [
      ['ds-color',   'Color',           W.DSColors,   620, 712],
      ['ds-type',    'Tipografía',      W.DSType,     560, 540],
      ['ds-space',   'Radio · Sombra',  W.DSSpacing,  560, 530],
      ['ds-btn',     'Botones',         W.DSButtons,  540, 430],
      ['ds-chip',    'Chips · Badges',  W.DSChips,    560, 470],
      ['ds-el',      'Callouts · Code', W.DSElements, 560, 808],
    ],
  },
];

function App() {
  const { DesignCanvas, DCSection, DCArtboard } = W;
  return (
    <DesignCanvas>
      {SECTIONS.map((sec) => (
        <DCSection key={sec.id} id={sec.id} title={sec.title} subtitle={sec.subtitle}>
          {sec.boards.map(([id, label, Comp, w, h]) => (
            <DCArtboard key={id} id={id} label={label} width={w} height={h} style={{ borderRadius: 14, background: '#fff' }}>
              <Comp />
            </DCArtboard>
          ))}
        </DCSection>
      ))}
    </DesignCanvas>
  );
}

/* ---------- measure mode ---------- */
function measure() {
  const out = [];
  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;left:-99999px;top:0;';
  document.body.appendChild(host);
  SECTIONS.forEach((sec) => sec.boards.forEach(([id, label, Comp, w]) => {
    const d = document.createElement('div');
    d.style.width = w + 'px';
    host.appendChild(d);
    ReactDOM.createRoot(d).render(<Comp />);
    out.push([id, w, d]);
  }));
  setTimeout(() => {
    const res = {};
    out.forEach(([id, w, d]) => { res[id] = Math.ceil(d.firstChild ? d.firstChild.scrollHeight : d.scrollHeight); });
    console.log('MEASURE ' + JSON.stringify(res));
  }, 1200);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
if (new URLSearchParams(location.search).get('measure')) {
  root.render(<div style={{ fontFamily: 'Inter', padding: 20 }}>Measuring…</div>);
  measure();
} else {
  root.render(<App />);
}
