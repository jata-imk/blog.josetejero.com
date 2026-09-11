import { ImageResponse } from 'next/og'
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/seo'
import { OG_BG, OG_GRAD, OG_INK, OG_INK_3, OG_LINE, OG_ON_ACCENT, OG_SIZE } from '@/lib/og-theme'

/* ============================================================
   Imagen Open Graph por defecto (ADR 0029)

   Convención de Next: un archivo `opengraph-image.tsx` en un
   segmento de rutas genera la og:image de ese segmento y de todos
   sus descendientes que no definan una propia. Next lo sirve como
   PNG en /opengraph-image y añade solo el <meta property="og:image">.

   Es la imagen que aparece al compartir la home o cualquier página
   sin portada (listados, sobre-mí). Las entradas con `coverImage`
   la sobreescriben en su propio generateMetadata.

   NOTA sobre colores: ImageResponse renderiza en un runtime aislado
   (Satori) que NO puede leer las CSS custom properties de
   globals.css, así que los valores están copiados a mano del token
   layer. Excepción documentada a la regla "cero hardcodes" — si los
   tokens cambian, esta paleta hay que actualizarla a mano.
   Origen de cada valor: app/globals.css (:root).
   ============================================================ */

// Texto alternativo del og:image (accesibilidad de la tarjeta)
export const alt = SITE_NAME

// 1200×630 es el tamaño canónico de Open Graph (ratio 1.91:1):
// lo que Facebook definió y todos los demás adoptaron.
export const size = OG_SIZE
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: OG_BG,
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        {/* Barra superior con el gradiente de marca (momento clave) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 14,
            backgroundImage: OG_GRAD,
          }}
        />

        {/* Logo mark: la "J" sobre gradiente, como en el header del sitio */}
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 24,
            backgroundImage: OG_GRAD,
            color: OG_ON_ACCENT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 52,
            fontWeight: 800,
          }}
        >
          J
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 800, color: OG_INK, letterSpacing: '-0.03em' }}>
            {SITE_NAME}
          </div>
          <div style={{ fontSize: 32, color: OG_INK_3, lineHeight: 1.4, maxWidth: 900 }}>
            {SITE_DESCRIPTION}
          </div>
        </div>

        {/* Pie con separador sutil, como las cards del sitio */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            borderTop: `2px solid ${OG_LINE}`,
            paddingTop: 28,
            fontSize: 26,
            color: OG_INK_3,
          }}
        >
          Blog · Desarrollo web · Automatización · IA
        </div>
      </div>
    ),
    size,
  )
}
