import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPostBySlug, getPostsInSeries, getCommentThreads } from '@/lib/data'
import { coverImageOf } from '@/lib/media'
import { coverFigureOf, extractViewerFigures } from '@/lib/figures'
import { makeBodyConverters, extractToc } from '@/lib/lexical'
import { Thumb } from '@/components/ui/Thumb'
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
import { CommentsSection } from '@/components/comments/CommentsSection'
import { FigureTrigger, FigureViewerProvider } from '@/components/image-viewer/FigureViewer'
import { StandaloneFigure } from '@/components/image-viewer/StandaloneFigure'
import { JsonLd } from '@/components/seo/JsonLd'
import { blogPostingJsonLd, postBreadcrumbJsonLd } from '@/lib/seo'
import type { Category, Tag as TagType, Series, User, Comment } from '@/payload-types'
import type { PublicComment } from '@/components/comments/CommentsSection'

const COMMENT_DATE_FORMAT = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' })

function toPublicComment(comment: Comment): PublicComment {
  return {
    id: comment.id,
    authorName: comment.authorName,
    date: COMMENT_DATE_FORMAT.format(new Date(comment.createdAt)),
    text: comment.body,
  }
}

export async function PostDetailPage({ slug, initialFigureId }: { slug: string; initialFigureId?: string }) {
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const basePath = `/blog/${post.slug}`
  const coverFigure = coverFigureOf(post, basePath)
  const figures = extractViewerFigures(post.body, basePath, coverFigure)
  const initialFigureIndex = initialFigureId
    ? figures.findIndex((figure) => figure.id === initialFigureId)
    : -1
  if (initialFigureId && initialFigureIndex < 0) notFound()

  const series = typeof post.series === 'object' && post.series !== null ? (post.series as Series) : null
  const [highlightMap, seriesPosts, commentThreads] = await Promise.all([
    highlightLexicalCode(post.body?.root as { children?: LexicalChildNode[] } | undefined),
    series ? getPostsInSeries(series.id) : Promise.resolve([]),
    getCommentThreads(post.id),
  ])
  const toc = extractToc(post.body?.root as { children?: LexicalChildNode[] } | undefined)
  const seriesIndex = series ? seriesPosts.findIndex((item) => item.id === post.id) : -1
  const prevPost = series && seriesIndex > 0
    ? { title: seriesPosts[seriesIndex - 1].title, href: `/blog/${seriesPosts[seriesIndex - 1].slug}` }
    : undefined
  const nextPost = series && seriesIndex >= 0 && seriesIndex < seriesPosts.length - 1
    ? { title: seriesPosts[seriesIndex + 1].title, href: `/blog/${seriesPosts[seriesIndex + 1].slug}` }
    : undefined
  const publishedAt = post.publishedAt
    ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date(post.publishedAt))
    : null
  const author = typeof post.author === 'object' && post.author !== null ? (post.author as User) : null
  const categories = ((post.categories ?? []) as (number | Category)[]).filter(
    (category): category is Category => typeof category === 'object' && category !== null,
  )
  const tags = ((post.tags ?? []) as (number | TagType)[]).filter(
    (tag): tag is TagType => typeof tag === 'object' && tag !== null,
  )
  const primaryCategory = categories[0] ?? null
  const heroImage = coverImageOf(post, 'hero')
  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Blog', href: '/blog' },
    ...(primaryCategory ? [{ label: primaryCategory.name, href: `/categorias/${primaryCategory.slug}` }] : []),
    { label: post.title },
  ]

  return (
    <FigureViewerProvider figures={figures} basePath={basePath} initialFigureId={initialFigureId}>
      <JsonLd data={blogPostingJsonLd(post)} />
      <JsonLd data={postBreadcrumbJsonLd(post, primaryCategory)} />

      {initialFigureIndex >= 0 && (
        <StandaloneFigure
          figure={figures[initialFigureIndex]}
          position={initialFigureIndex + 1}
          total={figures.length}
          basePath={basePath}
        />
      )}

      <div className="post-head">
        <Breadcrumb items={breadcrumbItems} />
        {primaryCategory && (
          <div style={{ marginTop: 20 }}>
            <Cat name={primaryCategory.name} slug={primaryCategory.slug} lg />
          </div>
        )}
        <h1 className="post-title" tabIndex={-1}>{post.title}</h1>
        {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
        <div className="post-meta-row">
          {author?.name && (
            <>
              <span style={{ fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 500 }}>{author.name}</span>
              <MetaSep />
            </>
          )}
          {publishedAt && (
            <Meta icon="calendar"><time dateTime={post.publishedAt ?? undefined}>{publishedAt}</time></Meta>
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
            <TagRow>{tags.map((tag) => <Tag key={tag.id} slug={tag.slug}>{tag.name}</Tag>)}</TagRow>
          </div>
        )}
        <MobileToc items={toc} />
      </div>

      {heroImage && coverFigure && (
        <div className="post-hero">
          <FigureTrigger figure={coverFigure} className="post-hero-figure-trigger">
            <Thumb slug={primaryCategory?.slug} image={heroImage} sizes="(max-width: 820px) 100vw, 820px" priority />
          </FigureTrigger>
        </div>
      )}

      <div className="post-body">
        <article className="post-article">
          <Prose>
            {post.body ? (
              <RichText data={post.body} converters={makeBodyConverters(highlightMap, { figures })} />
            ) : (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Este post no tiene contenido todavía.</p>
            )}
          </Prose>
        </article>
        {toc.length > 0 && (
          <aside className="post-body-aside"><TableOfContents items={toc} /></aside>
        )}
      </div>

      {series && seriesPosts.length > 0 && (
        <div className="post-wrap" style={{ marginTop: 48 }}>
          <SeriesNav series={series} posts={seriesPosts} currentPostId={post.id} />
        </div>
      )}
      {(prevPost || nextPost) && (
        <div className="post-wrap" style={{ marginTop: 36 }}><PrevNext prev={prevPost} next={nextPost} /></div>
      )}
      {author?.name && (
        <div className="post-wrap" style={{ marginTop: 32 }}><AuthorCard name={author.name} /></div>
      )}
      <CommentsSection
        postId={String(post.id)}
        threads={commentThreads.map(({ comment, replies }) => ({
          comment: toPublicComment(comment),
          replies: replies.map(toPublicComment),
        }))}
      />
    </FigureViewerProvider>
  )
}

