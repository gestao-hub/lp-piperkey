import { describe, expect, test } from 'vitest';
import {
  PERIODS,
  PLANS,
  buildPlanWhatsAppUrl,
  buildWhatsAppUrl,
  createSiteConfig,
  formatPrice,
  getPlanPrice,
} from '../../src/config.js';

describe('pricing configuration', () => {
  test('keeps the approved Silver and Gold prices for every period', () => {
    expect(PLANS.silver.prices).toEqual({ anual: 397, trimestral: 422, mensal: 447 });
    expect(PLANS.gold.prices).toEqual({ anual: 497, trimestral: 522, mensal: 547 });
  });

  test('returns a plan price and rejects unknown plan/period combinations', () => {
    expect(getPlanPrice('gold', 'trimestral')).toBe(522);
    expect(() => getPlanPrice('bronze', 'mensal')).toThrow('Plano desconhecido');
    expect(() => getPlanPrice('silver', 'semanal')).toThrow('Período desconhecido');
  });

  test('formats prices in Brazilian Real without decimal cents', () => {
    expect(formatPrice(397)).toBe('R$ 397');
  });

  test('declares annual as the default pricing period', () => {
    expect(PERIODS.anual.default).toBe(true);
    expect(PERIODS.anual.note).toBe('cobrado anualmente');
  });
});

describe('public site configuration', () => {
  test('normalizes public environment values', () => {
    const config = createSiteConfig({
      VITE_WHATSAPP_NUMBER: '+55 (48) 99999-8888',
      VITE_DEMO_URL: 'https://cal.com/piperkey/demo',
      VITE_SITE_URL: 'https://solo.piperkey.com.br/',
      VITE_GA4_ID: 'G-ABC123',
      VITE_META_PIXEL_ID: '998877',
    });

    expect(config).toMatchObject({
      whatsappNumber: '5548999998888',
      demoUrl: 'https://cal.com/piperkey/demo',
      siteUrl: 'https://solo.piperkey.com.br',
      ga4Id: 'G-ABC123',
      metaPixelId: '998877',
      consentVersion: '1',
    });
  });

  test('creates an encoded WhatsApp URL', () => {
    expect(
      buildWhatsAppUrl({
        number: '+55 (48) 99999-8888',
        message: 'Quero conhecer o PiperKey Solo',
      }),
    ).toBe('https://wa.me/5548999998888?text=Quero%20conhecer%20o%20PiperKey%20Solo');
  });

  test('creates a contextual plan URL with plan and period', () => {
    const url = buildPlanWhatsAppUrl({
      planId: 'gold',
      period: 'mensal',
      number: '5548999998888',
    });

    expect(decodeURIComponent(url)).toContain('plano Gold');
    expect(decodeURIComponent(url)).toContain('mensal');
    expect(decodeURIComponent(url)).toContain('R$ 547/mês');
  });
});
