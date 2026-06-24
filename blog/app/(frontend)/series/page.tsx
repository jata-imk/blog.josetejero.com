import { Header } from '../../../components/layout/Header'
import { Footer } from '../../../components/layout/Footer'
import { Badge } from '../../../components/ui/Badge'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Breadcrumb } from '../../../components/ui/Breadcrumb'
import { Ic } from '../../../components/ui/Ic'
import { getSeriesList } from '../../../lib/data'

const breadcrumbItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Series' },
]

export default async function SeriesIndexPage() {
  const series = await getSeriesList()

  return (
    <>
      <Header activePath="/series" />

      <div className="wrap" style={{ paddingTop: 52, paddingBottom: 80 }}>
        <Breadcrumb items={breadcrumbItems} />

        <div style={{ marginTop: 32, marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Aprende paso a paso</div>
          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.1 }}>
            Series
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, marginTop: 14, maxWidth: 540, color: 'var(--ink-3)' }}>
            Guías estructuradas en múltiples partes, de principio a fin.
          </p>
        </div>

        {series.length === 0 ? (
          <EmptyState
            title="Sin series todavía"
            description="Todavía no hay series publicadas. Vuelve pronto."
          />
        ) : (
          <div className="grid-series">
            {series.map((s) => (
              <a
                key={s.id}
                href={`/series/${s.slug}`}
                className="card card-hover"
                style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12, textDecoration: 'none', color: 'inherit' }}
              >
                <Badge variant="series" />
                <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.3 }}>
                  {s.title}
                </h2>
                {s.description && (
                  <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-3)', flexGrow: 1 }}>
                    {s.description}
                  </p>
                )}
                <span style={{ marginTop: 'auto', paddingTop: 4, fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)' }}>
                  Ver serie<Ic name="arrowRight" size={15} sw={2.2} />
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}
