import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPostBySlug } from '@/lib/data'
import { makeBodyConverters } from '@/lib/lexical/converters'
import { highlightLexicalCode, type LexicalChildNode } from '@/lib/code-highlight'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

type Props = { params: Promise<{ slug: string }> }

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

  // Pre-resaltado de los bloques de código en servidor (Shiki, ADR 0008).
  const highlightMap = await highlightLexicalCode(
    post.body?.root as { children?: LexicalChildNode[] } | undefined,
  )

  const publishedAt = post.publishedAt
    ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date(post.publishedAt))
    : null

  return (
    <>
      <Header activePath="/blog" />

      <main className="wrap" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <article style={{ maxWidth: 720, marginInline: 'auto' }}>
          {/* post header */}
          <header style={{ marginBottom: 40 }}>
            {publishedAt && (
              <time
                dateTime={post.publishedAt ?? undefined}
                style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 12 }}
              >
                {publishedAt}
              </time>
            )}
            <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.15, marginBottom: 18 }}>
              {post.title}
            </h1>
            {post.excerpt && (
              <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--ink-3)' }}>
                {post.excerpt}
              </p>
            )}
          </header>

          {/* rich-text body */}
          {post.body ? (
            <div className="ab-prose">
              <RichText data={post.body} converters={makeBodyConverters(highlightMap)} />
            </div>
          ) : (
            <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Este post no tiene contenido todavía.</p>
          )}
        </article>
      </main>

      <Footer />
    </>
  )
}
