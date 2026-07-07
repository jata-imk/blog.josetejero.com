import type { Metadata } from 'next'
import { alternatesFor } from '../../../lib/seo'

// Metadata de la página (ADR 0029/0030). Página estática, sin
// datos de Payload: describe qué hace el banner de cookies con
// tus datos, así que no tiene sentido indexarla en Google.
export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Qué datos recoge este sitio y cómo controlas el consentimiento de cookies.',
  alternates: alternatesFor('/privacidad'),
  robots: { index: false, follow: true },
}

export default function PrivacidadPage() {
  return (
    <div className="wrap-narrow" style={{ padding: '44px 40px 80px' }}>
      <h1 style={{ fontSize: 32, letterSpacing: '-0.03em' }}>Política de privacidad</h1>

      <div className="ab-prose" style={{ marginTop: 28 }}>
        <p>
          Este sitio es un blog personal. No vende datos ni los comparte con nadie fuera de lo
          descrito aquí. Esta página explica qué mide, con qué herramienta, y cómo puedes cambiar
          de opinión sobre el consentimiento en cualquier momento.
        </p>

        <h2>Qué mide este sitio</h2>
        <p>
          Uso <strong>Google Analytics 4</strong> para saber cuánta gente visita el blog, qué
          páginas leen y desde dónde llegan (buscadores, redes sociales, enlaces directos). No
          recojo nombres, correos ni ningún dato que te identifique directamente.
        </p>

        <h2>Cookies y consentimiento</h2>
        <p>
          Google Analytics usa una cookie (<code>_ga</code>) para distinguir visitas. Esa cookie{' '}
          <strong>solo se instala si aceptas</strong>
          {' '}el banner que aparece en tu primera visita — el sitio arranca en modo &quot;sin
          analytics&quot; (Google lo llama <em>Consent Mode</em>) y solo activa la medición
          completa tras tu aceptación explícita.
        </p>
        <p>
          Si rechazas, no se guarda ninguna cookie de analytics; la elección se recuerda en tu
          navegador (<code>localStorage</code>) para no volver a preguntarte en cada visita. Puedes
          borrar esa elección limpiando los datos del sitio en tu navegador, y el banner volverá a
          aparecer.
        </p>

        <h2>Con quién se comparten los datos</h2>
        <p>
          Los datos de analytics los procesa Google Ireland Limited (Google Analytics), conforme a
          su propia política de privacidad. No integro ninguna otra herramienta de rastreo,
          publicidad o remarketing en este sitio.
        </p>

        <h2>Contacto</h2>
        <p>
          Si tienes preguntas sobre esta política, puedes escribirme a través de mis perfiles
          enlazados en el pie de página.
        </p>
      </div>
    </div>
  )
}
