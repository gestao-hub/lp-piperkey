import {
  PERIODS,
  PLANS,
  buildGeneralWhatsAppUrl,
  buildPlanWhatsAppUrl,
  formatPrice,
} from './config.js';
import { CONSENT_STATUS } from './consent.js';

export function initializePricing({ root, number, track }) {
  const pricing = root.querySelector('[data-pricing]');
  if (!pricing) return;

  const periodButtons = [...pricing.querySelectorAll('[data-period]')];
  const planCards = [...pricing.querySelectorAll('[data-plan]')];

  function applyPeriod(period, { emit = true } = {}) {
    if (!(period in PERIODS)) return;
    pricing.dataset.currentPeriod = period;

    periodButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.period === period));
    });

    planCards.forEach((card) => {
      const planId = card.dataset.plan;
      const plan = PLANS[planId];
      if (!plan) return;
      card.querySelector('[data-price]').textContent = formatPrice(plan.prices[period]);
      card.querySelector('[data-period-note]').textContent = PERIODS[period].note;
      card.querySelector('[data-plan-cta]').href = buildPlanWhatsAppUrl({ planId, period, number });
    });

    if (emit) track('pricing_period_change', { period });
  }

  periodButtons.forEach((button) => {
    button.addEventListener('click', () => applyPeriod(button.dataset.period));
  });

  planCards.forEach((card) => {
    card.querySelector('[data-plan-cta]')?.addEventListener('click', () => {
      track('cta_whatsapp', {
        position: 'pricing',
        plan: card.dataset.plan,
        period: pricing.dataset.currentPeriod,
      });
    });
  });

  applyPeriod(pricing.dataset.currentPeriod || 'anual', { emit: false });
}

export function initializeFaq({ root, track }) {
  const triggers = [...root.querySelectorAll('[data-faq-trigger]')];

  function close(trigger) {
    trigger.setAttribute('aria-expanded', 'false');
    root.getElementById(trigger.getAttribute('aria-controls')).hidden = true;
  }

  triggers.forEach(close);

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const wasOpen = trigger.getAttribute('aria-expanded') === 'true';
      triggers.forEach(close);
      if (wasOpen) return;

      trigger.setAttribute('aria-expanded', 'true');
      root.getElementById(trigger.getAttribute('aria-controls')).hidden = false;
      track('faq_open', { faq_id: trigger.dataset.faqId });
    });
  });
}

export function initializeCtas({ root, config, track }) {
  root.querySelectorAll('[data-cta="whatsapp"]').forEach((link) => {
    link.href = buildGeneralWhatsAppUrl(config.whatsappNumber);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.addEventListener('click', () => {
      track('cta_whatsapp', { position: link.dataset.placement });
    });
  });

  root.querySelectorAll('[data-cta="demo"]').forEach((link) => {
    link.href = config.demoUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.addEventListener('click', () => {
      track('cta_demo', { position: link.dataset.placement });
    });
  });
}

export function initializeConsentControls({ root, manager }) {
  const banner = root.querySelector('[data-consent-banner]');
  if (!banner) return;

  banner.hidden = manager.getStatus() !== null;

  root.querySelector('[data-consent="accept"]')?.addEventListener('click', () => {
    manager.setStatus(CONSENT_STATUS.accepted);
    banner.hidden = true;
  });

  root.querySelector('[data-consent="reject"]')?.addEventListener('click', () => {
    manager.setStatus(CONSENT_STATUS.rejected);
    banner.hidden = true;
  });

  root.querySelectorAll('[data-manage-consent]').forEach((button) => {
    button.addEventListener('click', () => {
      banner.hidden = false;
    });
  });
}

export function initializeScrollDepth({
  windowRef,
  documentRef,
  track,
  thresholds = [25, 50, 75, 90],
}) {
  const reached = new Set();

  function update() {
    const maxScroll = documentRef.documentElement.scrollHeight - windowRef.innerHeight;
    if (maxScroll <= 0) return;
    const percent = Math.min(100, (windowRef.scrollY / maxScroll) * 100);

    thresholds.forEach((threshold) => {
      if (percent >= threshold && !reached.has(threshold)) {
        reached.add(threshold);
        track('scroll_depth', { percent: threshold });
      }
    });
  }

  windowRef.addEventListener?.('scroll', update, { passive: true });
  return Object.freeze({
    update,
    destroy: () => windowRef.removeEventListener?.('scroll', update),
  });
}

export function initializeMobileCta({ root, windowRef }) {
  const hero = root.querySelector('[data-hero]');
  const interactiveDemo = root.querySelector('[data-interactive-demo]');
  const finalCta = root.querySelector('[data-final-cta]');
  const mobileCta = root.querySelector('[data-mobile-cta]');

  function update() {
    if (!hero || !finalCta || !mobileCta) return;
    const passedHero = hero.getBoundingClientRect().bottom < 0;
    const demoRect = interactiveDemo?.getBoundingClientRect();
    const demoInView = demoRect ? demoRect.top < windowRef.innerHeight && demoRect.bottom > 0 : false;
    const reachedFinalCta = finalCta.getBoundingClientRect().top <= windowRef.innerHeight;
    mobileCta.hidden = !passedHero || demoInView || reachedFinalCta;
  }

  windowRef.addEventListener?.('scroll', update, { passive: true });
  windowRef.addEventListener?.('resize', update);
  update();

  return Object.freeze({
    update,
    destroy: () => {
      windowRef.removeEventListener?.('scroll', update);
      windowRef.removeEventListener?.('resize', update);
    },
  });
}

export function initializeReveals({ root, windowRef }) {
  const elements = [...root.querySelectorAll('[data-reveal]')];
  const reduceMotion = windowRef.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !windowRef.IntersectionObserver) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return null;
  }

  const observer = new windowRef.IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 },
  );

  elements.forEach((element) => observer.observe(element));
  return observer;
}
