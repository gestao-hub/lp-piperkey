export const LIGHTHOUSE_LIMITS = Object.freeze({
  performance: 0.9,
  accessibility: 0.9,
  bestPractices: 0.9,
  seo: 0.9,
  lcp: 2500,
  cls: 0.1,
});

export function getLighthouseMetrics(report) {
  return Object.freeze({
    performance: Math.round(report.categories.performance.score * 100),
    accessibility: Math.round(report.categories.accessibility.score * 100),
    bestPractices: Math.round(report.categories['best-practices'].score * 100),
    seo: Math.round(report.categories.seo.score * 100),
    lcp: Math.round(report.audits['largest-contentful-paint'].numericValue),
    cls: report.audits['cumulative-layout-shift'].numericValue,
  });
}

export function validateLighthouseReport(report) {
  const metrics = getLighthouseMetrics(report);
  const errors = [];
  const categoryChecks = [
    ['performance', 'Performance'],
    ['accessibility', 'Acessibilidade'],
    ['bestPractices', 'Boas Práticas'],
    ['seo', 'SEO'],
  ];

  categoryChecks.forEach(([key, label]) => {
    const minimum = LIGHTHOUSE_LIMITS[key] * 100;
    if (metrics[key] < minimum) {
      errors.push(`${label} precisa ser pelo menos ${minimum} (recebido: ${metrics[key]}).`);
    }
  });

  if (metrics.lcp >= LIGHTHOUSE_LIMITS.lcp) {
    errors.push(`LCP precisa ficar abaixo de ${LIGHTHOUSE_LIMITS.lcp} ms (recebido: ${metrics.lcp} ms).`);
  }
  if (metrics.cls >= LIGHTHOUSE_LIMITS.cls) {
    errors.push(`CLS precisa ficar abaixo de ${LIGHTHOUSE_LIMITS.cls} (recebido: ${metrics.cls}).`);
  }

  return errors;
}
