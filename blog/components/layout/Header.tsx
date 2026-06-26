'use client'

import { Ic } from '../ui/Ic'
import { CommandPalette } from '../search/CommandPalette'
import { SearchTriggerBtn } from '../search/SearchTriggerBtn'

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

export function Header({ activePath = '/' }: { activePath?: string }) {
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
              className={activePath === link.href ? 'active' : ''}
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
      </div>
      <CommandPalette />
    </header>
  )
}
