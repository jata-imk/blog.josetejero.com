import '../globals.css'
import { inter, jetbrainsMono } from '../fonts'
import { Header } from '../../components/layout/Header'
import { Footer } from '../../components/layout/Footer'
import { GlobalSearchProvider } from '../../components/search/GlobalSearchProvider'

export const revalidate = 3600

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg text-ink font-sans">
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
