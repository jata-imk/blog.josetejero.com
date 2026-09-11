import type { Metadata } from 'next'
import { getPostBySlug, getPosts } from '@/lib/data'
import { coverImageOf } from '@/lib/media'
import { PostDetailPage } from '@/components/post/PostDetailPage'
import { alternatesFor, SITE_NAME, SITE_LOCALE } from '@/lib/seo'
import type { User } from '@/payload-types'

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
  const cover = coverImageOf(post, 'hero')
  const author = typeof post.author === 'object' && post.author !== null ? (post.author as User) : null

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: alternatesFor(`/blog/${post.slug}`),
    openGraph: {
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type: 'article',
      title: post.title,
      description: post.excerpt ?? undefined,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: author?.name ? [author.name] : undefined,
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
  return <PostDetailPage slug={slug} />
}
