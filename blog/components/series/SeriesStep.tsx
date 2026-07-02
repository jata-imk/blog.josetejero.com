type StepState = 'done' | 'current' | 'soon'

export function SeriesStep({
  number,
  title,
  state,
  href,
  depth = 0,
}: {
  number: number
  title: string
  state: StepState
  href?: string
  /** Nivel de indentación dentro de la serie (0 = raíz, 1 = sub-artículo). ADR 0023. */
  depth?: number
}) {
  // 24px por nivel — token de spacing coherente con el diseño (1.5rem)
  const marginLeft = depth > 0 ? depth * 24 : 0

  const inner = (
    <div className={`ab-step ${state}`} style={marginLeft > 0 ? { marginLeft } : undefined}>
      <div className="ab-step-num">{number}</div>
      <div>
        <div style={{ fontWeight: 650, fontSize: 15, lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>
          {state === 'done' ? 'Completado' : state === 'current' ? 'En progreso' : 'Próximamente'}
        </div>
      </div>
    </div>
  )

  return href && state !== 'soon' ? <a href={href}>{inner}</a> : inner
}

export function SeriesProgress({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div>
      <div className="ab-progress">
        <i style={{ width: `${pct}%` }} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
        {pct}% completado
      </div>
    </div>
  )
}
