export type CatKey =
  | 'frontend'
  | 'backend'
  | 'bases-de-datos'
  | 'ia'
  | 'devops'
  | 'tutoriales'
  | 'opinion'

export const CAT_LABELS: Record<CatKey, string> = {
  'frontend':       'Frontend',
  'backend':        'Backend',
  'bases-de-datos': 'Bases de Datos',
  'ia':             'Inteligencia Artificial',
  'devops':         'DevOps',
  'tutoriales':     'Tutoriales',
  'opinion':        'Opinión',
}

export function Cat({ cat, lg }: { cat: CatKey; lg?: boolean }) {
  return (
    <span className={`cat-pill${lg ? ' cat-pill-lg' : ''}`} data-cat={cat}>
      <span className="dot" />
      {CAT_LABELS[cat]}
    </span>
  )
}
