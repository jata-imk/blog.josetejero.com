import '../globals.css'
import { inter, jetbrainsMono } from '../fonts'

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg text-ink font-sans">{children}</body>
    </html>
  )
}
