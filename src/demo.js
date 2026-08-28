const BASE_PROFILE = Object.freeze({
  objective: '—', region: '—', budget: '—', urgency: '—', temperature: 'Novo', assignee: '—', nextAction: 'Aguardando qualificação',
});

export const DEMO_SCENARIOS = Object.freeze({
  corretor: Object.freeze({
    initialMessage: 'Olá! Vi que você se interessou pelo apartamento de 2 quartos no Centro.',
    propertyTitle: 'Apartamento · 2 quartos', propertyLocation: 'Centro · Florianópolis',
    completion: 'Lead qualificado e pronto no CRM. Você entra sabendo o que ele quer e qual é o próximo passo.',
    initialProfile: Object.freeze({ ...BASE_PROFILE, region: 'Centro' }),
    flow: Object.freeze([
      Object.freeze({ id: 'goal', prompt: 'É para morar ou investir?', visitorMessage: 'Quero comprar para morar.', assistantMessage: 'Perfeito. Qual faixa de valor faz sentido para você?', profile: Object.freeze({ objective: 'Morar', temperature: 'Em qualificação', nextAction: 'Confirmar faixa de valor' }) }),
      Object.freeze({ id: 'budget', prompt: 'Qual faixa de valor faz sentido para você?', visitorMessage: 'Até R$ 700 mil.', assistantMessage: 'Você pretende comprar em quanto tempo?', profile: Object.freeze({ budget: 'Até R$ 700 mil', nextAction: 'Entender momento de compra' }) }),
      Object.freeze({ id: 'timing', prompt: 'Você pretende comprar em quanto tempo?', visitorMessage: 'Nos próximos 3 meses.', assistantMessage: 'Ótimo. Organizei seu perfil e deixei o próximo passo pronto no CRM.', profile: Object.freeze({ urgency: 'Alta', temperature: 'Quente', assignee: 'Você', nextAction: 'Entrar em contato' }) }),
    ]),
  }),
  imobiliaria: Object.freeze({
    initialMessage: 'Olá! Vi seu interesse no apartamento de 3 quartos no site.',
    propertyTitle: 'Apartamento · 3 quartos', propertyLocation: 'Centro ou Agronômica',
    completion: 'Lead qualificado e contexto pronto para a equipe continuar no CRM.',
    initialProfile: BASE_PROFILE,
    flow: Object.freeze([
      Object.freeze({ id: 'region', prompt: 'Tem alguma região que você prefere?', visitorMessage: 'Centro ou Agronômica.', assistantMessage: 'Entendi. E qual faixa de valor faz sentido?', profile: Object.freeze({ objective: 'Comprar', region: 'Centro / Agronômica', temperature: 'Em qualificação', nextAction: 'Confirmar faixa de valor' }) }),
      Object.freeze({ id: 'budget', prompt: 'Qual faixa de valor faz sentido?', visitorMessage: 'Até R$ 1,2 milhão.', assistantMessage: 'Você pretende comprar em quanto tempo?', profile: Object.freeze({ budget: 'Até R$ 1,2 mi', nextAction: 'Entender momento de compra' }) }),
      Object.freeze({ id: 'timing', prompt: 'Você pretende comprar em quanto tempo?', visitorMessage: 'Nos próximos 3 meses.', assistantMessage: 'Perfeito. Já organizei essas informações para nossa equipe continuar com você.', profile: Object.freeze({ urgency: 'Alta', temperature: 'Qualificado', assignee: 'Mariana', nextAction: 'Entrar em contato' }) }),
    ]),
  }),
});

export const DEMO_FLOW = DEMO_SCENARIOS.corretor.flow;
const normalizeProfile = (profile) => profile === 'imobiliaria' ? 'imobiliaria' : 'corretor';

export function createDemoSession({ profile = 'corretor' } = {}) {
  const scenario = DEMO_SCENARIOS[normalizeProfile(profile)];
  const flow = scenario.flow;
  let phase = 'idle'; let stepIndex = -1; let answers = {}; let leadProfile = { ...scenario.initialProfile };
  function getSnapshot() {
    return Object.freeze({
      phase, stepIndex,
      currentStep: phase === 'active' ? flow[stepIndex]?.id ?? null : null,
      progress: phase === 'complete' ? 100 : phase === 'active' ? Math.round((stepIndex / flow.length) * 100) : 0,
      answers: Object.freeze({ ...answers }), profile: Object.freeze({ ...leadProfile }), pipeline: phase === 'complete' ? 'qualified' : 'new',
    });
  }
  function start() { if (phase === 'idle') { phase = 'active'; stepIndex = 0; } return getSnapshot(); }
  function send() {
    if (phase !== 'active') return Object.freeze({ accepted: false, snapshot: getSnapshot() });
    const step = flow[stepIndex];
    answers = { ...answers, [step.id]: step.visitorMessage };
    leadProfile = { ...leadProfile, ...step.profile };
    const last = stepIndex === flow.length - 1;
    phase = last ? 'complete' : 'active';
    if (!last) stepIndex += 1;
    return Object.freeze({ accepted: true, stepId: step.id, step, snapshot: getSnapshot() });
  }
  function restart() { phase = 'idle'; stepIndex = -1; answers = {}; leadProfile = { ...scenario.initialProfile }; return getSnapshot(); }
  return Object.freeze({ start, send, restart, getSnapshot });
}

const RESPONSE_DELAY = 480;
const COMPOSER_TYPE_DURATION = 380;
const COMPOSER_PLACEHOLDER = 'Digite uma mensagem...';

function createMessage(documentRef, role, text) {
  const message = documentRef.createElement('p');
  message.dataset.demoMessage = role; message.className = `demo-message demo-message-${role}`; message.textContent = text;
  return message;
}

export function initializeInteractiveDemo({ root, windowRef, track, profile = 'corretor' }) {
  if (!root) return null;
  const documentRef = root.ownerDocument;
  root.hidden = false;
  documentRef.querySelector('[data-demo-fallback]')?.setAttribute('hidden', '');
  const reduceMotion = windowRef.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const startButton = root.querySelector('[data-demo-start]'); const restartButton = root.querySelector('[data-demo-restart]');
  const transcript = root.querySelector('[data-demo-transcript]'); const composer = root.querySelector('[data-demo-composer]');
  const composerText = root.querySelector('[data-demo-composer-text]'); const sendIndicator = root.querySelector('[data-demo-send]');
  const liveRegion = root.querySelector('[data-demo-live]'); const progressBar = root.querySelector('[data-demo-progress-bar]');
  const progressLabel = root.querySelector('[data-demo-progress-label]'); const completion = root.querySelector('[data-demo-complete]');
  const leadCard = root.querySelector('[data-demo-lead-card]'); const leadStatus = root.querySelector('[data-demo-card-status]');
  const newCount = root.querySelector('[data-demo-count="new"]'); const qualifiedCount = root.querySelector('[data-demo-count="qualified"]');
  const tabs = [...root.querySelectorAll('[data-demo-tab]')]; const panels = [...root.querySelectorAll('[data-demo-panel]')];
  let currentProfile = normalizeProfile(profile); let scenario = DEMO_SCENARIOS[currentProfile]; let session = createDemoSession({ profile: currentProfile });
  let pendingTimer = null; const typingTimers = new Set();

  function clearTimers() {
    if (pendingTimer !== null) windowRef.clearTimeout(pendingTimer);
    pendingTimer = null; typingTimers.forEach((timer) => windowRef.clearTimeout(timer)); typingTimers.clear();
  }
  function resetComposer() {
    typingTimers.forEach((timer) => windowRef.clearTimeout(timer)); typingTimers.clear();
    if (composerText) composerText.textContent = COMPOSER_PLACEHOLDER;
    composer?.classList.remove('is-typing', 'is-ready', 'is-sending'); if (composer) composer.disabled = true;
    sendIndicator?.classList.remove('is-active');
  }
  function prepareComposer(text) {
    resetComposer(); if (!composerText || !composer) return;
    const markReady = () => { composer.classList.remove('is-typing'); composer.classList.add('is-ready'); composer.disabled = false; sendIndicator?.classList.add('is-active'); };
    if (reduceMotion) { composerText.textContent = text; markReady(); return; }
    composer.classList.add('is-typing'); composerText.textContent = '';
    const interval = Math.max(12, Math.floor(COMPOSER_TYPE_DURATION / Math.max(text.length, 1)));
    [...text].forEach((character, index) => {
      const timer = windowRef.setTimeout(() => { typingTimers.delete(timer); composerText.textContent += character; if (index === text.length - 1) markReady(); }, interval * (index + 1));
      typingTimers.add(timer);
    });
  }
  function announce(message) { if (liveRegion) liveRegion.textContent = message; }
  function scrollLatest() { transcript.scrollTop = transcript.scrollHeight; }
  function activateTab(tabId, { focus = false } = {}) {
    tabs.forEach((tab) => { const selected = tab.dataset.demoTab === tabId; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; if (selected && focus) tab.focus(); });
    panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.demoPanel === tabId));
  }
  function updateProgress(snapshot) {
    if (progressBar) progressBar.style.width = `${snapshot.progress}%`;
    if (!progressLabel) return;
    progressLabel.textContent = snapshot.phase === 'idle' ? 'Pronta para começar' : snapshot.phase === 'complete' ? 'Lead qualificado' : `Etapa ${snapshot.stepIndex + 1} de ${scenario.flow.length}`;
  }
  function updateProfile(snapshot, updatedFields = []) {
    root.querySelectorAll('[data-demo-field]').forEach((field) => { const key = field.dataset.demoField; field.textContent = snapshot.profile[key]; field.classList.toggle('is-updated', updatedFields.includes(key)); });
  }
  function updatePipeline(qualified) { if (newCount) newCount.textContent = qualified ? '0' : '1'; if (qualifiedCount) qualifiedCount.textContent = qualified ? '1' : '0'; if (leadStatus) leadStatus.textContent = qualified ? 'Qualificado' : 'Novo'; }
  function completeJourney(result) {
    const snapshot = result.snapshot; root.dataset.demoState = 'complete'; completion.hidden = false; restartButton.hidden = false;
    root.querySelector('[data-demo-column="qualified"]')?.append(leadCard); leadCard?.classList.add('is-qualified'); updatePipeline(true); activateTab('crm'); announce(scenario.completion);
    track('interactive_demo_complete', { profile: currentProfile, objective: snapshot.profile.objective, region: snapshot.profile.region, budget_range: snapshot.profile.budget, urgency: snapshot.profile.urgency, temperature: snapshot.profile.temperature, assignee: snapshot.profile.assignee, next_action: snapshot.profile.nextAction });
  }
  function finishResponse(result) {
    root.querySelector('[data-demo-typing]')?.remove(); transcript.append(createMessage(documentRef, 'assistant', result.step.assistantMessage)); scrollLatest();
    updateProfile(result.snapshot, Object.keys(result.step.profile)); updateProgress(result.snapshot); root.dataset.demoTransitioning = 'false'; announce(result.step.assistantMessage);
    if (result.snapshot.phase === 'complete') { completeJourney(result); return; }
    prepareComposer(scenario.flow[result.snapshot.stepIndex].visitorMessage);
  }
  function sendCurrentResponse() {
    if (root.dataset.demoTransitioning === 'true' || composer?.disabled) return;
    const result = session.send(); if (!result.accepted) return;
    root.dataset.demoTransitioning = 'true'; composer.disabled = true; composer.classList.add('is-sending');
    track('interactive_demo_step', { profile: currentProfile, step: result.stepId });
    transcript.append(createMessage(documentRef, 'visitor', result.step.visitorMessage)); scrollLatest(); resetComposer();
    if (reduceMotion) { finishResponse(result); return; }
    const typing = documentRef.createElement('div'); typing.dataset.demoTyping = ''; typing.className = 'demo-typing'; typing.setAttribute('aria-label', 'Margot está digitando'); typing.innerHTML = '<span></span><span></span><span></span>';
    transcript.append(typing); scrollLatest(); pendingTimer = windowRef.setTimeout(() => { pendingTimer = null; finishResponse(result); }, RESPONSE_DELAY);
  }
  function applyScenarioCopy() {
    const property = root.querySelector('.demo-property-context');
    if (property) { property.querySelector('strong').textContent = scenario.propertyTitle; property.querySelector('small').textContent = scenario.propertyLocation; }
    const completionText = completion?.querySelector('p'); if (completionText) completionText.textContent = scenario.completion;
  }
  function renderIdle() {
    clearTimers(); resetComposer(); const snapshot = session.restart(); root.dataset.demoState = 'idle'; root.dataset.demoTransitioning = 'false';
    startButton.hidden = false; restartButton.hidden = true; completion.hidden = true; transcript.replaceChildren(createMessage(documentRef, 'assistant', scenario.initialMessage));
    root.querySelector('[data-demo-column="new"]')?.append(leadCard); leadCard?.classList.remove('is-qualified'); updatePipeline(false); updateProfile(snapshot); updateProgress(snapshot); activateTab('chat'); applyScenarioCopy(); announce('Simulação pronta para começar.');
  }
  function startJourney() {
    const snapshot = session.start(); if (snapshot.phase !== 'active') return;
    root.dataset.demoState = 'active'; startButton.hidden = true; restartButton.hidden = false; transcript.append(createMessage(documentRef, 'assistant', scenario.flow[0].prompt)); scrollLatest();
    updateProgress(snapshot); prepareComposer(scenario.flow[0].visitorMessage); announce(scenario.flow[0].prompt);
    track('interactive_demo_start', { profile: currentProfile, scenario: currentProfile === 'imobiliaria' ? 'team_apartment' : 'apartment_centro' });
  }
  function setProfile(nextProfile) { currentProfile = normalizeProfile(nextProfile); scenario = DEMO_SCENARIOS[currentProfile]; session = createDemoSession({ profile: currentProfile }); renderIdle(); }

  startButton?.addEventListener('click', startJourney); composer?.addEventListener('click', sendCurrentResponse);
  restartButton?.addEventListener('click', () => { const fromPhase = session.getSnapshot().phase; renderIdle(); track('interactive_demo_restart', { profile: currentProfile, from_phase: fromPhase }); });
  tabs.forEach((tab, index) => { tab.addEventListener('click', () => activateTab(tab.dataset.demoTab)); tab.addEventListener('keydown', (event) => { if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return; event.preventDefault(); const offset = event.key === 'ArrowRight' ? 1 : -1; activateTab(tabs[(index + offset + tabs.length) % tabs.length].dataset.demoTab, { focus: true }); }); });
  renderIdle();
  return Object.freeze({ get session() { return session; }, activateTab, restart: renderIdle, setProfile });
}
