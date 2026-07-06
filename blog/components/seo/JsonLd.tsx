/**
 * Inyecta un objeto JSON-LD (schema.org) en la página como
 * <script type="application/ld+json">. Es la vía que Google
 * recomienda para datos estructurados: un bloque JSON invisible
 * para el usuario que describe la página en vocabulario máquina.
 *
 * Server Component puro: se serializa en el HTML del servidor,
 * así los crawlers lo ven sin ejecutar JavaScript.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        // Escapamos "<" para que un título con "<script>" no pueda
        // cerrar el bloque e inyectar HTML (XSS). "<" es el
        // mismo carácter, pero inofensivo dentro de un string JSON.
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
