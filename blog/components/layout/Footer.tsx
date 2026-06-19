import { Ic } from '../ui/Ic'

const EXPLORE_LINKS = [
  { label: 'Blog',        href: '/blog' },
  { label: 'Series',      href: '/series' },
  { label: 'Categorías',  href: '/categorias' },
  { label: 'Tags',        href: '/tags' },
]

const SITE_LINKS = [
  { label: 'Sobre mí',   href: '/sobre-mi' },
  { label: 'RSS',        href: '/rss.xml' },
  { label: 'Sitemap',    href: '/sitemap.xml' },
  { label: 'Contacto',   href: '/contacto' },
]

const SOCIAL_LINKS = [
  { name: 'github',   label: 'GitHub',      href: 'https://github.com/josetejero' },
  { name: 'twitter',  label: 'X / Twitter', href: 'https://x.com/josetejero' },
  { name: 'linkedin', label: 'LinkedIn',    href: 'https://linkedin.com/in/josetejero' },
]

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-in">
        <div className="footer-cols">
          <div>
            <a className="logo" href="/" style={{ marginBottom: 12, display: 'inline-flex' }}>
              <span className="logo-mark">J</span>
              josetejero<span className="dot">.com</span>
            </a>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.6, maxWidth: 280, margin: 0 }}>
              Notas sobre desarrollo web, automatización e IA — construyendo software, en voz alta.
            </p>
          </div>

          <div>
            <h5 className="footer-h5">Explorar</h5>
            <nav className="footer-links">
              {EXPLORE_LINKS.map((l) => (
                <a key={l.href} href={l.href}>{l.label}</a>
              ))}
            </nav>
          </div>

          <div>
            <h5 className="footer-h5">Sitio</h5>
            <nav className="footer-links">
              {SITE_LINKS.map((l) => (
                <a key={l.href} href={l.href}>{l.label}</a>
              ))}
            </nav>
          </div>
        </div>

        <p className="footer-copy">
          © 2026 José Alejandro Tejero Aguilar · Hecho con Next.js + PostgreSQL
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.name}
              href={s.href}
              className="icon-btn"
              aria-label={s.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Ic name={s.name} size={18} sw={1.8} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
