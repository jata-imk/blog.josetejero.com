// Script anti-FOUC para el sistema de personalización "Cuaderno del Ingeniero" (ADR 0036).
// Corre en <head> antes del primer paint: lee las preferencias de localStorage y las
// aplica como data-* en <html>. También sincroniza --scroll-y en el lienzo (.paper-canvas);
// lo heredan la pauta y la linterna (ADR 0039) para desplazarse con el documento.
export const CUADERNO_BOOTSTRAP_SCRIPT = `(function(){
  var root = document.documentElement;
  try {
    var raw = localStorage.getItem('cuaderno_settings');
    if (!raw) {
      // Cuadrícula (#1 elegida), color azul blueprint, degradado activo, papel arrugado sutil (24%)
      root.setAttribute('data-grid', 'lines');
      root.setAttribute('data-grid-color', 'blue');
      root.setAttribute('data-grid-fade', 'true');
      root.setAttribute('data-paper-texture', 'wrinkled');
      root.style.setProperty('--paper-texture-opacity', '0.24');
    } else {
      var s = JSON.parse(raw);
      if (s.grid) root.setAttribute('data-grid', s.grid);
      if (s.color) root.setAttribute('data-grid-color', s.color);
      if (s.fade !== undefined) root.setAttribute('data-grid-fade', String(s.fade));
      if (s.texture) root.setAttribute('data-paper-texture', s.texture);
      if (s.opacity) root.style.setProperty('--paper-texture-opacity', String(s.opacity));
    }
  } catch (e) { /* localStorage bloqueado o JSON corrupto: se quedan los defaults de CSS */ }

  // El script corre en <head>: la capa aún no existe, se busca de forma perezosa.
  var canvas = null;
  var ticking = false;
  function sync() {
    ticking = false;
    canvas = canvas || document.querySelector('.paper-canvas');
    if (canvas) canvas.style.setProperty('--scroll-y', (window.scrollY || 0) + 'px');
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(sync); }
  }, { passive: true });
  document.addEventListener('DOMContentLoaded', sync);
})()`
