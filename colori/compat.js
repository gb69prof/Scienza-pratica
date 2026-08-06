(() => {
  'use strict';

  const params = new URLSearchParams(location.search);
  const fallback = document.getElementById('fallback');
  const canvas = document.getElementById('gl');

  function showRendererError(error) {
    const message = error instanceof Error ? error.message : String(error);
    window.__coloriRendererError = message;
    window.__coloriWebGLProbe = { available: false, error: message };

    if (canvas) canvas.hidden = true;
    if (fallback) {
      fallback.hidden = false;
      const title = fallback.querySelector('strong');
      const detail = fallback.querySelector('span');
      if (title) title.textContent = 'Il renderer 3D non si è inizializzato.';
      if (detail) detail.textContent = `Dettaglio tecnico: ${message}`;
    }
    console.error('Colori — errore renderer:', error);
  }

  window.ColoriDiagnostics = { showRendererError };

  async function resetPwa() {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations
        .filter(registration => registration.scope.includes('/colori/'))
        .map(registration => registration.unregister()));
    }
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names
        .filter(name => name.startsWith('colori-'))
        .map(name => caches.delete(name)));
    }

    params.delete('reset-pwa');
    params.set('no-sw', '1');
    const query = params.toString();
    location.replace(`${location.pathname}${query ? `?${query}` : ''}${location.hash}`);
  }

  if (params.has('reset-pwa')) {
    resetPwa().catch(showRendererError);
    return;
  }

  import('./app.js?v=6').catch(showRendererError);
})();
