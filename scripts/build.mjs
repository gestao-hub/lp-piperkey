import { build, loadEnv } from 'vite';
import { validateEnvironment } from './env-validation.mjs';

const fileEnv = loadEnv('production', process.cwd(), 'VITE_');
const effectiveEnv = { ...fileEnv, ...process.env };
const isPreview = effectiveEnv.VERCEL_ENV === 'preview';

if (isPreview) {
  effectiveEnv.VITE_WHATSAPP_NUMBER ||= '5548988049222';
  effectiveEnv.VITE_SITE_URL ||= effectiveEnv.VERCEL_URL
    ? `https://${effectiveEnv.VERCEL_URL}`
    : 'https://solo.piperkey.com.br';
  effectiveEnv.VITE_DEMO_URL ||= effectiveEnv.VITE_SITE_URL;

  process.env.VITE_WHATSAPP_NUMBER = effectiveEnv.VITE_WHATSAPP_NUMBER;
  process.env.VITE_SITE_URL = effectiveEnv.VITE_SITE_URL;
  process.env.VITE_DEMO_URL = effectiveEnv.VITE_DEMO_URL;
}

const requiredKeys = isPreview
  ? ['VITE_WHATSAPP_NUMBER', 'VITE_DEMO_URL', 'VITE_SITE_URL']
  : undefined;

const errors = validateEnvironment(effectiveEnv, { requiredKeys });

if (errors.length > 0) {
  console.error(`Configuração de ${isPreview ? 'preview' : 'produção'} inválida:`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  isPreview
    ? 'Configuração de preview validada; trackers opcionais permanecem desativados quando ausentes.'
    : 'Configuração de produção validada.',
);

await build({ mode: 'production' });
