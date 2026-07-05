import { Cat } from '../../../components/ui/Cat'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Breadcrumb } from '../../../components/ui/Breadcrumb'
import { Ic } from '../../../components/ui/Ic'
import { getCategories } from '../../../lib/data'

const breadcrumbItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Categorías' },
]

export default async function CategoriasPage() {
  const categories = await getCategories()

  return (
    <>
      <div className="wrap" style={{ paddingTop: 52, paddingBottom: 80 }}>
        <Breadcrumb items={breadcrumbItems} />

        <div style={{ marginTop: 32, marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Explorar</div>
          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.1 }}>
            Categorías
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, marginTop: 14, maxWidth: 540, color: 'var(--ink-3)' }}>
            Navega por los temas del blog.
          </p>
        </div>

        {categories.length === 0 ? (
          <EmptyState
            title="Sin categorías todavía"
            description="Todavía no hay categorías publicadas."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 560 }}>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/categorias/${cat.slug}`}
                className="card card-hover"
                style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: 'inherit' }}
              >
                <Cat name={cat.name} slug={cat.slug} lg />
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
