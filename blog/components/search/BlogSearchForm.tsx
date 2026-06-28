import { Ic } from '../ui/Ic'

export function BlogSearchForm() {
  return (
    <form action="/buscar" method="GET">
      <div className="ab-search" style={{ maxWidth: 480 }}>
        <Ic name="search" size={18} className="lead" />
        <input
          type="search"
          name="q"
          placeholder="Buscar posts, series, tags o categorías..."
          aria-label="Buscar"
          autoComplete="off"
        />
      </div>
    </form>
  )
}
