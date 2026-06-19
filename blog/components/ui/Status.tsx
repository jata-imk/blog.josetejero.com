type Variant = 'pending' | 'ok' | 'err'

const LABELS: Record<Variant, string> = {
  pending: 'Pendiente',
  ok:      'Aprobado',
  err:     'Rechazado',
}

export function Status({ variant }: { variant: Variant }) {
  return (
    <span className={`ab-status ab-status-${variant}`}>
      <span className="d" />
      {LABELS[variant]}
    </span>
  )
}
