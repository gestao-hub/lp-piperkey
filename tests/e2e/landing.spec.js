import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders the approved brand, content journey and primary conversion', async ({ page }) => {
  await expect(page).toHaveTitle(/PiperKey Solo/);
  await expect(page.getByRole('img', { name: 'PiperKey' }).first()).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Você é um corretor só');
  await expect(page.getByRole('link', { name: /Falar no WhatsApp/i }).first()).toHaveAttribute(
    'href',
    /wa\.me\/5548999998888/,
  );

  const orderedHeadings = await page.locator('main h2').allTextContents();
  expect(orderedHeadings).toEqual([
    expect.stringContaining('estar em um lugar só'),
    expect.stringContaining('Atendimento sem limite'),
    expect.stringContaining('lead pronto'),
    expect.stringContaining('tamanho da sua operação'),
    expect.stringContaining('Antes de você perguntar'),
    expect.stringContaining('único ponto de atendimento'),
  ]);
});

test('switches plan prices and keeps the plan CTA contextual', async ({ page }) => {
  await page.getByRole('button', { name: 'Mensal' }).click();

  await expect(page.locator('[data-plan="silver"] [data-price]')).toHaveText('R$ 447');
  await expect(page.locator('[data-plan="gold"] [data-price]')).toHaveText('R$ 547');
  await expect(page.locator('[data-plan="gold"] [data-plan-cta]')).toHaveAttribute(
    'href',
    /plano%20Gold.*mensal.*547/,
  );
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
  await page.locator('[data-final-cta]').scrollIntoViewIfNeeded();
  await expect(sticky).toBeHidden();
});

test('publishes a linked privacy page', async ({ page }) => {
  await page.getByRole('link', { name: 'Política de privacidade', exact: true }).click();
  await expect(page).toHaveURL(/privacidade\.html/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Política de Privacidade');
});

test('keeps annual prices and essential contact links usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.locator('[data-plan="silver"] [data-price]')).toHaveText('R$\u00a0397');
  await expect(page.getByRole('link', { name: /Falar no WhatsApp/i }).first()).toHaveAttribute(
    'href',
    /wa\.me\/5548999998888/,
  );
  await expect(page.getByRole('link', { name: /Agendar demonstração/i }).first()).toHaveAttribute(
    'href',
    'https://cal.com/piperkey/demo',
  );
  await expect(page.getByRole('link', { name: 'Escolher Gold' })).toHaveAttribute(
    'href',
    /wa\.me\/5548999998888.*Gold.*anual/,
  );

  await context.close();
});

test('publishes valid robots directives for search crawlers', async ({ request }) => {
  const response = await request.get('/robots.txt');

  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('text/plain');
  expect(await response.text()).toBe('User-agent: *\nAllow: /\n');
});
