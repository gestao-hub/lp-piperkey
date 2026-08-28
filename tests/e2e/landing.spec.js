import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders the approved brand, content journey and primary conversion', async ({ page }) => {
  await expect(page).toHaveTitle(/PiperKey Solo/);
  await expect(page.getByRole('img', { name: 'PiperKey' }).first()).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Atenda mais');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('venda todos os dias');
  await expect(page.locator('#para-quem')).toContainText('Corretor autônomo');
  await expect(page.locator('#para-quem')).toContainText('Pequena imobiliária');
  await expect(page.getByRole('link', { name: /Quero conhecer o PiperKey|Falar no WhatsApp/i }).first()).toHaveAttribute(
    'href',
    /wa\.me\/5548988049222/,
  );

  const orderedHeadings = await page.locator('main h2').allTextContents();
  expect(orderedHeadings).toEqual(expect.arrayContaining([
    expect.stringContaining('operação mais organizada'),
    expect.stringContaining('cliente não sabe que você está ocupado'),
    expect.stringContaining('mesmo fluxo'),
    expect.stringContaining('demonstração direta'),
    expect.stringContaining('Experimente a Margot'),
    expect.stringContaining('Antes de você perguntar'),
    expect.stringContaining('disponível o tempo todo'),
  ]));
});

test('renders the approved problem and final CTA copy exactly', async ({ page }) => {
  const problem = page.locator('#problema');
  await expect(problem.getByRole('heading', { level: 2 })).toHaveText(
    'O cliente não sabe que você está ocupado. Ele só sabe que ninguém respondeu.',
  );
  await expect(problem.locator('.section-heading > p')).toContainText(
    'Toda vez que seu celular fica sem resposta, alguém está vendendo no seu lugar.',
  );
  await expect(problem.locator('.section-heading > p')).toContainText(
    'Enquanto você visita um imóvel, negocia ou dirige, a Margot continua atendendo, qualificando e mantendo cada oportunidade viva.',
  );

  const finalCta = page.locator('[data-final-cta]');
  await expect(finalCta.locator('.eyebrow')).toHaveText('Seu próximo lead não vai esperar.');
  await expect(finalCta.getByRole('heading', { level: 2 })).toHaveText(
    'Você não precisa estar disponível o tempo todo para continuar atendendo bem.',
  );
  await expect(finalCta.locator('.final-cta-inner > p').first()).toHaveText(
    'Agende 15 minutos e veja a Margot funcionando em uma operação parecida com a sua.',
  );
});

test('keeps pricing out of the public page and general CTAs price-free', async ({ page }) => {
  await expect(page.locator('#planos')).toHaveCount(0);
  await expect(page.locator('[data-pricing]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Planos', exact: true })).toHaveCount(0);

  for (const cta of await page.locator('[data-cta]').all()) {
    expect(decodeURIComponent(await cta.getAttribute('href'))).not.toMatch(/R\$|397|497|mensal|trimestral|anual/i);
  }
});

test('operates the FAQ by keyboard and keeps a single answer open', async ({ page }) => {
  const first = page.getByRole('button', { name: /Já tenho um CRM mais barato/i });
  const second = page.getByRole('button', { name: /Não confio em robô/i });

  await first.focus();
  await page.keyboard.press('Enter');
  await expect(first).toHaveAttribute('aria-expanded', 'true');

  await second.focus();
  await page.keyboard.press('Space');
  await expect(first).toHaveAttribute('aria-expanded', 'false');
  await expect(second).toHaveAttribute('aria-expanded', 'true');
});

test('loads no trackers before consent and both providers after acceptance', async ({ page }) => {
  await expect(page.locator('script[data-piperkey-analytics]')).toHaveCount(0);
  const banner = page.getByRole('region', { name: 'Preferências de cookies' });
  await expect(banner).toBeVisible();

  await banner.getByRole('button', { name: 'Aceitar' }).click();
  await expect(page.locator('script[data-piperkey-analytics="ga4"]')).toHaveCount(1);
  await expect(page.locator('script[data-piperkey-analytics="meta"]')).toHaveCount(1);
  await expect(banner).toBeHidden();
});

test('keeps the page free of serious accessibility violations', async ({ page }) => {
  await page.getByRole('button', { name: 'Recusar' }).click();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact))).toEqual([]);
});

test('has no horizontal overflow and manages the mobile WhatsApp CTA', async ({ page }) => {
  const viewport = page.viewportSize();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  if (viewport.width > 480) return;
  const sticky = page.locator('[data-mobile-cta]');
  await expect(sticky).toBeHidden();
  await page.locator('#problema').scrollIntoViewIfNeeded();
  await expect(sticky).toBeVisible();
  await page.locator('[data-interactive-demo]').scrollIntoViewIfNeeded();
  await expect(sticky).toBeHidden();
  await page.locator('[data-final-cta]').scrollIntoViewIfNeeded();
  await expect(sticky).toBeHidden();
});

test('publishes a linked privacy page', async ({ page }) => {
  await page.getByRole('link', { name: 'Política de privacidade', exact: true }).click();
  await expect(page).toHaveURL(/privacidade\.html/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Política de Privacidade');
});

test('keeps essential contact links usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.locator('#planos')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Falar no WhatsApp/i }).first()).toHaveAttribute(
    'href',
    /wa\.me\/5548988049222/,
  );
  await expect(page.getByRole('link', { name: /Agendar demonstração/i }).first()).toHaveAttribute(
    'href',
    /wa\.me\/5548988049222.*agendar.*demonstra%C3%A7%C3%A3o/i,
  );

  await context.close();
});

test('publishes valid robots directives for search crawlers', async ({ request }) => {
  const response = await request.get('/robots.txt');

  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('text/plain');
  expect(await response.text()).toBe('User-agent: *\nAllow: /\n');
});

test('qualifies a lead through the interactive Margot journey', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const demo = page.locator('[data-interactive-demo]');

  await demo.getByRole('button', { name: 'Começar simulação' }).focus();
  await page.keyboard.press('Enter');
  await demo.getByRole('button', { name: 'Morar', exact: true }).focus();
  await page.keyboard.press('Enter');
  await demo.getByRole('button', { name: 'Faixa inicial', exact: true }).click();
  await demo.getByRole('button', { name: 'Quero visitar esta semana', exact: true }).click();

  await expect(demo).toHaveAttribute('data-demo-state', 'complete');
  await expect(demo.locator('[data-demo-field="objective"]')).toHaveText('Morar');
  await expect(demo.locator('[data-demo-field="temperature"]')).toHaveText('Quente');
  await expect(demo.locator('[data-demo-column="qualified"] [data-demo-lead-card]')).toBeVisible();
  await expect(demo.getByRole('link', { name: 'Quero isso no meu atendimento' })).toHaveAttribute(
    'href',
    /wa\.me\/5548988049222/,
  );
});

test('supports an alternate demo path and a clean restart', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const demo = page.locator('[data-interactive-demo]');

  await demo.getByRole('button', { name: 'Começar simulação' }).click();
  await demo.getByRole('button', { name: 'Investir', exact: true }).click();
  await demo.getByRole('button', { name: 'Faixa ampliada', exact: true }).click();
  await demo.getByRole('button', { name: 'Ainda estou pesquisando', exact: true }).click();
  await expect(demo.locator('[data-demo-field="temperature"]')).toHaveText('Morno');
  await expect(demo.locator('[data-demo-field="nextAction"]')).toHaveText('Enviar opções semelhantes');

  await demo.getByRole('button', { name: 'Reiniciar simulação' }).click();
  await expect(demo).toHaveAttribute('data-demo-state', 'idle');
  await expect(demo.locator('[data-demo-field="objective"]')).toHaveText('—');
  await expect(demo.getByRole('button', { name: 'Começar simulação' })).toBeVisible();
});

test('exposes keyboard-operated demo tabs on mobile', async ({ page }) => {
  if (page.viewportSize().width > 480) return;
  const chatTab = page.getByRole('tab', { name: 'Conversa' });
  const crmTab = page.getByRole('tab', { name: 'CRM' });

  await chatTab.focus();
  await page.keyboard.press('ArrowRight');

  await expect(crmTab).toHaveAttribute('aria-selected', 'true');
  await expect(crmTab).toBeFocused();
  await expect(page.locator('[data-demo-panel="crm"]')).toBeVisible();
});

test('keeps the three-step explanation as the no-JavaScript fallback', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.locator('[data-demo-fallback]')).toBeVisible();
  await expect(page.locator('[data-demo-fallback] > li')).toHaveCount(3);
  await expect(page.locator('[data-interactive-demo]')).toBeHidden();

  await context.close();
});
