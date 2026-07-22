import { describe, expect, test, vi } from 'vitest';
import { createAnalytics } from '../../src/analytics.js';

function setupAnalytics() {
  return createAnalytics({
    windowRef: window,
    documentRef: document,
    config: {
      ga4Id: 'G-TEST123',
      metaPixelId: '99887766',
    },
  });
}

describe('consent-gated analytics', () => {
  test('does not create trackers or queue events before activation', () => {
    const analytics = setupAnalytics();

    expect(analytics.track('cta_whatsapp', { placement: 'hero' })).toBe(false);
    expect(window.dataLayer).toBeUndefined();
    expect(window.fbq).toBeUndefined();
    expect(document.querySelectorAll('script[data-piperkey-analytics]')).toHaveLength(0);
  });

  test('loads GA4 and Meta Pixel only when activated', () => {
    const analytics = setupAnalytics();

    expect(analytics.activate()).toBe(true);
    expect(analytics.isActive()).toBe(true);
    expect(document.querySelector('script[src*="googletagmanager.com/gtag/js?id=G-TEST123"]')).not.toBeNull();
    expect(document.querySelector('script[src*="connect.facebook.net/en_US/fbevents.js"]')).not.toBeNull();
    expect(window.dataLayer.length).toBeGreaterThan(0);
    expect(typeof window.fbq).toBe('function');
  });

  test('uses the queue contract expected by the official Meta Pixel library', () => {
    const analytics = setupAnalytics();
    analytics.activate();

    expect(window._fbq).toBe(window.fbq);
    expect(window.fbq.push).toBe(window.fbq);

    const callMethod = vi.fn();
    window.fbq.callMethod = callMethod;
    window.fbq('trackCustom', 'cta_demo', { position: 'hero' });

    expect(callMethod).toHaveBeenCalledWith('trackCustom', 'cta_demo', { position: 'hero' });
  });

  test('tracks named events in both providers after activation', () => {
    const analytics = setupAnalytics();
    analytics.activate();

    expect(analytics.track('pricing_period_change', { period: 'mensal' })).toBe(true);

    expect(window.dataLayer.at(-1)).toEqual([
      'event',
      'pricing_period_change',
      { period: 'mensal' },
    ]);
    expect(window.fbq.queue.at(-1)).toEqual([
      'trackCustom',
      'pricing_period_change',
      { period: 'mensal' },
    ]);
  });

  test('does not inject duplicate scripts when activated twice', () => {
    const analytics = setupAnalytics();
    analytics.activate();
    const googleCalls = window.dataLayer.length;
    const metaCalls = window.fbq.queue.length;
    analytics.activate();

    expect(document.querySelectorAll('script[data-piperkey-analytics="ga4"]')).toHaveLength(1);
    expect(document.querySelectorAll('script[data-piperkey-analytics="meta"]')).toHaveLength(1);
    expect(window.dataLayer).toHaveLength(googleCalls);
    expect(window.fbq.queue).toHaveLength(metaCalls);
  });

  test('stops future tracking after deactivation', () => {
    const analytics = setupAnalytics();
    analytics.activate();
    analytics.deactivate();

    expect(analytics.track('faq_open', { faqId: 'banimento' })).toBe(false);
    expect(analytics.isActive()).toBe(false);
  });
});
