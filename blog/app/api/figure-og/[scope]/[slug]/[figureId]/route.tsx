import { getPostFigureContext, getSeriesFigureContext } from '@/lib/data/figure-pages'
import { renderFigureOpenGraph } from '@/lib/figure-og'

export const runtime = 'nodejs'
export const revalidate = 3600

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ scope: string; slug: string; figureId: string }> },
) {
  const { scope, slug, figureId } = await params
  const context = scope === 'blog'
    ? await getPostFigureContext(slug, figureId)
    : scope === 'series'
      ? await getSeriesFigureContext(slug, figureId)
      : null
  if (!context) return new Response('Figura no encontrada', { status: 404 })

  return renderFigureOpenGraph(context.figure, context.position + 1, context.parent.title)
}

