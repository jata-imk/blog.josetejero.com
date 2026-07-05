// Script anti-FOUC: aplica el tema persistido en localStorage antes del primer render.
// Usado tanto en app/(frontend)/layout.tsx como en app/global-not-found.tsx (ADR 0028),
// que renderizan documentos <html> independientes y por eso necesitan cada uno su propia copia.
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}})()`
