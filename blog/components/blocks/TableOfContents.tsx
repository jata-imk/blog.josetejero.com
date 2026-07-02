'use client'

import { useEffect, useState } from 'react'

export type TocItem = {
  id: string
  label: string
  level: 2 | 3
}

export function MobileToc({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null
  return (
    <div className="post-toc-mobile">
      <details>
        <summary>En esta página</summary>
        <div className="ab-toc">
          {items.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={item.level === 3 ? 'sub' : ''}>
              {item.label}
            </a>
          ))}
        </div>
      </details>
    </div>
  )
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
    <nav className="ab-toc ab-toc-rail" aria-label="Tabla de contenidos">
      {/* Capa colapsada: solo marcas, decorativa */}
      <ul className="ab-toc-marks" aria-hidden="true">
        {items.map((item) => (
          <li key={item.id}>
            <span
              className={[
                'ab-toc-mark',
                item.level === 3 ? 'sub' : '',
                activeId === item.id ? 'active' : '',
              ].filter(Boolean).join(' ')}
            />
          </li>
        ))}
      </ul>

      {/* Capa expandida: panel flotante con los links reales */}
      <div className="ab-toc-panel">
        <div className="ab-toc-title">En esta página</div>
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={activeId === item.id ? 'location' : undefined}
            className={[
              item.level === 3 ? 'sub' : '',
              activeId === item.id ? 'active' : '',
            ].filter(Boolean).join(' ')}
          >
            <span className="ab-toc-label">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  )
}
