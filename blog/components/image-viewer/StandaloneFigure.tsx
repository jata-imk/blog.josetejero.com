import Link from 'next/link'
import { figureAccessibleLabel, type ViewerFigure } from '@/lib/figures'

export function StandaloneFigure({
  figure,
  position,
  total,
  basePath,
}: {
  figure: ViewerFigure
  position: number
  total: number
  basePath: string
}) {
  return (
    <noscript>
      <section className="standalone-figure" aria-labelledby="standalone-figure-title">
        <p>Figura {position} de {total}</p>
        <h2 id="standalone-figure-title">{figureAccessibleLabel(figure, position)}</h2>
        <img
          src={figure.fullSrc}
          width={figure.width}
          height={figure.height}
          alt={figure.alt}
        />
        <Link href={basePath}>Volver al contenido</Link>
      </section>
    </noscript>
  )
}

