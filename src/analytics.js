function appendScript(documentRef, { provider, src }) {
  const selector = `script[data-piperkey-analytics="${provider}"]`;
  if (documentRef.querySelector(selector)) return;

  const script = documentRef.createElement('script');
  script.async = true;
  script.src = src;
  script.dataset.piperkeyAnalytics = provider;
  documentRef.head.append(script);
}

function setupGoogleAnalytics(windowRef, documentRef, ga4Id) {
  if (!ga4Id) return;

  appendScript(documentRef, {
    provider: 'ga4',
    src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`,
  });

  windowRef.dataLayer ??= [];
  windowRef.gtag ??= (...args) => windowRef.dataLayer.push(args);
  windowRef.gtag('js', new Date());
  windowRef.gtag('config', ga4Id, { anonymize_ip: true });
}

function setupMetaPixel(windowRef, documentRef, metaPixelId) {
  if (!metaPixelId) return;

  appendScript(documentRef, {
    provider: 'meta',
    src: 'https://connect.facebook.net/en_US/fbevents.js',
  });

  if (!windowRef.fbq) {
    const fbq = (...args) => {
      if (fbq.callMethod) return fbq.callMethod(...args);
      return fbq.queue.push(args);
    };
    fbq.push = fbq;
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    windowRef.fbq = fbq;
    windowRef._fbq = fbq;
  }

  windowRef.fbq('init', metaPixelId);
  windowRef.fbq('track', 'PageView');
}

export function createAnalytics({ windowRef, documentRef, config }) {
  let active = false;

  function activate() {
    if (active) return true;
    if (!config.ga4Id && !config.metaPixelId) return false;

    setupGoogleAnalytics(windowRef, documentRef, config.ga4Id);
    setupMetaPixel(windowRef, documentRef, config.metaPixelId);
    active = true;
    return true;
  }

  function deactivate() {
    active = false;
    if (windowRef.gtag) {
      windowRef.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    }
  }

  function track(eventName, parameters = {}) {
    if (!active) return false;
    windowRef.gtag?.('event', eventName, parameters);
    windowRef.fbq?.('trackCustom', eventName, parameters);
    return true;
  }

  return Object.freeze({
    activate,
    deactivate,
    isActive: () => active,
    track,
  });
}
