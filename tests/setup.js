import { afterEach } from 'vitest';

afterEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  localStorage.clear();
  delete window.dataLayer;
  delete window.fbq;
  delete window._fbq;
});
