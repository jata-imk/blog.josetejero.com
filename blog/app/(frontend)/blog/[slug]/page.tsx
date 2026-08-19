import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPostBySlug, getPosts, getPostsInSeries, getCommentThreads } from '@/lib/data'
import { coverImageOf } from '@/lib/media'
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
import { JsonLd } from '@/components/seo/JsonLd'
import { blogPostingJsonLd, postBreadcrumbJsonLd, alternatesFor, SITE_NAME, SITE_LOCALE } from '@/lib/seo'
import type { Category, Tag as TagType, Series, User, Comment } from '@/payload-types'
import type { PublicComment } from '@/components/comments/CommentsSection'

type Props = { params: Promise<{ slug: string }> }

const COMMENT_DATE_FORMAT = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' })

/**
 * Recorta el documento de Payload a lo que se pinta. Importante: los comentarios se envían a una
 * isla cliente, así que todo lo que se deje aquí acaba viajando al navegador — `authorEmail` se
 * queda fuera a propósito. La fecha se formatea en el servidor para no depender de la zona horaria
 * del visitante y evitar desajustes de hidratación.
 */
function toPublicComment(comment: Comment): PublicComment {
  return {
    id: comment.id,
    authorName: comment.authorName,
    date: COMMENT_DATE_FORMAT.format(new Date(comment.createdAt)),
    text: comment.body,
  }
}

export const dynamicParams = true

export async function generateStaticParams() {
  const { docs: posts } = await getPosts(100)
  return posts.map((post) => ({ slug: post.slug }))
}

/* ============================================================
   Metadata de la entrada (ADR 0029)

   Se fusiona con el default del layout: aquí solo se declara lo
   específico del post (título, descripción, canonical, OG article,
   portada); siteName, locale, template de título, etc. se heredan.
   ============================================================ */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}

  // Portada en tamaño hero (1920×1080, 16:9) — supera de sobra el
  // mínimo recomendado de og:image (1200×630) y ya existe en Media
  const cover = coverImageOf(post, 'hero')

  const author =
    typeof post.author === 'object' && post.author !== null ? (post.author as User) : null

  return {
    // El layout lo convierte en "Mi post · José Tejero" vía title.template
    title: post.title,
    description: post.excerpt ?? undefined,

    // URL canónica: la ruta editorial oficial del post (ADR 0009).
    // Si el post llegara a ser accesible por más de una URL (filtros,
    // UTM, etc.), este tag le dice a Google cuál es LA original y
    // evita que el "crédito" de búsqueda se reparta entre duplicados.
    // (alternatesFor también re-declara el autodiscovery del RSS,
    // porque Next reemplaza — no fusiona — el objeto del layout.)
    alternates: alternatesFor(`/blog/${post.slug}`),

    openGraph: {
      // OJO: cuando una página define `openGraph`, Next REEMPLAZA el
      // objeto completo del layout (no lo fusiona campo a campo), así
      // que siteName y locale deben repetirse aquí
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      // type article activa los campos específicos de artículo en OG
      type: 'article',
      title: post.title,
      description: post.excerpt ?? undefined,
      url: `/blog/${post.slug}`,
      // Fechas en ISO 8601: redes y buscadores muestran "publicado el…"
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: author?.name ? [author.name] : undefined,
      // Con imagen propia sobreescribimos la og:image default del sitio;
      // sin portada, Next mantiene la default (opengraph-image.tsx)
      ...(cover ? { images: [{ url: cover.url, alt: cover.alt || post.title }] } : {}),
    },

    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt ?? undefined,
      ...(cover ? { images: [cover.url] } : {}),
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  // Series object is populated at depth:2 in getPostBySlug
  const series =
    typeof post.series === 'object' && post.series !== null ? (post.series as Series) : null

  const [highlightMap, seriesPosts, commentThreads] = await Promise.all([
    highlightLexicalCode(post.body?.root as { children?: LexicalChildNode[] } | undefined),
    series ? getPostsInSeries(series.id) : Promise.resolve([]),
    getCommentThreads(post.id),
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

  const heroImage = coverImageOf(post, 'hero')

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
      {/* JSON-LD del artículo: BlogPosting (habilita resultados
          enriquecidos con autor/fecha/portada) + BreadcrumbList
          (Google puede mostrar la ruta en vez de la URL cruda).
          Reutilizan los mismos datos del post que el metadata. */}
      <JsonLd data={blogPostingJsonLd(post)} />
      <JsonLd data={postBreadcrumbJsonLd(post, primaryCategory)} />

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

      {/* Portada del post, si el autor cargó una (ver lib/media.ts) */}
      {heroImage && (
        <div className="post-hero">
          <Thumb slug={primaryCategory?.slug} image={heroImage} sizes="(max-width: 820px) 100vw, 820px" priority />
        </div>
      )}

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
      <CommentsSection
        postId={String(post.id)}
        threads={commentThreads.map(({ comment, replies }) => ({
          comment: toPublicComment(comment),
          replies: replies.map(toPublicComment),
        }))}
      />

    </>
  )
}
