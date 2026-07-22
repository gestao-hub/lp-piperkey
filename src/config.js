const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export const PERIODS = Object.freeze({
  anual: Object.freeze({ label: 'Anual', note: 'cobrado anualmente', discount: '-11%', default: true }),
  trimestral: Object.freeze({ label: 'Trimestral', note: 'cobrado a cada 3 meses', default: false }),
  mensal: Object.freeze({ label: 'Mensal', note: 'sem fidelidade mínima', default: false }),
});

export const PLANS = Object.freeze({
  silver: Object.freeze({
    name: 'Silver',
    description: 'Pra quem está começando e não abre mão do atendimento automático.',
    prices: Object.freeze({ anual: 397, trimestral: 422, mensal: 447 }),
    features: Object.freeze([
      'Margot (SDR de IA) ilimitada',
      'Site próprio',
      'CRM',
      'Integração com portais (ZAP, VivaReal, OLX)',
      'Dashboard de anúncios Meta',
    ]),
  }),
  gold: Object.freeze({
    name: 'Gold',
    description: 'Pra quem já tem carteira e quer reativar a base e ganhar escala.',
    prices: Object.freeze({ anual: 497, trimestral: 522, mensal: 547 }),
    features: Object.freeze([
      'Tudo do plano Silver',
      'Disparo de mensagens em massa (API oficial Meta)',
      'Radar de Matches',
      'Co-Pilot de resposta',
    ]),
  }),
});

function normalizeSiteUrl(value = '') {
  return value.trim().replace(/\/+$/, '');
}

export function normalizePhone(value = '') {
  return value.replace(/\D/g, '');
}

export function createSiteConfig(env = {}) {
  return Object.freeze({
    whatsappNumber: normalizePhone(env.VITE_WHATSAPP_NUMBER),
    demoUrl: env.VITE_DEMO_URL?.trim() || '#demo',
    siteUrl: normalizeSiteUrl(env.VITE_SITE_URL),
    ga4Id: env.VITE_GA4_ID?.trim() || '',
    metaPixelId: env.VITE_META_PIXEL_ID?.trim() || '',
    consentVersion: '1',
    privacyUrl: '/privacidade.html',
  });
}

export const SITE_CONFIG = createSiteConfig(import.meta.env);

export function formatPrice(value) {
  return currencyFormatter.format(value);
}

export function getPlanPrice(planId, period) {
  const plan = PLANS[planId];
  if (!plan) throw new Error(`Plano desconhecido: ${planId}`);
  if (!(period in PERIODS)) throw new Error(`Período desconhecido: ${period}`);
  return plan.prices[period];
}

export function buildWhatsAppUrl({ number, message }) {
  const normalizedNumber = normalizePhone(number);
  if (!normalizedNumber) return '#contato';
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}

export function buildPlanWhatsAppUrl({ planId, period, number = SITE_CONFIG.whatsappNumber }) {
  const plan = PLANS[planId];
  const price = getPlanPrice(planId, period);
  const readablePrice = formatPrice(price).replace(/\u00a0/g, ' ');
  const message = `Olá! Quero conhecer o plano ${plan.name} do PiperKey Solo no período ${period} (${readablePrice}/mês).`;
  return buildWhatsAppUrl({ number, message });
}

export function buildGeneralWhatsAppUrl(number = SITE_CONFIG.whatsappNumber) {
  return buildWhatsAppUrl({
    number,
    message: 'Olá! Quero conhecer o PiperKey Solo.',
  });
}
