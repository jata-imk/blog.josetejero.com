// Lienzo de papel del Cuaderno (ADR 0036). Solo presentación: el look lo deciden los data-*
// de <html> y globals.css. suppressHydrationWarning en el lienzo porque CUADERNO_BOOTSTRAP_SCRIPT
// le escribe --scroll-y (y HeroLamp --lamp-*) antes de que React hidrate.
export function PaperBackground() {
  return (
    <div className="paper-canvas" aria-hidden="true" suppressHydrationWarning>
      <div className="paper-canvas-texture" />
      <div className="paper-canvas-grid" />
      {/* linterna del hero (ADR 0039): la misma pauta con más tinta, visible solo bajo el cursor */}
      <div className="paper-canvas-lamp" />
    </div>
  )
}
