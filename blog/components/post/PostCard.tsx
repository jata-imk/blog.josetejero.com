import type { CatInfo } from '../ui/Cat'
import { Cat } from '../ui/Cat'
import { Badge } from '../ui/Badge'
import { Tag, TagRow } from '../ui/Tag'
import { Meta, MetaSep } from '../ui/Meta'
import { Thumb } from '../ui/Thumb'

export type PostCardTag = string | { name: string; slug?: string }

export type PostCardProps = {
  category?: CatInfo | null
  title: string
  excerpt: string
  tags?: PostCardTag[]
  date: string
  readTime: string
  commentCount?: number
  inSeries?: boolean
  href?: string
}

export function PostCard({
  category,
  title,
  excerpt,
  tags = [],
  date,
  readTime,
  commentCount,
  inSeries,
  href = '#',
}: PostCardProps) {
  return (
    <article className="card card-hover post-card">
      <a href={href} tabIndex={-1} aria-hidden="true">
        <Thumb slug={category?.slug} />
      </a>
      <div className="post-card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {category && <Cat name={category.name} slug={category.slug} />}
          {inSeries && <Badge variant="series" />}
        </div>
        <a href={href}>
          <h3 className="post-card-title">{title}</h3>
        </a>
        <p className="post-card-excerpt">{excerpt}</p>
        {tags.length > 0 && (
          <TagRow>
            {tags.map((t) => {
              const name = typeof t === 'string' ? t : t.name
              const slug = typeof t === 'string' ? undefined : t.slug
              return <Tag key={slug ?? name} slug={slug}>{name}</Tag>
            })}
          </TagRow>
        )}
        <div className="post-card-foot">
          <Meta icon="calendar">{date}</Meta>
          <MetaSep />
          <Meta icon="clock">{readTime}</Meta>
          {commentCount != null && (
            <>
              <MetaSep />
              <Meta icon="message">{commentCount}</Meta>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
