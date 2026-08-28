import { describe, expect, test, vi } from 'vitest';
import { DEMO_FLOW, createDemoSession, initializeInteractiveDemo } from '../../src/demo.js';

function completeSession(profile = 'corretor') {
  const session = createDemoSession({ profile });
  session.start();
  session.send();
  session.send();
  session.send();
  return session;
}

describe('interactive demo flow', () => {
  test('declares three deterministic conversational steps', () => {
    expect(DEMO_FLOW.map((step) => step.id)).toEqual(['goal', 'budget', 'timing']);
    expect(DEMO_FLOW.map((step) => step.visitorMessage)).toEqual([
      'Quero comprar para morar.',
      'Até R$ 700 mil.',
      'Nos próximos 3 meses.',
    ]);
    expect(DEMO_FLOW.every((step) => !('options' in step))).toBe(true);
  });

  test('starts as a realtor journey and advances only when sent', () => {
    const session = createDemoSession();
    expect(session.start()).toMatchObject({ phase: 'active', currentStep: 'goal', progress: 0, pipeline: 'new' });
    const result = session.send();
    expect(result).toMatchObject({ accepted: true, stepId: 'goal', snapshot: { currentStep: 'budget', profile: { objective: 'Morar' } } });
  });

  test('completes the realtor journey with CRM context', () => {
    const snapshot = completeSession().getSnapshot();
    expect(snapshot).toMatchObject({
      phase: 'complete', progress: 100, pipeline: 'qualified',
      profile: { budget: 'Até R$ 700 mil', urgency: 'Alta', temperature: 'Quente', assignee: 'Você', nextAction: 'Entrar em contato' },
    });
  });

  test('uses team ownership in the real-estate-company journey', () => {
    const snapshot = completeSession('imobiliaria').getSnapshot();
    expect(snapshot.profile).toMatchObject({ objective: 'Comprar', region: 'Centro / Agronômica', budget: 'Até R$ 1,2 mi', assignee: 'Mariana' });
  });

  test('ignores sends outside an active journey and restarts cleanly', () => {
    const session = createDemoSession();
    expect(session.send().accepted).toBe(false);
    session.start(); session.send();
    expect(session.restart()).toMatchObject({ phase: 'idle', answers: {}, profile: { objective: '—', temperature: 'Novo' } });
    const completed = completeSession();
    expect(completed.send().accepted).toBe(false);
  });
});

function renderDemoFixture() {
  document.body.innerHTML = `
    <section data-interactive-demo data-demo-state="idle">
      <span data-demo-live aria-live="polite"></span>
      <span data-demo-progress-bar></span><span data-demo-progress-label></span>
      <button type="button" data-demo-start>Começar simulação</button>
      <button type="button" data-demo-restart hidden>Reiniciar simulação</button>
      <div role="tablist"><button role="tab" aria-selected="true" tabindex="0" data-demo-tab="chat">Conversa</button><button role="tab" aria-selected="false" tabindex="-1" data-demo-tab="crm">CRM</button></div>
      <section data-demo-panel="chat" class="is-active"><div data-demo-transcript></div><div class="demo-replies" data-demo-options hidden></div></section>
      <section data-demo-panel="crm">
        <div class="demo-property-context"><strong></strong><small></small></div>
        <span data-demo-field="objective">—</span><span data-demo-field="region">Centro</span><span data-demo-field="budget">—</span>
        <span data-demo-field="urgency">—</span><span data-demo-field="temperature">Novo</span><span data-demo-field="assignee">—</span><span data-demo-field="nextAction">Aguardando qualificação</span>
        <div data-demo-column="new"><b data-demo-count="new">1</b><article data-demo-lead-card><span data-demo-card-status>Novo</span></article></div>
        <div data-demo-column="qualified"><b data-demo-count="qualified">0</b></div>
      </section>
      <button type="button" data-demo-composer disabled><span data-demo-composer-text></span><span data-demo-send></span></button>
      <div data-demo-complete hidden><p></p></div>
    </section>`;
  return document.querySelector('[data-interactive-demo]');
}

const reducedMotionWindow = (matches = true) => ({ matchMedia: () => ({ matches }), setTimeout, clearTimeout });

describe('interactive demo UI', () => {
  test('puts the suggested response in the composer without quick replies', () => {
    const root = renderDemoFixture(); const track = vi.fn();
    initializeInteractiveDemo({ root, windowRef: reducedMotionWindow(), track });
    root.querySelector('[data-demo-start]').click();
    expect(root.dataset.demoState).toBe('active');
    expect(root.querySelector('[data-demo-composer-text]').textContent).toBe('Quero comprar para morar.');
    expect(root.querySelector('[data-demo-composer]').disabled).toBe(false);
    expect(root.querySelectorAll('[data-demo-option]')).toHaveLength(0);
    expect(track).toHaveBeenCalledWith('interactive_demo_start', { profile: 'corretor', scenario: 'apartment_centro' });
  });

  test('completes by clicking send and fills the CRM', () => {
    const root = renderDemoFixture(); const track = vi.fn();
    initializeInteractiveDemo({ root, windowRef: reducedMotionWindow(), track });
    root.querySelector('[data-demo-start]').click();
    const send = root.querySelector('[data-demo-composer]'); send.click(); send.click(); send.click();
    expect(root.dataset.demoState).toBe('complete');
    expect(root.querySelector('[data-demo-field="objective"]').textContent).toBe('Morar');
    expect(root.querySelector('[data-demo-field="assignee"]').textContent).toBe('Você');
    expect(root.querySelector('[data-demo-column="qualified"] [data-demo-lead-card]')).not.toBeNull();
    expect(root.querySelector('[data-demo-complete]').hidden).toBe(false);
    expect(track.mock.calls.filter(([event]) => event === 'interactive_demo_step')).toHaveLength(3);
  });

  test('resets for a profile change and runs the team scenario', () => {
    const root = renderDemoFixture();
    const controller = initializeInteractiveDemo({ root, windowRef: reducedMotionWindow(), track: vi.fn() });
    controller.setProfile('imobiliaria');
    root.querySelector('[data-demo-start]').click();
    expect(root.querySelector('[data-demo-composer-text]').textContent).toBe('Centro ou Agronômica.');
    const send = root.querySelector('[data-demo-composer]'); send.click(); send.click(); send.click();
    expect(root.querySelector('[data-demo-field="assignee"]').textContent).toBe('Mariana');
  });

  test('blocks repeated sends while the response transition is running', async () => {
    vi.useFakeTimers();
    const root = renderDemoFixture(); const track = vi.fn();
    initializeInteractiveDemo({ root, windowRef: reducedMotionWindow(false), track });
    root.querySelector('[data-demo-start]').click(); await vi.runAllTimersAsync();
    const send = root.querySelector('[data-demo-composer]'); send.click(); send.click();
    expect(root.dataset.demoTransitioning).toBe('true'); await vi.runAllTimersAsync();
    expect(track.mock.calls.filter(([event]) => event === 'interactive_demo_step')).toHaveLength(1);
    vi.useRealTimers();
  });

  test('supports tab arrow navigation', () => {
    const root = renderDemoFixture();
    initializeInteractiveDemo({ root, windowRef: reducedMotionWindow(), track: vi.fn() });
    const chat = root.querySelector('[data-demo-tab="chat"]'); const crm = root.querySelector('[data-demo-tab="crm"]');
    crm.click(); expect(crm.getAttribute('aria-selected')).toBe('true');
    crm.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(chat.getAttribute('aria-selected')).toBe('true'); expect(document.activeElement).toBe(chat);
  });
});
