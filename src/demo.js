const INITIAL_PROFILE = Object.freeze({
  objective: '—',
  region: 'Centro',
  budget: '—',
  urgency: '—',
  temperature: 'Novo',
  nextAction: 'Aguardando qualificação',
});

export const DEMO_FLOW = Object.freeze([
  Object.freeze({
    id: 'goal',
    prompt: 'É para morar ou investir?',
    options: Object.freeze([
      Object.freeze({
        id: 'live',
        label: 'Morar',
        visitorMessage: 'Quero comprar para morar.',
        assistantMessage: 'Perfeito. E qual faixa de valor faz sentido para você?',
        profile: Object.freeze({
          objective: 'Morar',
          temperature: 'Em qualificação',
          nextAction: 'Confirmar faixa de valor',
        }),
      }),
      Object.freeze({
        id: 'invest',
        label: 'Investir',
        visitorMessage: 'Estou procurando para investir.',
        assistantMessage: 'Ótimo. E qual faixa de investimento você considera?',
        profile: Object.freeze({
          objective: 'Investir',
          temperature: 'Em qualificação',
          nextAction: 'Confirmar faixa de valor',
        }),
      }),
    ]),
  }),
  Object.freeze({
    id: 'budget',
    prompt: 'Qual faixa de valor você procura?',
    options: Object.freeze([
      Object.freeze({
        id: 'up-to-450',
        label: 'Faixa inicial',
        visitorMessage: 'Estou buscando uma faixa inicial.',
        assistantMessage: 'Entendi. Você quer avançar agora ou ainda está pesquisando?',
        profile: Object.freeze({ budget: 'Faixa inicial', nextAction: 'Entender momento de compra' }),
      }),
      Object.freeze({
        id: '450-to-700',
        label: 'Faixa intermediária',
        visitorMessage: 'Estou buscando uma faixa intermediária.',
        assistantMessage: 'Perfeito. Você quer avançar agora ou ainda está pesquisando?',
        profile: Object.freeze({ budget: 'Faixa intermediária', nextAction: 'Entender momento de compra' }),
      }),
      Object.freeze({
        id: 'above-700',
        label: 'Faixa ampliada',
        visitorMessage: 'Estou buscando uma faixa ampliada.',
        assistantMessage: 'Certo. Você quer avançar agora ou ainda está pesquisando?',
        profile: Object.freeze({ budget: 'Faixa ampliada', nextAction: 'Entender momento de compra' }),
      }),
    ]),
  }),
  Object.freeze({
    id: 'timing',
    prompt: 'Qual é o seu momento?',
    options: Object.freeze([
      Object.freeze({
        id: 'visit-week',
        label: 'Quero visitar esta semana',
        visitorMessage: 'Quero visitar esta semana.',
        assistantMessage: 'Ótimo! Organizei seu perfil e sinalizei a visita como próxima ação.',
        profile: Object.freeze({
          urgency: 'Alta',
          temperature: 'Quente',
          nextAction: 'Sugerir horários de visita',
        }),
      }),
      Object.freeze({
        id: 'researching',
        label: 'Ainda estou pesquisando',
        visitorMessage: 'Ainda estou pesquisando.',
        assistantMessage: 'Sem problema. Organizei seu perfil para receber opções compatíveis no momento certo.',
        profile: Object.freeze({
          urgency: 'Média',
          temperature: 'Morno',
          nextAction: 'Enviar opções semelhantes',
        }),
      }),
    ]),
  }),
]);

export function createDemoSession() {
  let phase = 'idle';
  let stepIndex = -1;
  let answers = {};
  let profile = { ...INITIAL_PROFILE };

  function getSnapshot() {
    const currentStep = phase === 'active' ? DEMO_FLOW[stepIndex]?.id ?? null : null;
    const progress = phase === 'complete' ? 100 : phase === 'active' ? Math.round((stepIndex / DEMO_FLOW.length) * 100) : 0;

    return Object.freeze({
      phase,
      stepIndex,
      currentStep,
      progress,
      answers: Object.freeze({ ...answers }),
      profile: Object.freeze({ ...profile }),
      pipeline: phase === 'complete' ? 'qualified' : 'new',
    });
  }

  function start() {
    if (phase !== 'idle') return getSnapshot();
    phase = 'active';
    stepIndex = 0;
    return getSnapshot();
  }

  function select(optionId) {
    if (phase !== 'active') return Object.freeze({ accepted: false, snapshot: getSnapshot() });

    const step = DEMO_FLOW[stepIndex];
    const option = step.options.find((candidate) => candidate.id === optionId);
    if (!option) return Object.freeze({ accepted: false, snapshot: getSnapshot() });

    answers = { ...answers, [step.id]: option.id };
    profile = { ...profile, ...option.profile };
    const isLastStep = stepIndex === DEMO_FLOW.length - 1;

    if (isLastStep) {
      phase = 'complete';
    } else {
      stepIndex += 1;
    }

    return Object.freeze({
      accepted: true,
      stepId: step.id,
      option,
      snapshot: getSnapshot(),
    });
  }

  function restart() {
    phase = 'idle';
    stepIndex = -1;
    answers = {};
    profile = { ...INITIAL_PROFILE };
    return getSnapshot();
  }

  return Object.freeze({ start, select, restart, getSnapshot });
}

const INITIAL_MESSAGE = 'Olá! Vi que você se interessou pelo apartamento de 2 quartos no Centro.';
const RESPONSE_DELAY = 560;
const COMPOSER_TYPE_DURATION = 420;
const COMPOSER_PLACEHOLDER = 'Digite uma mensagem...';

function createMessage(documentRef, role, text) {
  const message = documentRef.createElement('p');
  message.dataset.demoMessage = role;
  message.className = `demo-message demo-message-${role}`;
  message.textContent = text;
  return message;
}

export function initializeInteractiveDemo({ root, windowRef, track }) {
  if (!root) return null;

  const documentRef = root.ownerDocument;
  root.hidden = false;
  documentRef.querySelector('[data-demo-fallback]')?.setAttribute('hidden', '');
  const session = createDemoSession();
  const reduceMotion = windowRef.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const startButton = root.querySelector('[data-demo-start]');
  const restartButton = root.querySelector('[data-demo-restart]');
  const transcript = root.querySelector('[data-demo-transcript]');
  const options = root.querySelector('[data-demo-options]');
  const composer = root.querySelector('[data-demo-composer]');
  const composerText = root.querySelector('[data-demo-composer-text]');
  const sendIndicator = root.querySelector('[data-demo-send]');
  const liveRegion = root.querySelector('[data-demo-live]');
  const progressBar = root.querySelector('[data-demo-progress-bar]');
  const progressLabel = root.querySelector('[data-demo-progress-label]');
  const completion = root.querySelector('[data-demo-complete]');
  const leadCard = root.querySelector('[data-demo-lead-card]');
  const leadStatus = root.querySelector('[data-demo-card-status]');
  const newCount = root.querySelector('[data-demo-count="new"]');
  const qualifiedCount = root.querySelector('[data-demo-count="qualified"]');
  const tabs = [...root.querySelectorAll('[data-demo-tab]')];
  const panels = [...root.querySelectorAll('[data-demo-panel]')];
  let pendingTimer = null;
  const typingTimers = new Set();

  function clearTypingTimers() {
    typingTimers.forEach((timer) => windowRef.clearTimeout(timer));
    typingTimers.clear();
  }

  function resetComposer() {
    clearTypingTimers();
    if (composerText) composerText.textContent = COMPOSER_PLACEHOLDER;
    composer?.classList.remove('is-typing', 'is-ready', 'is-sending');
    sendIndicator?.classList.remove('is-active');
  }

  function typeIntoComposer(text, onComplete) {
    if (!composerText || reduceMotion) {
      if (composerText) composerText.textContent = text;
      onComplete();
      return;
    }

    clearTypingTimers();
    composer.classList.add('is-typing');
    composerText.textContent = '';
    const interval = Math.max(14, Math.floor(COMPOSER_TYPE_DURATION / Math.max(text.length, 1)));

    [...text].forEach((char, index) => {
      const timer = windowRef.setTimeout(() => {
        typingTimers.delete(timer);
        composerText.textContent += char;
        if (index !== text.length - 1) return;
        composer.classList.remove('is-typing');
        composer.classList.add('is-ready');
        sendIndicator?.classList.add('is-active');
        const sendTimer = windowRef.setTimeout(() => {
          typingTimers.delete(sendTimer);
          composer.classList.add('is-sending');
          onComplete();
        }, 120);
        typingTimers.add(sendTimer);
      }, interval * (index + 1));
      typingTimers.add(timer);
    });
  }

  function announce(message) {
    if (liveRegion) liveRegion.textContent = message;
  }

  function scrollTranscriptToLatest() {
    transcript.scrollTop = transcript.scrollHeight;
  }

  function activateTab(tabId, { focus = false } = {}) {
    tabs.forEach((tab) => {
      const selected = tab.dataset.demoTab === tabId;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.demoPanel === tabId));
  }

  function updateProgress(snapshot) {
    if (progressBar) progressBar.style.width = `${snapshot.progress}%`;
    if (!progressLabel) return;
    if (snapshot.phase === 'idle') progressLabel.textContent = 'Pronta para começar';
    if (snapshot.phase === 'active') progressLabel.textContent = `Etapa ${snapshot.stepIndex + 1} de ${DEMO_FLOW.length}`;
    if (snapshot.phase === 'complete') progressLabel.textContent = 'Lead qualificado';
  }

  function updateProfile(snapshot, updatedFields = []) {
    root.querySelectorAll('[data-demo-field]').forEach((field) => {
      const key = field.dataset.demoField;
      field.textContent = snapshot.profile[key];
      field.classList.remove('is-updated');
      if (updatedFields.includes(key)) field.classList.add('is-updated');
    });
  }

  function updatePipeline(isQualified) {
    if (newCount) newCount.textContent = isQualified ? '0' : '1';
    if (qualifiedCount) qualifiedCount.textContent = isQualified ? '1' : '0';
    if (leadStatus) leadStatus.textContent = isQualified ? 'Qualificado' : 'Novo';
  }

  function renderOptions(snapshot) {
    options.replaceChildren();
    if (snapshot.phase !== 'active') return;

    const step = DEMO_FLOW[snapshot.stepIndex];
    step.options.forEach((option) => {
      const button = documentRef.createElement('button');
      button.type = 'button';
      button.dataset.demoOption = option.id;
      button.className = 'demo-option';
      button.textContent = option.label;
      button.addEventListener('click', () => selectOption(option.id));
      options.append(button);
    });
  }

  function completeJourney(result) {
    const snapshot = result.snapshot;
    root.dataset.demoState = 'complete';
    completion.hidden = false;
    restartButton.hidden = false;
    options.replaceChildren();
    root.querySelector('[data-demo-column="qualified"]')?.append(leadCard);
    leadCard?.classList.add('is-qualified');
    updatePipeline(true);
    activateTab('crm');
    announce('Lead qualificado e pronto no CRM.');
    track('interactive_demo_complete', {
      goal: snapshot.answers.goal,
      budget: snapshot.answers.budget,
      timing: snapshot.answers.timing,
      objective: snapshot.profile.objective,
      region: snapshot.profile.region,
      budget_range: snapshot.profile.budget,
      urgency: snapshot.profile.urgency,
      temperature: snapshot.profile.temperature,
      next_action: snapshot.profile.nextAction,
    });
  }

  function finishResponse(result) {
    const snapshot = result.snapshot;
    root.querySelector('[data-demo-typing]')?.remove();
    transcript.append(createMessage(documentRef, 'assistant', result.option.assistantMessage));
    scrollTranscriptToLatest();
    updateProfile(snapshot, Object.keys(result.option.profile));
    updateProgress(snapshot);
    root.dataset.demoTransitioning = 'false';

    if (snapshot.phase === 'complete') {
      completeJourney(result);
      return;
    }

    renderOptions(snapshot);
    const nextStep = DEMO_FLOW[snapshot.stepIndex];
    announce(nextStep.prompt);
    options.querySelector('button')?.focus();
  }

  function selectOption(optionId) {
    if (root.dataset.demoTransitioning === 'true') return;
    const result = session.select(optionId);
    if (!result.accepted) return;

    root.dataset.demoTransitioning = 'true';
    options.querySelectorAll('button').forEach((button) => {
      button.disabled = true;
    });
    track('interactive_demo_step', { step: result.stepId, option: result.option.id });

    const sendVisitorMessage = () => {
      transcript.append(createMessage(documentRef, 'visitor', result.option.visitorMessage));
      scrollTranscriptToLatest();
      resetComposer();

      if (reduceMotion) {
        finishResponse(result);
        return;
      }

      const typing = documentRef.createElement('div');
      typing.dataset.demoTyping = '';
      typing.className = 'demo-typing';
      typing.setAttribute('aria-label', 'Margot está digitando');
      typing.innerHTML = '<span></span><span></span><span></span>';
      transcript.append(typing);
      scrollTranscriptToLatest();
      pendingTimer = windowRef.setTimeout(() => {
        pendingTimer = null;
        finishResponse(result);
      }, RESPONSE_DELAY);
    };

    typeIntoComposer(result.option.visitorMessage, sendVisitorMessage);
  }

  function renderIdle() {
    if (pendingTimer !== null) {
      windowRef.clearTimeout(pendingTimer);
      pendingTimer = null;
    }
    resetComposer();
    const snapshot = session.restart();
    root.dataset.demoState = 'idle';
    root.dataset.demoTransitioning = 'false';
    startButton.hidden = false;
    restartButton.hidden = true;
    completion.hidden = true;
    options.replaceChildren();
    transcript.replaceChildren(createMessage(documentRef, 'assistant', INITIAL_MESSAGE));
    root.querySelector('[data-demo-column="new"]')?.append(leadCard);
    leadCard?.classList.remove('is-qualified');
    updatePipeline(false);
    updateProfile(snapshot);
    updateProgress(snapshot);
    activateTab('chat');
    announce('Simulação pronta para começar.');
  }

  function startJourney() {
    const snapshot = session.start();
    if (snapshot.phase !== 'active') return;
    root.dataset.demoState = 'active';
    startButton.hidden = true;
    restartButton.hidden = false;
    transcript.append(createMessage(documentRef, 'assistant', DEMO_FLOW[0].prompt));
    scrollTranscriptToLatest();
    updateProgress(snapshot);
    renderOptions(snapshot);
    announce(DEMO_FLOW[0].prompt);
    track('interactive_demo_start', { scenario: 'apartment_centro' });
    options.querySelector('button')?.focus();
  }

  startButton?.addEventListener('click', startJourney);
  restartButton?.addEventListener('click', () => {
    const fromPhase = session.getSnapshot().phase;
    renderIdle();
    track('interactive_demo_restart', { from_phase: fromPhase });
  });

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.demoTab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const offset = event.key === 'ArrowRight' ? 1 : -1;
      const target = tabs[(index + offset + tabs.length) % tabs.length];
      activateTab(target.dataset.demoTab, { focus: true });
    });
  });

  renderIdle();
  return Object.freeze({ session, activateTab, restart: renderIdle });
}
