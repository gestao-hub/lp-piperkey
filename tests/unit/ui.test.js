import { describe, expect, test, vi } from 'vitest';
import { CONSENT_STATUS } from '../../src/consent.js';
import {
  initializeConsentControls,
  initializeCtas,
  initializeFaq,
  initializeMobileCta,
  initializePricing,
  initializeReveals,
  initializeScrollDepth,
} from '../../src/ui.js';

describe('pricing controls', () => {
  test('switches prices, billing notes, selected state and contextual plan links', () => {
    document.body.innerHTML = `
      <section data-pricing data-current-period="anual">
        <button data-period="anual" aria-pressed="true">Anual</button>
        <button data-period="mensal" aria-pressed="false">Mensal</button>
        <article data-plan="silver">
          <span data-price>R$ 397</span><span data-period-note>cobrado anualmente</span>
          <a data-plan-cta href="#contato">Escolher Silver</a>
        </article>
        <article data-plan="gold">
          <span data-price>R$ 497</span><span data-period-note>cobrado anualmente</span>
          <a data-plan-cta href="#contato">Escolher Gold</a>
        </article>
      </section>`;
    const track = vi.fn();

    initializePricing({ root: document, number: '5548999998888', track });
    document.querySelector('[data-period="mensal"]').click();

    expect(document.querySelector('[data-pricing]').dataset.currentPeriod).toBe('mensal');
    expect(document.querySelector('[data-plan="silver"] [data-price]').textContent).toBe('R$ 447');
    expect(document.querySelector('[data-plan="gold"] [data-price]').textContent).toBe('R$ 547');
    expect(document.querySelector('[data-period="mensal"]').getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelector('[data-period="anual"]').getAttribute('aria-pressed')).toBe('false');
    expect(document.querySelector('[data-period-note]').textContent).toBe('sem fidelidade mínima');
    const goldCta = document.querySelector('[data-plan="gold"] [data-plan-cta]');
    expect(decodeURIComponent(goldCta.href)).toContain('R$ 547/mês');
    expect(track).toHaveBeenCalledWith('pricing_period_change', { period: 'mensal' });
    goldCta.addEventListener('click', (event) => event.preventDefault(), { once: true });
    goldCta.click();
    expect(track).toHaveBeenCalledWith('cta_whatsapp', {
      position: 'pricing',
      plan: 'gold',
      period: 'mensal',
    });
  });
});

describe('FAQ accordion', () => {
  test('keeps answers readable without JS and collapses them when enhanced', () => {
    document.body.innerHTML = `
      <div data-faq>
        <button data-faq-trigger aria-expanded="true" aria-controls="answer-progressive" data-faq-id="progressive">Question</button>
        <div id="answer-progressive" data-faq-panel>Progressive answer</div>
      </div>`;

    initializeFaq({ root: document, track: vi.fn() });

    expect(document.querySelector('[data-faq-trigger]').getAttribute('aria-expanded')).toBe('false');
    expect(document.querySelector('[data-faq-panel]').hidden).toBe(true);
  });

  test('opens one answer at a time and keeps ARIA state synchronized', () => {
    document.body.innerHTML = `
      <div data-faq>
        <button data-faq-trigger aria-expanded="false" aria-controls="answer-one" data-faq-id="one">One</button>
        <div id="answer-one" data-faq-panel hidden>Answer one</div>
        <button data-faq-trigger aria-expanded="false" aria-controls="answer-two" data-faq-id="two">Two</button>
        <div id="answer-two" data-faq-panel hidden>Answer two</div>
      </div>`;
    const track = vi.fn();

    initializeFaq({ root: document, track });
    const [first, second] = document.querySelectorAll('[data-faq-trigger]');
    first.click();
    second.click();

    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(document.querySelector('#answer-one').hidden).toBe(true);
    expect(second.getAttribute('aria-expanded')).toBe('true');
    expect(document.querySelector('#answer-two').hidden).toBe(false);
    expect(track).toHaveBeenLastCalledWith('faq_open', { faq_id: 'two' });
  });
});

describe('CTA links', () => {
  test('assigns real destinations and tracks WhatsApp/demo clicks by position', () => {
    document.body.innerHTML = `
      <a data-cta="whatsapp" data-placement="hero" href="#contato">WhatsApp</a>
      <a data-cta="demo" data-placement="hero" href="#demo">Demo</a>`;
    const track = vi.fn();

    initializeCtas({
      root: document,
      config: {
        whatsappNumber: '5548999998888',
        demoUrl: 'https://cal.com/piperkey/demo',
      },
      track,
    });

    const whatsapp = document.querySelector('[data-cta="whatsapp"]');
    const demo = document.querySelector('[data-cta="demo"]');
    expect(whatsapp.href).toContain('https://wa.me/5548999998888');
    expect(demo.href).toBe('https://cal.com/piperkey/demo');
    whatsapp.click();
    demo.click();
    expect(track).toHaveBeenCalledWith('cta_whatsapp', { position: 'hero' });
    expect(track).toHaveBeenCalledWith('cta_demo', { position: 'hero' });
  });
});

describe('consent controls', () => {
  test('shows undecided consent, stores choices and lets the user reopen preferences', () => {
    document.body.innerHTML = `
      <aside data-consent-banner hidden>
        <button data-consent="accept">Aceitar</button>
        <button data-consent="reject">Recusar</button>
      </aside>
      <button data-manage-consent>Gerenciar cookies</button>`;
    const manager = {
      getStatus: vi.fn(() => null),
      setStatus: vi.fn(),
    };

    initializeConsentControls({ root: document, manager });
    const banner = document.querySelector('[data-consent-banner]');
    expect(banner.hidden).toBe(false);

    document.querySelector('[data-consent="accept"]').click();
    expect(manager.setStatus).toHaveBeenCalledWith(CONSENT_STATUS.accepted);
    expect(banner.hidden).toBe(true);

    document.querySelector('[data-manage-consent]').click();
    expect(banner.hidden).toBe(false);

    document.querySelector('[data-consent="reject"]').click();
    expect(manager.setStatus).toHaveBeenCalledWith(CONSENT_STATUS.rejected);
  });
});

describe('scroll behavior', () => {
  test('tracks each configured scroll depth only once', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 500, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 1000, configurable: true });
    const track = vi.fn();

    const tracker = initializeScrollDepth({
      windowRef: window,
      documentRef: document,
      track,
      thresholds: [25, 50, 75, 90],
    });
    tracker.update();
    tracker.update();

    expect(track).toHaveBeenCalledWith('scroll_depth', { percent: 25 });
    expect(track).toHaveBeenCalledWith('scroll_depth', { percent: 50 });
    expect(track).not.toHaveBeenCalledWith('scroll_depth', { percent: 75 });
    expect(track).toHaveBeenCalledTimes(2);
  });

  test('shows the mobile CTA only between the hero and final CTA, outside the interactive demo', () => {
    document.body.innerHTML = `
      <section data-hero></section>
      <section data-interactive-demo></section>
      <a data-mobile-cta hidden>WhatsApp</a>
      <section data-final-cta></section>`;
    const hero = document.querySelector('[data-hero]');
    const interactiveDemo = document.querySelector('[data-interactive-demo]');
    const finalCta = document.querySelector('[data-final-cta]');
    hero.getBoundingClientRect = vi.fn(() => ({ bottom: -10 }));
    interactiveDemo.getBoundingClientRect = vi.fn(() => ({ top: 900, bottom: 1500 }));
    finalCta.getBoundingClientRect = vi.fn(() => ({ top: 1200 }));
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });

    const sticky = initializeMobileCta({ root: document, windowRef: window });
    sticky.update();
    expect(document.querySelector('[data-mobile-cta]').hidden).toBe(false);

    interactiveDemo.getBoundingClientRect = vi.fn(() => ({ top: 100, bottom: 900 }));
    sticky.update();
    expect(document.querySelector('[data-mobile-cta]').hidden).toBe(true);

    interactiveDemo.getBoundingClientRect = vi.fn(() => ({ top: -900, bottom: -100 }));
    finalCta.getBoundingClientRect = vi.fn(() => ({ top: 700 }));
    sticky.update();
    expect(document.querySelector('[data-mobile-cta]').hidden).toBe(true);
  });

  test('reveals all content immediately when IntersectionObserver is unavailable', () => {
    document.body.innerHTML = '<div data-reveal></div><div data-reveal></div>';
    initializeReveals({ root: document, windowRef: {} });
    expect([...document.querySelectorAll('[data-reveal]')].every((item) => item.classList.contains('is-visible'))).toBe(true);
  });
});
