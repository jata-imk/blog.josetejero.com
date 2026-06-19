import type { CatKey } from '../ui/Cat'
import { Cat } from '../ui/Cat'
import { Badge } from '../ui/Badge'
import { Meta, MetaSep } from '../ui/Meta'
import { Thumb } from '../ui/Thumb'
import { Ic } from '../ui/Ic'

export function FeaturedCard({
  cat,
  title,
  excerpt,
  date,
  readTime,
  href = '#',
}: {
  cat: CatKey
  title: string
  excerpt: string
  date: string
  readTime: string
  href?: string
}) {
  return (
    <article className="card card-hover ab-feat">
      <Thumb cat={cat} glow style={{ minHeight: 340 }} />
      <div className="ab-feat-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge variant="grad">Destacado</Badge>
          <Cat cat={cat} />
        </div>
        <h3 className="ab-feat-title">{title}</h3>
        <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.6 }}>{excerpt}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Meta icon="calendar">{date}</Meta>
          <MetaSep />
          <Meta icon="clock">{readTime}</Meta>
        </div>
        <a href={href} className="btn btn-grad" style={{ alignSelf: 'flex-start' }}>
          Leer artículo<Ic name="arrowRight" size={15} sw={2.2} />
        </a>
      </div>
    </article>
  )
}
