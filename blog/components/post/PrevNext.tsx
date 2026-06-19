import { Ic } from '../ui/Ic'

export function PrevNext({
  prev,
  next,
}: {
  prev?: { title: string; href: string }
  next?: { title: string; href: string }
}) {
  return (
    <nav className="ab-prevnext" aria-label="Artículos anterior y siguiente">
      {prev ? (
        <a className="ab-pn" href={prev.href}>
          <div className="dir">
            <Ic name="arrowLeft" size={14} sw={2} />
            Anterior
          </div>
          <div className="pn-title">{prev.title}</div>
        </a>
      ) : (
        <div />
      )}
      {next && (
        <a className="ab-pn next" href={next.href}>
          <div className="dir">
            Siguiente
            <Ic name="arrowRight" size={14} sw={2} />
          </div>
          <div className="pn-title">{next.title}</div>
        </a>
      )}
    </nav>
  )
}
