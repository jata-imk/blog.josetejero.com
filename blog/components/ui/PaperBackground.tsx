// Lienzo de papel del Cuaderno (ADR 0036). Solo presentación: el look lo deciden los data-*
// de <html> y globals.css. suppressHydrationWarning en la pauta porque CUADERNO_BOOTSTRAP_SCRIPT
// le escribe --scroll-y antes de que React hidrate (mismo motivo que en <html> con el tema).
export function PaperBackground() {
  return (
    <div className="paper-canvas" aria-hidden="true">
      <div className="paper-canvas-texture" />
      <div className="paper-canvas-grid" suppressHydrationWarning />
    </div>
  )
}
