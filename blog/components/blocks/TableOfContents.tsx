'use client'

import { useEffect, useState } from 'react'

export type TocItem = {
  id: string
  label: string
  level: 2 | 3
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 }
    )

    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  return (
    <nav className="ab-toc" aria-label="Tabla de contenidos">
      <div className="ab-toc-title">En esta página</div>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={[
            item.level === 3 ? 'sub' : '',
            activeId === item.id ? 'active' : '',
          ].filter(Boolean).join(' ')}
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}
