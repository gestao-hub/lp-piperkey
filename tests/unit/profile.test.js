import { describe, expect, test, vi } from 'vitest';
import { applyProfileContent, initializeProfileSelector, resolveProfile } from '../../src/profile.js';

function renderProfileFixture() {
  document.head.innerHTML = '<meta name="description" content="">';
  document.body.innerHTML = `
    <button data-profile-option="corretor"></button><button data-profile-option="imobiliaria"></button>
    <div class="hero-copy"><h1></h1></div><p class="hero-subtitle"></p>
    <span class="hero-phone-note"></span><span class="hero-phone-note"></span><span class="hero-phone-note"></span><div class="phone-chat-body"></div>
    <section id="problema"><div class="section-heading"><h2></h2><p></p></div><div class="operation-note"><p></p></div>${'<article class="pain-item"><h3></h3><p></p></article>'.repeat(3)}</section>
    <section id="para-quem"><div class="audience-heading"><h2></h2><p></p></div><div class="audience-items">${'<article class="audience-item"><h3></h3><p></p><ul></ul></article>'.repeat(2)}</div></section>
    <section id="solucao"><div class="solution-heading"><h2></h2><p></p></div><article class="margot-feature"><p class="feature-kicker"></p><h3></h3><p></p></article>${'<article class="capability"><h3></h3><p></p></article>'.repeat(5)}</section>
    <section data-faq>${'<article class="faq-item"><button data-faq-trigger><span></span></button><div data-faq-panel><p></p></div></article>'.repeat(5)}</section>
    <script type="application/ld+json" data-faq-schema></script>
    <section data-final-cta><span class="eyebrow"></span><h2></h2><div class="final-cta-inner"><p></p><span data-final-cta-label></span></div></section>`;
}

describe('commercial profile', () => {
  test.each([
    ['', 'corretor'], ['?perfil=corretor', 'corretor'], ['?perfil=imobiliaria', 'imobiliaria'], ['?perfil=invalido', 'corretor'],
  ])('resolves %s as %s', (search, expected) => expect(resolveProfile(search)).toBe(expected));

  test('applies the team narrative without duplicating the page', () => {
    renderProfileFixture();
    applyProfileContent({ root: document, profile: 'imobiliaria' });
    expect(document.documentElement.dataset.profile).toBe('imobiliaria');
    expect(document.querySelector('.hero-copy h1').textContent).toContain('mesmo contexto');
    expect(document.querySelector('#problema h2').textContent).toContain('várias pessoas');
    expect(document.querySelector('#para-quem h2').textContent).toBe('Sua venda já envolve mais de uma pessoa.');
    expect(document.querySelector('[data-final-cta] h2').textContent).toContain('sem transformar o atendimento em bagunça');
    expect(JSON.parse(document.querySelector('[data-faq-schema]').textContent).mainEntity[0].name).toContain('mais de uma pessoa');
  });

  test('click updates URL, state and tracking, then restores realtor copy', () => {
    renderProfileFixture();
    window.history.replaceState({}, '', '/');
    const track = vi.fn();
    const controller = initializeProfileSelector({ root: document, windowRef: window, track });
    document.querySelector('[data-profile-option="imobiliaria"]').click();
    expect(controller.getProfile()).toBe('imobiliaria');
    expect(window.location.search).toBe('?perfil=imobiliaria');
    expect(track).toHaveBeenCalledWith('profile_selected', { profile: 'imobiliaria' });
    document.querySelector('[data-profile-option="corretor"]').click();
    expect(document.querySelector('.hero-copy h1').textContent).toContain('Atenda mais');
    expect(window.location.search).toBe('?perfil=corretor');
  });
});
