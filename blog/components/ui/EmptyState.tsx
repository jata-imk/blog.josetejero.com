import { Ic } from './Ic'

type IconKind = 'message' | 'search' | 'frown'

export function EmptyState({
  icon = 'frown',
  title,
  description,
}: {
  icon?: IconKind
  title: string
  description?: string
}) {
  return (
    <div className="ab-empty">
      <div className="ab-empty-ic">
        <Ic name={icon} size={26} sw={1.6} />
      </div>
      <h4>{title}</h4>
      {description && <p>{description}</p>}
    </div>
  )
}
