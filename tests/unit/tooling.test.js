import { describe, expect, test } from 'vitest';
import {
  LIGHTHOUSE_LIMITS,
  getLighthouseMetrics,
  validateLighthouseReport,
} from '../../scripts/lighthouse-audit.mjs';

describe('Lighthouse CI tooling', () => {
  test('enforces the approved scores and Core Web Vitals limits', () => {
    expect(LIGHTHOUSE_LIMITS).toEqual({
      performance: 0.9,
      accessibility: 0.9,
      bestPractices: 0.9,
      seo: 0.9,
      lcp: 2500,
      cls: 0.1,
    });
  });

  test('extracts metrics and rejects a report below the acceptance bar', () => {
    const report = {
      categories: {
        performance: { score: 0.89 },
        accessibility: { score: 1 },
        'best-practices': { score: 0.96 },
        seo: { score: 1 },
      },
      audits: {
        'largest-contentful-paint': { numericValue: 2600 },
        'cumulative-layout-shift': { numericValue: 0.02 },
      },
    };

    expect(getLighthouseMetrics(report)).toMatchObject({ performance: 89, lcp: 2600, cls: 0.02 });
    expect(validateLighthouseReport(report)).toEqual([
      'Performance precisa ser pelo menos 90 (recebido: 89).',
      'LCP precisa ficar abaixo de 2500 ms (recebido: 2600 ms).',
    ]);
  });
});
