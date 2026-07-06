import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'

/* ============================================================
   robots.txt (ADR 0029)

   Convención de Next: `app/robots.ts` genera /robots.txt — el
   PRIMER archivo que todo crawler pide antes de rastrear un sitio.
   Define qué rutas puede visitar y dónde está el sitemap.

   Ojo: robots.txt NO es seguridad (es una petición de cortesía que
   los bots buenos respetan); /admin sigue protegido por el login de
   Payload. Excluirlo aquí solo evita que los buscadores pierdan
   tiempo (crawl budget) en rutas sin valor de búsqueda.
   ============================================================ */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      // Aplica a todos los crawlers (Googlebot, Bingbot, etc.)
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin', //  panel de Payload — sin valor de búsqueda
        '/api/', //   endpoints JSON — no son páginas
        '/buscar', // resultados de búsqueda — contenido infinito/duplicado
      ],
    },
    // Dónde está el índice completo del sitio (ver app/sitemap.ts)
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
