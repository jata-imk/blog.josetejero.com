import { Ic } from '../ui/Ic'
import { ChalkUnderline, DoodleArrow, DoodleSparkle } from '../ui/Doodles'

// Footer "contraportada del cuaderno" (Fase 5, ADR 0040): bloque de tinta con cierre personal,
// firma manuscrita, enlaces con resaltador y la marca en tipografía monumental de contorno.

const CONTACT_EMAIL = 'mailto:jata.imk@hotmail.com'

const EXPLORE_LINKS = [
  { label: 'Blog',        href: '/blog' },
  { label: 'Series',      href: '/series' },
  { label: 'Categorías',  href: '/categorias' },
  { label: 'Tags',        href: '/tags' },
]

const SITE_LINKS = [
  { label: 'Sobre mí',   href: '/sobre-mi' },
  { label: 'Contacto',   href: CONTACT_EMAIL },
  { label: 'RSS',        href: '/rss.xml' },
  { label: 'Sitemap',    href: '/sitemap.xml' },
  { label: 'Privacidad', href: '/privacidad' },
]

const SOCIAL_LINKS = [
  { name: 'github',   label: 'GitHub',      href: 'https://github.com/jata-imk' },
  { name: 'twitter',  label: 'X / Twitter', href: 'https://x.com/JoseTejero98' },
  { name: 'linkedin', label: 'LinkedIn',    href: 'https://www.linkedin.com/in/jatejeroaguilar' },
]

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-in">
        <div className="footer-cta">
          <p className="footer-kicker font-sketch">
            <DoodleSparkle tone="yellow" size={22} /> ¿construimos algo juntos?
          </p>
          <a className="footer-cta-link" href={CONTACT_EMAIL}>
            Escríbeme
            <DoodleArrow tone="yellow" size={48} rotate={8} />
          </a>
        </div>

        <div className="footer-cols">
          <div className="footer-brand">
            <a className="logo" href="/" aria-label="josetejero.com — Inicio">
              <span className="logo-mark">J</span>
              <span>
                josetejero<span className="dot">.com</span>
              </span>
            </a>
            <p className="footer-desc">
              Notas sobre desarrollo web, automatización e IA — construyendo software, en voz alta.
            </p>
            <p className="footer-signature font-sketch">
              <ChalkUnderline tone="yellow" variant="double">José Tejero</ChalkUnderline>
            </p>
          </div>

          <div>
            <h2 className="footer-h font-sketch">explorar</h2>
            <nav className="footer-links" aria-label="Explorar">
              {EXPLORE_LINKS.map((l) => (
                <a key={l.href} href={l.href}>{l.label}</a>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="footer-h font-sketch">el sitio</h2>
            <nav className="footer-links" aria-label="Sitio">
              {SITE_LINKS.map((l) => (
                <a key={l.label} href={l.href}>{l.label}</a>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="footer-h font-sketch">en otras libretas</h2>
            <div className="footer-social">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  className="footer-social-btn"
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Ic name={s.name} size={18} sw={1.8} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="footer-copy">
          © 2026 José Alejandro Tejero Aguilar · Hecho con{' '}
          <span role="img" aria-label="amor">❤️</span> y Next.js + PostgreSQL
        </p>
      </div>

      {/* Marca monumental: SVG con textLength para ocupar exactamente el ancho disponible. */}
      <svg className="footer-monument" viewBox="0 0 1000 150" aria-hidden="true" focusable="false">
        <text x="0" y="140" textLength="1000" lengthAdjust="spacingAndGlyphs">
          JOSÉ TEJERO
        </text>
      </svg>
    </footer>
  )
}
