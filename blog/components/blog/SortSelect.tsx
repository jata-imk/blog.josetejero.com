'use client'

import { useRouter } from 'next/navigation'

export function SortSelect({
  sort,
  cat,
  tag,
}: {
  sort: '-publishedAt' | 'publishedAt'
  cat?: string
  tag?: string
}) {
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams()
    if (cat) next.set('cat', cat)
    if (tag) next.set('tag', tag)
    if (e.target.value !== '-publishedAt') next.set('sort', e.target.value)
    const qs = next.toString()
    router.push(qs ? `/blog?${qs}` : '/blog')
  }

  return (
    <select
      value={sort}
      onChange={handleChange}
      className="blog-sort"
      aria-label="Ordenar artículos"
    >
      <option value="-publishedAt">Más recientes</option>
      <option value="publishedAt">Más antiguos</option>
    </select>
  )
}
