export const REQUIRED_PUBLIC_ENV = Object.freeze([
  'VITE_WHATSAPP_NUMBER',
  'VITE_DEMO_URL',
  'VITE_SITE_URL',
  'VITE_GA4_ID',
  'VITE_META_PIXEL_ID',
]);

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateEnvironment(env, { requiredKeys = REQUIRED_PUBLIC_ENV } = {}) {
  const errors = [];

  requiredKeys.forEach((key) => {
    if (!env[key]?.trim()) errors.push(`${key} é obrigatória.`);
  });

  if (env.VITE_WHATSAPP_NUMBER && !/^\d{12,15}$/.test(env.VITE_WHATSAPP_NUMBER.replace(/\D/g, ''))) {
    errors.push('VITE_WHATSAPP_NUMBER deve usar formato internacional com 12 a 15 dígitos.');
  }
  if (env.VITE_DEMO_URL && !isHttpsUrl(env.VITE_DEMO_URL)) {
    errors.push('VITE_DEMO_URL deve ser uma URL HTTPS completa.');
  }
  if (env.VITE_SITE_URL && !isHttpsUrl(env.VITE_SITE_URL)) {
    errors.push('VITE_SITE_URL deve ser uma URL HTTPS completa.');
  }
  if (env.VITE_GA4_ID && !/^G-[A-Z0-9]+$/i.test(env.VITE_GA4_ID)) {
    errors.push('VITE_GA4_ID deve usar o formato G-XXXXXXXXXX.');
  }
  if (env.VITE_META_PIXEL_ID && !/^\d{6,20}$/.test(env.VITE_META_PIXEL_ID)) {
    errors.push('VITE_META_PIXEL_ID deve conter apenas dígitos.');
  }

  return errors;
}
