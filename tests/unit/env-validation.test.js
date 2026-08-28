import { describe, expect, test } from 'vitest';
import { REQUIRED_PUBLIC_ENV, validateEnvironment } from '../../scripts/env-validation.mjs';

const validEnv = {
  VITE_WHATSAPP_NUMBER: '5548999998888',
  VITE_DEMO_URL: 'https://cal.com/piperkey/demo',
  VITE_SITE_URL: 'https://solo.piperkey.com.br',
  VITE_GA4_ID: 'G-ABC123456',
  VITE_META_PIXEL_ID: '1234567890',
};

describe('production environment validation', () => {
  test('lists every required public environment key', () => {
    expect(REQUIRED_PUBLIC_ENV).toEqual(Object.keys(validEnv));
  });

  test('accepts a complete and valid configuration', () => {
    expect(validateEnvironment(validEnv)).toEqual([]);
  });

  test('reports missing values with their variable names', () => {
    const errors = validateEnvironment({});
    expect(errors).toHaveLength(5);
    expect(errors[0]).toContain('VITE_WHATSAPP_NUMBER');
  });

  test('can validate a preview subset without requiring analytics providers', () => {
    const previewEnv = {
      VITE_WHATSAPP_NUMBER: validEnv.VITE_WHATSAPP_NUMBER,
      VITE_DEMO_URL: validEnv.VITE_DEMO_URL,
      VITE_SITE_URL: validEnv.VITE_SITE_URL,
    };

    expect(validateEnvironment(previewEnv, {
      requiredKeys: ['VITE_WHATSAPP_NUMBER', 'VITE_DEMO_URL', 'VITE_SITE_URL'],
    })).toEqual([]);
  });

  test('rejects invalid phone, URLs and tracking identifiers', () => {
    const errors = validateEnvironment({
      ...validEnv,
      VITE_WHATSAPP_NUMBER: '48 9999',
      VITE_DEMO_URL: '#demo',
      VITE_SITE_URL: 'localhost',
      VITE_GA4_ID: 'UA-OLD',
      VITE_META_PIXEL_ID: 'pixel-one',
    });

    expect(errors).toHaveLength(5);
  });
});
