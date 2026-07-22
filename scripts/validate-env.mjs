import { loadEnv } from 'vite';
import { validateEnvironment } from './env-validation.mjs';

const fileEnv = loadEnv('production', process.cwd(), 'VITE_');
const errors = validateEnvironment({ ...fileEnv, ...process.env });

if (errors.length > 0) {
  console.error('Configuração de produção inválida:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Configuração de produção validada.');
