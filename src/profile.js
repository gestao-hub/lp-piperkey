export const PROFILES = Object.freeze({
  corretor: 'corretor',
  imobiliaria: 'imobiliaria',
});

const REALTOR_FAQ = Object.freeze([
  ['O PiperKey atende leads do WhatsApp automaticamente?', 'Sim. A Margot pode iniciar o atendimento, entender o interesse do lead e registrar o contexto no CRM. Assim você assume a conversa sabendo o que a pessoa procura e o que precisa acontecer depois.'],
  ['A inteligência artificial substitui o corretor no atendimento?', 'Não. A proposta é tirar da sua frente a parte repetitiva do primeiro atendimento. Quando a conversa precisa de negociação, orientação ou decisão comercial, o profissional assume com o histórico já organizado.'],
  ['O PiperKey serve para quem trabalha sozinho ou tem poucos leads?', 'Sim. Organizar o atendimento desde o começo evita que planilhas, mensagens soltas e memória virem o processo da operação. O PiperKey também acompanha equipes que já dividem atendimento e vendas.'],
  ['Consigo organizar leads, conversas e próximos passos no mesmo CRM?', 'Sim. O histórico de atendimento alimenta o CRM para que interesse, região, momento do cliente e próxima ação fiquem visíveis para quem precisa continuar a venda.'],
  ['O PiperKey também ajuda com imóveis, portais e anúncios?', 'O PiperKey reúne recursos para imóveis, site próprio, integrações e acompanhamento de campanhas. A ideia é conectar a origem do lead com o atendimento e com o que acontece depois no comercial.'],
]);

const AGENCY_FAQ = Object.freeze([
  ['Posso ter mais de uma pessoa atendendo no PiperKey?', 'Sim. O histórico e as informações do lead ficam centralizados para que diferentes pessoas continuem o atendimento com o mesmo contexto.'],
  ['Consigo distribuir os leads entre a equipe?', 'O PiperKey organiza os leads no funil e dá visibilidade sobre quem precisa continuar cada oportunidade. A configuração da operação é alinhada durante a implantação.'],
  ['O histórico continua disponível quando outro corretor assume?', 'Sim. Interesse, região, orçamento, conversas e próximos passos permanecem registrados para evitar que o cliente precise repetir tudo.'],
  ['A Margot pode atender antes de o lead chegar ao corretor?', 'Sim. A Margot faz o primeiro atendimento, entende o que o cliente procura e registra o contexto para a equipe assumir no momento certo.'],
  ['Consigo acompanhar oportunidades que ainda precisam de retorno?', 'Sim. O funil e os próximos passos ajudam a equipe e a gestão a enxergar o que está em andamento e o que ainda precisa de atenção.'],
]);

export const PROFILE_CONTENT = Object.freeze({
  corretor: Object.freeze({
    title: 'PiperKey Solo | Atendimento com IA e CRM para o mercado imobiliário',
    description: 'PiperKey Solo organiza atendimento, qualificação de leads e CRM para profissionais do mercado imobiliário acompanharem cada oportunidade do primeiro contato ao próximo passo.',
    hero: Object.freeze({
      title: 'Atenda mais, qualifique melhor e <em>venda todos os dias.</em>',
      subtitle: 'A Margot conversa, entende o que a pessoa procura e registra tudo no PiperKey. Quando vale assumir a conversa, você já sabe o contexto e o próximo passo.',
      notes: ['Responde enquanto você está ocupado', 'Entende o que o cliente procura', 'Deixa o contexto pronto no CRM'],
      phone: '<p class="phone-message phone-message-margot">Olá! Vi seu interesse no apartamento de 2 quartos no Centro. É para morar ou investir?</p><p class="phone-message phone-message-lead">Quero comprar para morar.</p><p class="phone-message phone-message-margot">Perfeito. Qual faixa de valor faz sentido para você?</p><div class="phone-quick-replies" aria-hidden="true"><span>Até R$ 500 mil</span><span>R$ 500 a 800 mil</span><span>Acima de R$ 800 mil</span></div>',
    }),
    problem: Object.freeze({
      title: 'O cliente não sabe que você está ocupado.<br> Ele só sabe que ninguém respondeu.',
      intro: 'Toda vez que seu celular fica sem resposta, alguém está vendendo no seu lugar.<br><br>Enquanto você visita um imóvel, negocia ou dirige, a Margot continua atendendo, qualificando e mantendo cada oportunidade viva.',
      note: 'O problema não é só responder rápido. É responder, guardar contexto e saber o que fazer depois sem depender da memória.',
      pains: [
        ['O lead da meia-noite', 'Alguém pergunta sobre o imóvel às 23h. Às 8h, quando você responde, já falou com outro corretor.'],
        ['A visita que rouba sua atenção', 'Enquanto você mostra um imóvel, outro interessado fica esperando e esfria antes do seu retorno.'],
        ['O histórico que se perde', 'O contexto fica no WhatsApp, na memória ou numa planilha que não acompanha o ritmo da operação.'],
      ],
    }),
    audience: Object.freeze({
      title: 'O PiperKey faz sentido quando atendimento e venda disputam a sua atenção.',
      intro: 'Não importa o tamanho da sua operação. O ponto é ter leads chegando, conversas acontecendo e pouco espaço para perder contexto no caminho.',
      items: [
        ['Você toca a operação de ponta a ponta', 'Você atende, visita imóveis, negocia e ainda precisa acompanhar cada novo contato sem ficar preso ao celular.', ['Atendimento mesmo durante visitas', 'Leads qualificados antes de você assumir', 'CRM sem depender de planilha ou memória']],
        ['Você já divide a operação com outras pessoas', 'Mais de uma pessoa participa da venda e todos precisam enxergar o mesmo histórico, a prioridade e o próximo passo.', ['Equipe trabalhando no mesmo contexto', 'Funil e distribuição mais previsíveis', 'Gestão sem perder a agilidade da operação']],
      ],
    }),
    resources: Object.freeze({
      title: 'O atendimento não termina quando a Margot responde.',
      intro: 'O que a conversa descobre continua no CRM, nos imóveis e nas próximas ações da sua operação.',
      kicker: 'Seu atendimento, sempre ligado',
      featureTitle: 'Margot, sua assistente de atendimento',
      featureDescription: 'Responde, qualifica e organiza cada lead automaticamente, 24 horas por dia, com contexto e continuidade.',
      capabilities: [
        ['Site próprio', 'Sua vitrine, com sua marca e seus imóveis.'],
        ['CRM', 'Funil e histórico centralizados, sem conversa perdida.'],
        ['Integração com portais', 'Cadastre uma vez e publique em ZAP, VivaReal e OLX.'],
        ['Dashboard de anúncios Meta', 'CAC, CPL e ROI traduzidos para decisões simples.'],
        ['Radar de Matches', 'Cruze novos imóveis com leads frios da sua base.'],
      ],
    }),
    faq: REALTOR_FAQ,
    finalCta: Object.freeze({
      eyebrow: 'Seu próximo lead não vai esperar.',
      title: 'Você não precisa estar disponível o tempo todo para continuar atendendo bem.',
      text: 'Agende 15 minutos e veja a Margot funcionando em uma operação parecida com a sua.',
      button: 'Falar no WhatsApp',
    }),
  }),
  imobiliaria: Object.freeze({
    title: 'PiperKey Solo | Atendimento e CRM para equipes imobiliárias',
    description: 'PiperKey Solo conecta atendimento, contexto e CRM para equipes imobiliárias continuarem cada oportunidade sem perder informação ou próximo passo.',
    hero: Object.freeze({
      title: 'Sua equipe atende melhor quando todo mundo tem o mesmo contexto.',
      subtitle: 'A Margot faz o primeiro atendimento, entende o que o cliente procura e registra tudo no PiperKey. Sua equipe continua a conversa sabendo quem é o lead, o que ele quer e qual é o próximo passo.',
      notes: ['Responde antes do lead esfriar', 'Registra o que o cliente procura', 'Deixa sua equipe pronta para continuar'],
      phone: '<p class="phone-message phone-message-lead">Oi, vi um apartamento de 3 quartos no site.</p><p class="phone-message phone-message-margot">Claro. Tem alguma região que você prefere?</p><p class="phone-message phone-message-lead">Centro ou Agronômica.</p><p class="phone-message phone-message-margot">Perfeito. Já organizei essas informações para nossa equipe continuar com você.</p>',
    }),
    problem: Object.freeze({
      title: 'Um lead pode passar por várias pessoas.<br> O contexto não pode se perder no caminho.',
      intro: 'Quando atendimento, imóveis e negociação passam por pessoas diferentes, uma informação perdida vira atraso para o cliente.<br><br>O PiperKey mantém histórico, responsável e próximo passo visíveis para a equipe continuar sem começar do zero.',
      note: 'Coordenação não é só distribuir leads. É saber quem está atendendo, o que já foi combinado e qual oportunidade ainda precisa de retorno.',
      pains: [
        ['O atendimento sem dono', 'O lead chega e ninguém sabe com clareza quem deve assumir.'],
        ['O cliente que repete tudo', 'Ele já explicou o que procura, mas a próxima pessoa começa a conversa do zero.'],
        ['A oportunidade que fica parada', 'A gestão descobre tarde demais que um lead importante ficou sem retorno.'],
      ],
    }),
    audience: Object.freeze({
      title: 'Sua venda já envolve mais de uma pessoa.',
      intro: 'Atendimento, imóveis e negociação passam por diferentes pessoas. O PiperKey mantém o histórico e o próximo passo visíveis para quem precisa continuar.',
      items: [
        ['A equipe precisa continuar sem perder contexto', 'Cada pessoa enxerga o que o lead procura, o que já aconteceu e onde retomar a conversa.', ['Equipe trabalhando com o mesmo contexto', 'Histórico centralizado', 'Distribuição mais organizada']],
        ['A gestão precisa enxergar o que está parado', 'O funil deixa prioridades e próximos passos visíveis antes que uma oportunidade esfrie.', ['Menos leads esquecidos', 'Gestão enxergando o que está parado']],
      ],
    }),
    resources: Object.freeze({
      title: 'Uma operação conectada para sua equipe continuar de onde parou.',
      intro: 'Atendimento, CRM, imóveis e próximos passos trabalham juntos para que contexto e responsabilidade não se percam.',
      kicker: 'Primeiro atendimento organizado',
      featureTitle: 'Margot prepara o contexto para sua equipe',
      featureDescription: 'Atende o lead, entende o interesse e registra as informações para a pessoa responsável continuar a conversa.',
      capabilities: [
        ['CRM e funil', 'Leads, responsáveis e próximos passos visíveis para a equipe.'],
        ['Continuidade do atendimento', 'Outra pessoa assume sem pedir que o cliente repita tudo.'],
        ['Histórico centralizado', 'Conversas e informações permanecem disponíveis no mesmo contexto.'],
        ['Imóveis e matches', 'Conecte oportunidades aos imóveis adequados para cada perfil.'],
        ['Portais e campanhas', 'Acompanhe a origem do lead até o atendimento comercial.'],
      ],
    }),
    faq: AGENCY_FAQ,
    finalCta: Object.freeze({
      eyebrow: 'Contexto para atender. Visibilidade para gerir.',
      title: 'Sua equipe pode crescer sem transformar o atendimento em bagunça.',
      text: 'Centralize leads, histórico e próximos passos para que cada pessoa saiba exatamente onde continuar.',
      button: 'Quero organizar meu atendimento comercial',
    }),
  }),
});

export function resolveProfile(search = '') {
  const requested = new URLSearchParams(search).get('perfil');
  return requested === PROFILES.corretor ? PROFILES.corretor : PROFILES.imobiliaria;
}

function setText(root, selector, value) {
  const element = root.querySelector(selector);
  if (element) element.textContent = value;
}

function setHtml(root, selector, value) {
  const element = root.querySelector(selector);
  if (element) element.innerHTML = value;
}

function updateFaq(root, faq) {
  const items = [...root.querySelectorAll('.faq-item')];
  items.forEach((item, index) => {
    const [question, answer] = faq[index];
    setText(item, '[data-faq-trigger] > span:first-child', question);
    setText(item, '[data-faq-panel] > p', answer);
  });

  const schema = root.querySelector('[data-faq-schema]');
  if (schema) {
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    });
  }
}

function updateList(root, selector, values) {
  const list = root.querySelector(selector);
  if (!list) return;
  list.replaceChildren(...values.map((value) => {
    const item = root.createElement('li');
    item.textContent = value;
    return item;
  }));
}

export function applyProfileContent({ root, profile }) {
  const content = PROFILE_CONTENT[profile] ?? PROFILE_CONTENT.imobiliaria;
  root.documentElement.dataset.profile = profile;
  root.title = content.title;
  root.querySelector('meta[name="description"]')?.setAttribute('content', content.description);

  setHtml(root, '.hero-copy h1', content.hero.title);
  setText(root, '.hero-subtitle', content.hero.subtitle);
  [...root.querySelectorAll('.hero-phone-note')].forEach((note, index) => { note.textContent = content.hero.notes[index]; });
  setHtml(root, '.phone-chat-body', content.hero.phone);

  setHtml(root, '#problema .section-heading h2', content.problem.title);
  setHtml(root, '#problema .section-heading > p', content.problem.intro);
  setText(root, '#problema .operation-note p', content.problem.note);
  [...root.querySelectorAll('#problema .pain-item')].forEach((item, index) => {
    setText(item, 'h3', content.problem.pains[index][0]);
    setText(item, 'p', content.problem.pains[index][1]);
  });

  setText(root, '#para-quem .audience-heading h2', content.audience.title);
  setText(root, '#para-quem .audience-heading > p', content.audience.intro);
  [...root.querySelectorAll('#para-quem .audience-item')].forEach((item, index) => {
    const [title, text, benefits] = content.audience.items[index];
    setText(item, 'h3', title);
    setText(item, 'p', text);
    updateList(root, `#para-quem .audience-item:nth-child(${index + 1}) ul`, benefits);
  });

  setText(root, '#solucao .solution-heading h2', content.resources.title);
  setText(root, '#solucao .solution-heading > p', content.resources.intro);
  setText(root, '#solucao .feature-kicker', content.resources.kicker);
  setText(root, '#solucao .margot-feature h3', content.resources.featureTitle);
  setText(root, '#solucao .margot-feature p:not(.feature-kicker)', content.resources.featureDescription);
  [...root.querySelectorAll('#solucao .capability')].forEach((item, index) => {
    setText(item, 'h3', content.resources.capabilities[index][0]);
    setText(item, 'p', content.resources.capabilities[index][1]);
  });

  updateFaq(root, content.faq);
  setText(root, '[data-final-cta] .eyebrow', content.finalCta.eyebrow);
  setText(root, '[data-final-cta] h2', content.finalCta.title);
  setText(root, '[data-final-cta] .final-cta-inner > p', content.finalCta.text);
  setText(root, '[data-final-cta-label]', content.finalCta.button);

  root.querySelectorAll('[data-profile-option]').forEach((button) => {
    const selected = button.dataset.profileOption === profile;
    button.setAttribute('aria-pressed', String(selected));
    button.classList.toggle('is-active', selected);
  });
}

export function initializeProfileSelector({ root, windowRef, track }) {
  let currentProfile = resolveProfile(windowRef.location.search);
  const subscribers = new Set();

  function apply(profile, { updateUrl = false, emit = false } = {}) {
    currentProfile = profile === PROFILES.corretor ? PROFILES.corretor : PROFILES.imobiliaria;
    applyProfileContent({ root, profile: currentProfile });

    if (updateUrl) {
      const url = new URL(windowRef.location.href);
      url.searchParams.set('perfil', currentProfile);
      windowRef.history.pushState({ profile: currentProfile }, '', url);
    }
    if (emit) track('profile_selected', { profile: currentProfile });
    subscribers.forEach((subscriber) => subscriber(currentProfile));
    return currentProfile;
  }

  root.querySelectorAll('[data-profile-option]').forEach((button) => {
    button.addEventListener('click', () => apply(button.dataset.profileOption, { updateUrl: true, emit: true }));
  });
  windowRef.addEventListener('popstate', () => apply(resolveProfile(windowRef.location.search)));
  apply(currentProfile);

  return Object.freeze({
    getProfile: () => currentProfile,
    setProfile: (profile) => apply(profile, { updateUrl: true, emit: true }),
    subscribe(callback) {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
  });
}
