import { createAnalytics } from './analytics.js';
import { SITE_CONFIG } from './config.js';
import { CONSENT_STATUS, createConsentManager } from './consent.js';
import { initializeInteractiveDemo } from './demo.js';
import {
  initializeConsentControls,
  initializeCtas,
  initializeFaq,
  initializeMobileCta,
  initializePricing,
  initializeReveals,
  initializeScrollDepth,
} from './ui.js';

document.documentElement.classList.add('js');

const analytics = createAnalytics({
  windowRef: window,
  documentRef: document,
  config: SITE_CONFIG,
});

const consentManager = createConsentManager({
  storage: window.localStorage,
  version: SITE_CONFIG.consentVersion,
  onAccept: () => analytics.activate(),
  onReject: () => analytics.deactivate(),
});

if (consentManager.getStatus() === CONSENT_STATUS.accepted) {
  analytics.activate();
}

const track = (eventName, parameters) => analytics.track(eventName, parameters);

initializeCtas({ root: document, config: SITE_CONFIG, track });
initializePricing({ root: document, number: SITE_CONFIG.whatsappNumber, track });
initializeFaq({ root: document, track });
initializeInteractiveDemo({
  root: document.querySelector('[data-interactive-demo]'),
  windowRef: window,
  track,
});
initializeConsentControls({ root: document, manager: consentManager });
initializeReveals({ root: document, windowRef: window });
initializeScrollDepth({ windowRef: window, documentRef: document, track });
initializeMobileCta({ root: document, windowRef: window });
