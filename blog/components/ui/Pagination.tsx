import { Ic } from './Ic'

export function Pagination({
  currentPage,
  totalPages,
  getHref,
}: {
  currentPage: number
  totalPages: number
  getHref: (page: number) => string
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <nav className="ab-pager" aria-label="Paginación">
      <a
        href={hasPrev ? getHref(currentPage - 1) : undefined}
        aria-disabled={!hasPrev}
        aria-label="Página anterior"
        style={{ pointerEvents: hasPrev ? 'auto' : 'none' }}
      >
        <button className="ab-pager-btn" disabled={!hasPrev} aria-hidden="true">
          <Ic name="chevLeft" size={16} sw={2.2} />
        </button>
      </a>

      {pages.map((p) => (
        <a key={p} href={getHref(p)} aria-current={p === currentPage ? 'page' : undefined}>
          <button className={`ab-pager-btn${p === currentPage ? ' active' : ''}`}>
            {p}
          </button>
        </a>
      ))}

      <a
        href={hasNext ? getHref(currentPage + 1) : undefined}
        aria-disabled={!hasNext}
        aria-label="Página siguiente"
        style={{ pointerEvents: hasNext ? 'auto' : 'none' }}
      >
        <button className="ab-pager-btn" disabled={!hasNext} aria-hidden="true">
          <Ic name="chevRight" size={16} sw={2.2} />
        </button>
      </a>
    </nav>
  )
}
