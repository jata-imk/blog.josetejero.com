import type { Metadata } from 'next'
import { Header } from '../../components/layout/Header'
import { Footer } from '../../components/layout/Footer'

export const metadata: Metadata = {
  title: '404 — Página no encontrada | josetejero.com',
}

export default function NotFound() {
  return (
    <>
      <Header />

      <div
        className="wrap"
        style={{
          paddingTop: 80,
          paddingBottom: 120,
          minHeight: 'calc(100vh - var(--header-h) - 220px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 0,
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            background: 'var(--grad)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 20,
          }}
        >
          Error 404
        </p>

        <h1
          style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 800,
            letterSpacing: '-.04em',
            lineHeight: 1.05,
            color: 'var(--ink)',
            marginBottom: 20,
          }}
        >
          Página no encontrada
        </h1>

        <p
          style={{
            fontSize: 17,
            lineHeight: 1.65,
            color: 'var(--ink-3)',
            maxWidth: 440,
            marginBottom: 40,
          }}
        >
          La URL que estás buscando no existe o ha cambiado de dirección.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/" className="btn btn-grad">
            Ir al inicio
          </a>
          <a href="/blog" className="btn btn-secondary">
            Ver el blog
          </a>
        </div>

        <div
          style={{
            marginTop: 64,
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {[
            { label: 'Blog', href: '/blog' },
            { label: 'Series', href: '/series' },
            { label: 'Categorías', href: '/categorias' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--ink-3)',
                textDecoration: 'underline',
                textDecorationColor: 'var(--line-3)',
                textUnderlineOffset: 3,
                transition: 'color .15s',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <Footer />
    </>
  )
}
