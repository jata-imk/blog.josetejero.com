import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PostDetailPage } from '@/components/post/PostDetailPage'
import { getPostFigureContext } from '@/lib/data/figure-pages'
import { figureMetadata } from '@/lib/figure-metadata'

type Props = { params: Promise<{ slug: string; figureId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, figureId } = await params
  const context = await getPostFigureContext(slug, figureId)
  return context ? figureMetadata('blog', context) : {}
}

export default async function PostFigurePage({ params }: Props) {
  const { slug, figureId } = await params
  const context = await getPostFigureContext(slug, figureId)
  if (!context) notFound()
  return <PostDetailPage slug={slug} initialFigureId={figureId} />
}

