# Ajustes de Copy da LP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir exatamente a copy aprovada da seção “O problema” e do CTA final, preservando toda a estrutura e comportamento da landing page.

**Architecture:** Alteração estática e localizada em `index.html`, protegida por assertions E2E de correspondência exata. Nenhum módulo JavaScript, estilo, link ou configuração pública será modificado.

**Tech Stack:** Vite, HTML semântico, Playwright, Axe.

## Global Constraints

- Manter layout, cores, tipografia, estatística, cards, botões, links, animações e responsividade existentes.
- Preservar o WhatsApp de produção `5548998243204` via configuração Vercel.
- Usar exatamente a pontuação e as frases aprovadas no design.
- Não adicionar carrossel nem novas interações.

---

### Task 1: Fixar a copy aprovada em teste

**Files:**
- Modify: `tests/e2e/landing.spec.js`
- Test: `tests/e2e/landing.spec.js`

**Interfaces:**
- Consumes: landmarks `#problema` e `[data-final-cta]` do HTML atual.
- Produces: contrato E2E da copy exata para as duas seções.

- [ ] **Step 1: Escrever o teste que falha**

Adicionar um cenário que valide:

```js
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
```

- [ ] **Step 2: Executar o teste e confirmar a falha**

Run: `npx playwright test tests/e2e/landing.spec.js --project=chromium-desktop --grep "approved problem"`

Expected: FAIL porque a LP ainda contém `Não é falta de esforço` e `Quanto custa continuar`.

### Task 2: Aplicar somente as substituições de texto

**Files:**
- Modify: `index.html`
- Test: `tests/e2e/landing.spec.js`

**Interfaces:**
- Consumes: contrato textual criado na Task 1.
- Produces: HTML com a copy aprovada e a hierarquia semântica existente.

- [ ] **Step 1: Substituir a copy da seção “O problema”**

Manter a eyebrow e trocar somente o `h2` e o parágrafo:

```html
<span class="eyebrow eyebrow-dark">O problema</span>
<h2>O cliente não sabe que você está ocupado.<br />Ele só sabe que ninguém respondeu.</h2>
<p>
  Toda vez que seu celular fica sem resposta, alguém está vendendo no seu lugar.<br /><br />
  Enquanto você visita um imóvel, negocia ou dirige, a Margot continua atendendo, qualificando e mantendo cada oportunidade viva.
</p>
```

- [ ] **Step 2: Substituir a copy do CTA final**

Manter os CTAs e trocar os três elementos textuais:

```html
<span class="eyebrow">Seu próximo lead não vai esperar.</span>
<h2>Você não precisa estar disponível o tempo todo para continuar atendendo bem.</h2>
<p>Agende 15 minutos e veja a Margot funcionando em uma operação parecida com a sua.</p>
```

- [ ] **Step 3: Atualizar a expectativa da ordem de headings**

Em `orderedHeadings`, substituir:

```js
expect.stringContaining('estar em um lugar só')
```

por:

```js
expect.stringContaining('cliente não sabe que você está ocupado')
```

e substituir:

```js
expect.stringContaining('único ponto de atendimento')
```

por:

```js
expect.stringContaining('disponível o tempo todo')
```

- [ ] **Step 4: Executar o cenário de copy**

Run: `npx playwright test tests/e2e/landing.spec.js --project=chromium-desktop --grep "approved problem"`

Expected: 1 passed.

### Task 3: Regressão, publicação e smoke test

**Files:**
- Modify: none.
- Test: `tests/e2e/landing.spec.js` and production build.

**Interfaces:**
- Consumes: HTML validado nas Tasks 1 e 2.
- Produces: branch, PR e alias Vercel atualizados.

- [ ] **Step 1: Executar a suíte completa**

Run: `npm test && npx playwright test`

Expected: 50 unit tests e 42 E2E tests aprovados nos três projetos Playwright.

- [ ] **Step 2: Gerar o build de produção**

Run:

```bash
VITE_WHATSAPP_NUMBER=5548998243204 \
VITE_DEMO_URL=https://example.com/agendar \
VITE_SITE_URL=https://lp-piperkey.vercel.app \
VITE_GA4_ID=G-PREVIEW0000 \
VITE_META_PIXEL_ID=000000000000000 \
npm run build
```

Expected: build Vite concluído sem erro.

- [ ] **Step 3: Commitar e atualizar o PR**

```bash
git add index.html tests/e2e/landing.spec.js docs/superpowers/plans/2026-07-22-copy-ajustes-problema-cta.md
git commit -m "fix: update landing page messaging"
git push origin codex/piperkey-solo-lp
```

- [ ] **Step 4: Republicar a Vercel**

```bash
vercel deploy --prod --yes --force --logs \
  --build-env VITE_WHATSAPP_NUMBER=5548998243204 \
  --build-env VITE_DEMO_URL=https://example.com/agendar \
  --build-env VITE_SITE_URL=https://lp-piperkey.vercel.app \
  --build-env VITE_GA4_ID=G-PREVIEW0000 \
  --build-env VITE_META_PIXEL_ID=000000000000000
```

Expected: alias `https://lp-piperkey.vercel.app` associado ao novo deployment em estado READY.

- [ ] **Step 5: Validar a URL publicada**

Executar Playwright contra o alias e conferir as seis frases aprovadas, o status HTTP 200 e todos os links de WhatsApp iniciando com `https://wa.me/5548998243204`.
