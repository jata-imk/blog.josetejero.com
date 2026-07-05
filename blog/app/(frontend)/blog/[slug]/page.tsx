import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPostBySlug, getPosts, getPostsInSeries, getCommentsByPost } from '@/lib/data'
import { makeBodyConverters, extractToc } from '@/lib/lexical'
import { highlightLexicalCode, type LexicalChildNode } from '@/lib/code-highlight'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Cat } from '@/components/ui/Cat'
import { Tag, TagRow } from '@/components/ui/Tag'
import { Meta, MetaSep } from '@/components/ui/Meta'
import { TableOfContents, MobileToc } from '@/components/blocks/TableOfContents'
import { Prose } from '@/components/blocks/Prose'
import { AuthorCard } from '@/components/post/AuthorCard'
import { PrevNext } from '@/components/post/PrevNext'
import { SeriesNav } from '@/components/series/SeriesNav'
import { CommentForm } from '@/components/comments/CommentForm'
import { Comment } from '@/components/comments/Comment'
import type { Category, Tag as TagType, Series, User } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = true

export async function generateStaticParams() {
  const { docs: posts } = await getPosts(100)
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  // Series object is populated at depth:2 in getPostBySlug
  const series =
    typeof post.series === 'object' && post.series !== null ? (post.series as Series) : null

  const [highlightMap, seriesPosts, comments] = await Promise.all([
    highlightLexicalCode(post.body?.root as { children?: LexicalChildNode[] } | undefined),
    series ? getPostsInSeries(series.id) : Promise.resolve([]),
    getCommentsByPost(post.id),
  ])

  // Derive TOC from Lexical tree — not persisted (ADR 0012)
  const toc = extractToc(post.body?.root as { children?: LexicalChildNode[] } | undefined)

  // Derive visible position within series — not stored on model (ADR 0012)
  const seriesIndex = series ? seriesPosts.findIndex((p) => p.id === post.id) : -1

  const prevPost =
    series && seriesIndex > 0
      ? { title: seriesPosts[seriesIndex - 1].title, href: `/blog/${seriesPosts[seriesIndex - 1].slug}` }
      : undefined

  const nextPost =
    series && seriesIndex >= 0 && seriesIndex < seriesPosts.length - 1
      ? { title: seriesPosts[seriesIndex + 1].title, href: `/blog/${seriesPosts[seriesIndex + 1].slug}` }
      : undefined

  const publishedAt = post.publishedAt
    ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date(post.publishedAt))
    : null

  const author =
    typeof post.author === 'object' && post.author !== null ? (post.author as User) : null

  const categories = ((post.categories ?? []) as (number | Category)[]).filter(
    (c): c is Category => typeof c === 'object' && c !== null,
  )

  const tags = ((post.tags ?? []) as (number | TagType)[]).filter(
    (t): t is TagType => typeof t === 'object' && t !== null,
  )

  const primaryCategory = categories[0] ?? null

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Blog', href: '/blog' },
    ...(primaryCategory
      ? [{ label: primaryCategory.name, href: `/categorias/${primaryCategory.slug}` }]
      : []),
    { label: post.title },
  ]

  return (
    <>
      {/* Cabecera del artículo — máx 820px (handoff) */}
      <div className="post-head">
        <Breadcrumb items={breadcrumbItems} />

        {primaryCategory && (
          <div style={{ marginTop: 20 }}>
            <Cat name={primaryCategory.name} slug={primaryCategory.slug} lg />
          </div>
        )}

        <h1 className="post-title">{post.title}</h1>

        {post.excerpt && (
          <p className="post-excerpt">{post.excerpt}</p>
        )}

        {/* Meta row */}
        <div className="post-meta-row">
          {author?.name && (
            <>
              <span style={{ fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 500 }}>
                {author.name}
              </span>
              <MetaSep />
            </>
          )}
          {publishedAt && (
            <Meta icon="calendar">
              <time dateTime={post.publishedAt ?? undefined}>{publishedAt}</time>
            </Meta>
          )}
          {series && seriesIndex >= 0 && (
            <>
              <MetaSep />
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                Parte {seriesIndex + 1} de {seriesPosts.length}
              </span>
            </>
          )}
        </div>

        {tags.length > 0 && (
          <div className="post-tags-row">
            <TagRow>
              {tags.map((tag) => (
                <Tag key={tag.id} slug={tag.slug}>{tag.name}</Tag>
              ))}
            </TagRow>
          </div>
        )}

        {/* Mobile TOC — colapsado por defecto, oculto en desktop */}
        <MobileToc items={toc} />
      </div>

      {/* Cuerpo: artículo (izquierda) + TOC sticky (derecha, solo desktop) */}
      <div className="post-body">
        <article className="post-article">
          <Prose>
            {post.body ? (
              <RichText data={post.body} converters={makeBodyConverters(highlightMap)} />
            ) : (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
                Este post no tiene contenido todavía.
              </p>
            )}
          </Prose>
        </article>

        {toc.length > 0 && (
          <aside className="post-body-aside">
            <TableOfContents items={toc} />
          </aside>
        )}
      </div>

      {/* Bloque de serie completo — todos los posts del track */}
      {series && seriesPosts.length > 0 && (
        <div className="post-wrap" style={{ marginTop: 48 }}>
          <SeriesNav series={series} posts={seriesPosts} currentPostId={post.id} />
        </div>
      )}

      {/* Anterior / Siguiente (solo dentro de la misma serie) */}
      {(prevPost || nextPost) && (
        <div className="post-wrap" style={{ marginTop: 36 }}>
          <PrevNext prev={prevPost} next={nextPost} />
        </div>
      )}

      {/* Tarjeta del autor */}
      {author?.name && (
        <div className="post-wrap" style={{ marginTop: 32 }}>
          <AuthorCard name={author.name} />
        </div>
      )}

      {/* Comentarios */}
      <div className="post-comments" style={{ marginTop: 48 }}>
        <div className="post-comments-head">
          <h2 className="post-comments-title">Comentarios</h2>
          {comments.length > 0 && (
            <span
              className="badge badge-soft"
              style={{ fontSize: 13, textTransform: 'none', letterSpacing: 0 }}
            >
              {comments.length}
            </span>
          )}
        </div>

        <CommentForm postId={String(post.id)} />

        {comments.length === 0 ? (
          <p style={{ marginTop: 24, color: 'var(--ink-3)', fontSize: 14, fontStyle: 'italic' }}>
            Sé la primera persona en comentar.
          </p>
        ) : (
          <div className="post-comments-list">
            {comments.map((c) => (
              <Comment
                key={c.id}
                authorName={c.authorName}
                date={new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(
                  new Date(c.createdAt),
                )}
                text={c.body}
              />
            ))}
          </div>
        )}
      </div>

    </>
  )
}
