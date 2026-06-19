import type { CatKey } from '../ui/Cat'
import { Cat } from '../ui/Cat'
import { Badge } from '../ui/Badge'
import { Meta, MetaSep } from '../ui/Meta'
import { Thumb } from '../ui/Thumb'

export function ListRow({
  cat,
  title,
  date,
  readTime,
  inSeries,
  href = '#',
}: {
  cat: CatKey
  title: string
  date: string
  readTime: string
  inSeries?: boolean
  href?: string
}) {
  return (
    <a className="list-row" href={href}>
      <Thumb
        cat={cat}
        style={{ width: 120, height: 80, flexShrink: 0, borderRadius: 'var(--r)', border: 0 }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Cat cat={cat} />
          {inSeries && <Badge variant="series" />}
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 650, letterSpacing: '-.02em', lineHeight: 1.35 }}>
          {title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Meta icon="calendar">{date}</Meta>
          <MetaSep />
          <Meta icon="clock">{readTime}</Meta>
        </div>
      </div>
    </a>
  )
}
