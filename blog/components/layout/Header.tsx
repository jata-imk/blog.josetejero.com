'use client'

import { usePathname } from 'next/navigation'
import { Ic } from '../ui/Ic'
import { SearchTriggerBtn } from '../search/SearchTriggerBtn'
import { useTheme } from '../../lib/use-theme'

const NAV_LINKS = [
  { label: 'Inicio',      href: '/' },
  { label: 'Blog',        href: '/blog' },
  { label: 'Series',      href: '/series' },
  { label: 'Categorías',  href: '/categorias' },
  { label: 'Sobre mí',    href: '/sobre-mi' },
]

const SOCIAL_LINKS = [
  { name: 'github',   label: 'GitHub',      href: 'https://github.com/jata-imk' },
  { name: 'twitter',  label: 'X / Twitter', href: 'https://x.com/JoseTejero98' },
  { name: 'linkedin', label: 'LinkedIn',    href: 'https://www.linkedin.com/in/jatejeroaguilar' },
]

function matchActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href)
}

export function Header() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  return (
    <header className="site-header">
      <div className="site-header-in">
        <a className="logo" href="/">
          <span className="logo-mark">J</span>
          josetejero<span className="dot">.com</span>
        </a>

        <nav className="site-nav" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={matchActive(pathname, link.href) ? 'active' : ''}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-social">
          <SearchTriggerBtn />
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

        <button
          className="icon-btn theme-toggle"
          aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
          onClick={toggle}
        >
          <Ic name={theme === 'dark' ? 'sun' : 'moon'} size={18} sw={1.8} />
        </button>
      </div>
    </header>
  )
}
