import type { Metadata } from 'next'
import { Header } from '../../components/layout/Header'
import { Footer } from '../../components/layout/Footer'
import { Ic } from '../../components/ui/Ic'

export const metadata: Metadata = {
  title: '404 — Página no encontrada | josetejero.com',
}

export default function NotFound() {
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <section
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '90px 40px',
        }}
      >
        <div className="code-404">404</div>

        <h1
          style={{
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: '-.03em',
            marginTop: 12,
          }}
        >
          Esta página no existe
        </h1>

        <p
          style={{
            fontSize: 17,
            color: 'var(--ink-3)',
            lineHeight: 1.6,
            marginTop: 14,
            maxWidth: 420,
          }}
        >
          Puede que el enlace haya cambiado o que el contenido ya no esté disponible.
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 30, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/" className="btn btn-grad">
            <Ic name="home" size={16} sw={2} />Volver al inicio
          </a>
          <a href="/blog" className="btn btn-secondary">
            <Ic name="bookOpen" size={16} sw={2} />Ir al blog
          </a>
        </div>

        <div
          style={{
            marginTop: 40,
            display: 'flex',
            gap: 6,
            alignItems: 'center',
            fontSize: 13,
            color: 'var(--muted)',
          }}
        >
          <Ic name="search" size={15} sw={2} />
          {'¿Buscabas algo? Prueba la '}
          <a href="/busqueda" style={{ color: 'var(--blue)', fontWeight: 600 }}>búsqueda</a>
          .
        </div>
      </section>

      <Footer />
    </div>
  )
}
