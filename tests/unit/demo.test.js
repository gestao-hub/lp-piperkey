import { describe, expect, test, vi } from 'vitest';
import {
  DEMO_FLOW,
  createDemoSession,
  initializeInteractiveDemo,
} from '../../src/demo.js';

function completeSession({ goal = 'live', budget = 'up-to-450', timing = 'visit-week' } = {}) {
  const session = createDemoSession();
  session.start();
  session.select(goal);
  session.select(budget);
  session.select(timing);
  return session;
}

describe('interactive demo flow', () => {
  test('declares the three approved guided steps', () => {
    expect(DEMO_FLOW.map((step) => step.id)).toEqual(['goal', 'budget', 'timing']);
    expect(DEMO_FLOW.map((step) => step.options.map((option) => option.id))).toEqual([
      ['live', 'invest'],
      ['up-to-450', '450-to-700', 'above-700'],
      ['visit-week', 'researching'],
    ]);
  });

  test('starts with the Centro property and the first qualification question', () => {
    const session = createDemoSession();

    expect(session.start()).toMatchObject({
      phase: 'active',
      currentStep: 'goal',
      progress: 0,
      pipeline: 'new',
      profile: {
        objective: '—',
        region: 'Centro',
        budget: '—',
        urgency: '—',
        temperature: 'Novo',
        nextAction: 'Aguardando qualificação',
      },
    });
  });

  test.each([
    ['live', 'Morar'],
    ['invest', 'Investir'],
  ])('maps the %s goal into the CRM profile', (optionId, expectedObjective) => {
    const session = createDemoSession();
    session.start();

    const result = session.select(optionId);

    expect(result.accepted).toBe(true);
    expect(result.stepId).toBe('goal');
    expect(result.snapshot.currentStep).toBe('budget');
    expect(result.snapshot.profile.objective).toBe(expectedObjective);
  });

  test.each([
    ['up-to-450', 'Até R$ 450 mil'],
    ['450-to-700', 'R$ 450–700 mil'],
    ['above-700', 'Acima de R$ 700 mil'],
  ])('maps the %s budget into the CRM profile', (optionId, expectedBudget) => {
    const session = createDemoSession();
    session.start();
    session.select('live');

    const result = session.select(optionId);

    expect(result.accepted).toBe(true);
    expect(result.snapshot.currentStep).toBe('timing');
    expect(result.snapshot.profile.budget).toBe(expectedBudget);
  });

  test.each([
    ['visit-week', 'Alta', 'Quente', 'Sugerir horários de visita'],
    ['researching', 'Média', 'Morno', 'Enviar opções semelhantes'],
  ])(
    'completes the %s timing path and qualifies the lead',
    (optionId, urgency, temperature, nextAction) => {
      const session = createDemoSession();
      session.start();
      session.select('invest');
      session.select('above-700');

      const result = session.select(optionId);

      expect(result.accepted).toBe(true);
      expect(result.snapshot).toMatchObject({
        phase: 'complete',
        currentStep: null,
        progress: 100,
        pipeline: 'qualified',
        profile: { urgency, temperature, nextAction },
      });
    },
  );

  test('ignores choices before start, from another step, and after completion', () => {
    const session = createDemoSession();

    expect(session.select('live').accepted).toBe(false);
    session.start();
    expect(session.select('visit-week').accepted).toBe(false);
    completeSession();

    const completed = completeSession();
    expect(completed.select('researching').accepted).toBe(false);
  });

  test('restarts a completed journey without keeping previous answers', () => {
    const session = completeSession({ goal: 'invest', budget: '450-to-700', timing: 'researching' });

    const restarted = session.restart();

    expect(restarted).toMatchObject({
      phase: 'idle',
      currentStep: null,
      progress: 0,
      pipeline: 'new',
      answers: {},
      profile: {
        objective: '—',
        budget: '—',
        urgency: '—',
        temperature: 'Novo',
      },
    });
  });
});

function renderDemoFixture() {
  document.body.innerHTML = `
    <section data-interactive-demo data-demo-state="idle">
      <span data-demo-live aria-live="polite"></span>
      <div data-demo-progress><span data-demo-progress-bar></span></div>
      <span data-demo-progress-label></span>
      <button type="button" data-demo-start>Começar simulação</button>
      <button type="button" data-demo-restart hidden>Reiniciar simulação</button>

      <div role="tablist" aria-label="Telas da simulação">
        <button role="tab" aria-selected="true" tabindex="0" data-demo-tab="chat">Conversa</button>
        <button role="tab" aria-selected="false" tabindex="-1" data-demo-tab="crm">CRM</button>
      </div>
      <section data-demo-panel="chat" class="is-active">
        <div data-demo-transcript></div>
        <div data-demo-options></div>
      </section>
      <section data-demo-panel="crm">
        <span data-demo-field="objective">—</span>
        <span data-demo-field="region">Centro</span>
        <span data-demo-field="budget">—</span>
        <span data-demo-field="urgency">—</span>
        <span data-demo-field="temperature">Novo</span>
        <span data-demo-field="nextAction">Aguardando qualificação</span>
        <div data-demo-column="new"><b data-demo-count="new">1</b><article data-demo-lead-card><span data-demo-card-status>Novo</span> Lead Mariana</article></div>
        <div data-demo-column="qualified"><b data-demo-count="qualified">0</b></div>
      </section>
      <div data-demo-complete hidden>
        <a href="#contato" data-cta="whatsapp" data-placement="interactive_demo">Quero isso no meu atendimento</a>
      </div>
    </section>`;

  return document.querySelector('[data-interactive-demo]');
}

function reducedMotionWindow(matches = true) {
  return {
    matchMedia: () => ({ matches }),
    setTimeout,
    clearTimeout,
  };
}

describe('interactive demo UI', () => {
  test('starts the guided journey, announces it and tracks the first screen', () => {
    const root = renderDemoFixture();
    const track = vi.fn();
    initializeInteractiveDemo({ root, windowRef: reducedMotionWindow(), track });

    root.querySelector('[data-demo-start]').click();

    expect(root.dataset.demoState).toBe('active');
    expect(root.querySelector('[data-demo-progress-label]').textContent).toBe('Etapa 1 de 3');
    expect(root.querySelectorAll('[data-demo-option]')).toHaveLength(2);
    expect(root.querySelector('[data-demo-live]').textContent).toContain('É para morar ou investir');
    expect(track).toHaveBeenCalledWith('interactive_demo_start', { scenario: 'apartment_centro' });
  });

  test('completes a visit path, fills the CRM and moves the lead to qualified', () => {
    const root = renderDemoFixture();
    const track = vi.fn();
    initializeInteractiveDemo({ root, windowRef: reducedMotionWindow(), track });
    root.querySelector('[data-demo-start]').click();

    root.querySelector('[data-demo-option="live"]').click();
    root.querySelector('[data-demo-option="up-to-450"]').click();
    root.querySelector('[data-demo-option="visit-week"]').click();

    expect(root.dataset.demoState).toBe('complete');
    expect(root.querySelector('[data-demo-field="objective"]').textContent).toBe('Morar');
    expect(root.querySelector('[data-demo-field="budget"]').textContent).toBe('Até R$ 450 mil');
    expect(root.querySelector('[data-demo-field="temperature"]').textContent).toBe('Quente');
    expect(root.querySelector('[data-demo-field="nextAction"]').textContent).toBe('Sugerir horários de visita');
    expect(root.querySelector('[data-demo-column="qualified"] [data-demo-lead-card]')).not.toBeNull();
    expect(root.querySelector('[data-demo-count="new"]').textContent).toBe('0');
    expect(root.querySelector('[data-demo-count="qualified"]').textContent).toBe('1');
    expect(root.querySelector('[data-demo-card-status]').textContent).toBe('Qualificado');
    expect(root.querySelectorAll('[data-demo-option]')).toHaveLength(0);
    expect(root.querySelector('[data-demo-complete]').hidden).toBe(false);
    expect(root.querySelector('[data-demo-tab="crm"]').getAttribute('aria-selected')).toBe('true');
    expect(track).toHaveBeenCalledWith('interactive_demo_complete', {
      goal: 'live',
      budget: 'up-to-450',
      timing: 'visit-week',
      objective: 'Morar',
      region: 'Centro',
      budget_range: 'Até R$ 450 mil',
      urgency: 'Alta',
      temperature: 'Quente',
      next_action: 'Sugerir horários de visita',
    });
  });

  test('restarts the interface without preserving CRM values or messages', () => {
    const root = renderDemoFixture();
    const track = vi.fn();
    initializeInteractiveDemo({ root, windowRef: reducedMotionWindow(), track });
    root.querySelector('[data-demo-start]').click();
    root.querySelector('[data-demo-option="invest"]').click();

    root.querySelector('[data-demo-restart]').click();

    expect(root.dataset.demoState).toBe('idle');
    expect(root.querySelector('[data-demo-field="objective"]').textContent).toBe('—');
    expect(root.querySelector('[data-demo-field="temperature"]').textContent).toBe('Novo');
    expect(root.querySelector('[data-demo-column="new"] [data-demo-lead-card]')).not.toBeNull();
    expect(root.querySelector('[data-demo-count="new"]').textContent).toBe('1');
    expect(root.querySelector('[data-demo-count="qualified"]').textContent).toBe('0');
    expect(root.querySelector('[data-demo-card-status]').textContent).toBe('Novo');
    expect(root.querySelector('[data-demo-complete]').hidden).toBe(true);
    expect(root.querySelectorAll('[data-demo-message]')).toHaveLength(1);
    expect(track).toHaveBeenCalledWith('interactive_demo_restart', { from_phase: 'active' });
  });

  test('blocks repeated choices while the response transition is running', async () => {
    vi.useFakeTimers();
    const root = renderDemoFixture();
    const track = vi.fn();
    initializeInteractiveDemo({ root, windowRef: reducedMotionWindow(false), track });
    root.querySelector('[data-demo-start]').click();
    await vi.runAllTimersAsync();

    const option = root.querySelector('[data-demo-option="live"]');
    option.click();
    option.click();
    expect(root.dataset.demoTransitioning).toBe('true');
    await vi.runAllTimersAsync();

    expect(track.mock.calls.filter(([event]) => event === 'interactive_demo_step')).toHaveLength(1);
    expect(root.querySelectorAll('[data-demo-message="visitor"]')).toHaveLength(1);
    vi.useRealTimers();
  });

  test('supports tab clicks and arrow-key navigation with correct ARIA state', () => {
    const root = renderDemoFixture();
    initializeInteractiveDemo({ root, windowRef: reducedMotionWindow(), track: vi.fn() });
    const chatTab = root.querySelector('[data-demo-tab="chat"]');
    const crmTab = root.querySelector('[data-demo-tab="crm"]');

    crmTab.click();
    expect(crmTab.getAttribute('aria-selected')).toBe('true');
    expect(root.querySelector('[data-demo-panel="crm"]').classList.contains('is-active')).toBe(true);

    crmTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(chatTab.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(chatTab);
  });
});
