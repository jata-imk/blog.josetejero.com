import '../globals.css'
import type { Metadata } from 'next'
import { inter, jetbrainsMono } from '../fonts'
import { Header } from '../../components/layout/Header'
import { Footer } from '../../components/layout/Footer'
import { GlobalSearchProvider } from '../../components/search/GlobalSearchProvider'
import { THEME_BOOTSTRAP_SCRIPT } from '../../lib/theme-bootstrap'
import { JsonLd } from '../../components/seo/JsonLd'
import {
  SITE_URL,
  SITE_NAME,
  SITE_AUTHOR,
  SITE_TITLE,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  websiteJsonLd,
} from '../../lib/seo'

export const revalidate = 3600

/* ============================================================
   Metadata base del sitio (ADR 0029)

   La Metadata API de Next se hereda hacia abajo: lo que se declara
   aquí es el DEFAULT de todas las páginas públicas, y cada página
   lo sobreescribe parcialmente con su propio `metadata` /
   `generateMetadata` (solo los campos que redefine; el resto se
   fusiona desde este layout).
   ============================================================ */
export const metadata: Metadata = {
  // Base contra la que Next resuelve TODA URL relativa de metadata
  // (canonical: '/blog' → https://josetejero.com/blog, og:image, etc.).
  // Sin esto, las URLs relativas de abajo ni siquiera funcionarían.
  metadataBase: new URL(SITE_URL),

  title: {
    // Título cuando la página no define el suyo (home)
    default: SITE_TITLE,
    // Plantilla para las que sí: "%s" se sustituye por el título de
    // la página → "Mi post · José Tejero". Da marca consistente en
    // pestañas del navegador y resultados de búsqueda.
    template: `%s · ${SITE_AUTHOR}`,
  },

  // <meta name="description"> — el texto que Google suele mostrar
  // bajo el enlace en los resultados. Cada página lo sobreescribe
  // con uno propio; este es el fallback del sitio.
  description: SITE_DESCRIPTION,

  // Open Graph: el protocolo que WhatsApp, LinkedIn, Facebook,
  // Telegram, Slack y Discord leen para pintar la "tarjeta" al
  // compartir un enlace (título + descripción + imagen).
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: SITE_LOCALE,
    url: '/', // relativa → resuelta con metadataBase
    // Sin `images` aquí: Next detecta app/(frontend)/opengraph-image.tsx
    // (imagen generada por código) y la añade automáticamente como
    // og:image por defecto de todo el árbol de rutas.
  },

  // Twitter/X usa sus propios meta tags (twitter:*) además de OG.
  // "summary_large_image" = tarjeta grande con la imagen destacada.
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },

  alternates: {
    // Autodiscovery del RSS: <link rel="alternate" type="application/rss+xml">.
    // Los lectores de feeds detectan el feed con solo pegar la URL del blog.
    types: {
      'application/rss+xml': [{ url: '/rss.xml', title: `${SITE_NAME} — RSS` }],
    },
  },

  // Default explícito: indexar y seguir enlaces. Las páginas que NO
  // deben indexarse (p. ej. /buscar) lo sobreescriben.
  robots: {
    index: true,
    follow: true,
  },
}

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" data-theme="light" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body className="bg-bg text-ink font-sans">
        {/* JSON-LD WebSite: se emite UNA vez para todo el sitio; le da a
            Google el nombre canónico del sitio y la entidad del autor */}
        <JsonLd data={websiteJsonLd()} />
        <GlobalSearchProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
          </div>
        </GlobalSearchProvider>
      </body>
    </html>
  )
}
