import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { preview } from 'vite';
import {
  getLighthouseMetrics,
  validateLighthouseReport,
} from './lighthouse-audit.mjs';

if (!existsSync('dist/index.html')) {
  console.error('Execute o build de produção antes do Lighthouse.');
  process.exit(1);
}

const outputDirectory = '.lighthouseci';
await mkdir(outputDirectory, { recursive: true });

let chrome;
let previewServer;

try {
  previewServer = await preview({
    preview: {
      host: '127.0.0.1',
      port: 4179,
      strictPort: false,
    },
  });
  const address = previewServer.httpServer.address();
  const port = typeof address === 'object' ? address.port : 4179;
  const url = `http://127.0.0.1:${port}/index.html`;

  chrome = await launch({
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
  });

  const result = await lighthouse(url, {
    logLevel: 'error',
    output: 'html',
    port: chrome.port,
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await writeFile(`${outputDirectory}/lighthouse-${timestamp}.html`, result.report);
  await writeFile(`${outputDirectory}/lighthouse-${timestamp}.json`, JSON.stringify(result.lhr, null, 2));

  const metrics = getLighthouseMetrics(result.lhr);
  console.log(`Performance: ${metrics.performance}`);
  console.log(`Acessibilidade: ${metrics.accessibility}`);
  console.log(`Boas Práticas: ${metrics.bestPractices}`);
  console.log(`SEO: ${metrics.seo}`);
  console.log(`LCP: ${metrics.lcp} ms`);
  console.log(`CLS: ${metrics.cls}`);

  const errors = validateLighthouseReport(result.lhr);
  if (errors.length > 0) {
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
  }
} finally {
  await chrome?.kill();
  if (previewServer) {
    await new Promise((resolve, reject) => {
      previewServer.httpServer.close((error) => (error ? reject(error) : resolve()));
    });
  }
}
