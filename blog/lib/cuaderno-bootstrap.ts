// Script anti-FOUC para el sistema de personalización "Cuaderno del Ingeniero"
// Lee las preferencias de libreta en localStorage y las aplica antes del primer render en el <html>.
export const CUADERNO_BOOTSTRAP_SCRIPT = `(function(){
  try {
    var raw = localStorage.getItem('cuaderno_settings');
    if (!raw) {
      // Valores predeterminados recomendados:
      // Cuadrícula (#1 elegida), color azul blueprint, degradado activo, papel arrugado al 22%
      document.documentElement.setAttribute('data-grid', 'lines');
      document.documentElement.setAttribute('data-grid-color', 'blue');
      document.documentElement.setAttribute('data-grid-fade', 'true');
      document.documentElement.setAttribute('data-paper-texture', 'wrinkled');
      document.documentElement.style.setProperty('--paper-texture-opacity', '0.22');
      return;
    }
    var s = JSON.parse(raw);
    if (s.grid) document.documentElement.setAttribute('data-grid', s.grid);
    if (s.color) document.documentElement.setAttribute('data-grid-color', s.color);
    if (s.fade !== undefined) document.documentElement.setAttribute('data-grid-fade', String(s.fade));
    if (s.texture) document.documentElement.setAttribute('data-paper-texture', s.texture);
    if (s.opacity) document.documentElement.style.setProperty('--paper-texture-opacity', String(s.opacity));
  } catch(e) {}
})()`
