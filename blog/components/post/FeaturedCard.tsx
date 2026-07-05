import type { CatInfo } from '../ui/Cat'
import { Cat } from '../ui/Cat'
import { Badge } from '../ui/Badge'
import { Meta, MetaSep } from '../ui/Meta'
import { Thumb } from '../ui/Thumb'
import { Ic } from '../ui/Ic'
import type { CoverImage } from '@/lib/media'

export function FeaturedCard({
  category,
  title,
  excerpt,
  date,
  readTime,
  href = '#',
  image,
}: {
  category?: CatInfo | null
  title: string
  excerpt: string
  date: string
  readTime: string
  href?: string
  image?: CoverImage | null
}) {
  return (
    <article className="card card-hover ab-feat">
      <Thumb slug={category?.slug} glow image={image} sizes="(max-width: 768px) 100vw, 700px" priority />
      <div className="ab-feat-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge variant="grad">Destacado</Badge>
          {category && <Cat name={category.name} slug={category.slug} />}
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
