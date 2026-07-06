import { Tag } from '../../../components/ui/Tag'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Breadcrumb } from '../../../components/ui/Breadcrumb'
import { Ic } from '../../../components/ui/Ic'
import type { Metadata } from 'next'
import { getTags } from '../../../lib/data'
import { alternatesFor } from '../../../lib/seo'

// Metadata del listado (ADR 0029): título propio (el layout le añade
// "· José Tejero"), descripción para resultados de búsqueda y canonical.
export const metadata: Metadata = {
  title: 'Tags',
  description: 'Explora los artículos del blog por etiqueta.',
  alternates: alternatesFor('/tags'),
}

const breadcrumbItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Tags' },
]

export default async function TagsPage() {
  const tags = await getTags()

  return (
    <>
      <div className="wrap" style={{ paddingTop: 52, paddingBottom: 80 }}>
        <Breadcrumb items={breadcrumbItems} />

        <div style={{ marginTop: 32, marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Explorar</div>
          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.1 }}>
            Tags
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, marginTop: 14, maxWidth: 540, color: 'var(--ink-3)' }}>
            Navega por las etiquetas del blog.
          </p>
        </div>

        {tags.length === 0 ? (
          <EmptyState
            title="Sin tags todavía"
            description="Todavía no hay etiquetas publicadas."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 560 }}>
            {tags.map((tag) => (
              <a
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="card card-hover"
                style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: 'inherit' }}
              >
                <Tag>{tag.name}</Tag>
                <span style={{ color: 'var(--muted)', flexShrink: 0, display: 'flex' }}>
                  <Ic name="arrowRight" size={16} sw={2} />
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

    </>
  )
}
