// Script anti-FOUC para el sistema de personalización "Cuaderno del Ingeniero"
// Lee las preferencias de libreta en localStorage y las aplica antes del primer render en el <html>.
// También sincroniza --scroll-y (única fuente: CuadernoConfigTrigger ya no registra su propio listener).
export const CUADERNO_BOOTSTRAP_SCRIPT = `(function(){
  var root = document.documentElement;
  try {
    var raw = localStorage.getItem('cuaderno_settings');
    if (!raw) {
      // Cuadrícula (#1 elegida), color azul blueprint, degradado activo, papel arrugado al 40%
      root.setAttribute('data-grid', 'lines');
      root.setAttribute('data-grid-color', 'blue');
      root.setAttribute('data-grid-fade', 'true');
      root.setAttribute('data-paper-texture', 'wrinkled');
      root.style.setProperty('--paper-texture-opacity', '0.40');
    } else {
      var s = JSON.parse(raw);
      if (s.grid) root.setAttribute('data-grid', s.grid);
      if (s.color) root.setAttribute('data-grid-color', s.color);
      if (s.fade !== undefined) root.setAttribute('data-grid-fade', String(s.fade));
      if (s.texture) root.setAttribute('data-paper-texture', s.texture);
      if (s.opacity) root.style.setProperty('--paper-texture-opacity', String(s.opacity));
    }
  } catch (e) { /* localStorage bloqueado o JSON corrupto: se quedan los defaults de CSS */ }
  var ticking = false;
  function sync() {
    ticking = false;
    root.style.setProperty('--scroll-y', (window.scrollY || window.pageYOffset || 0) + 'px');
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(sync); }
  }, { passive: true });
  sync();
})()`
