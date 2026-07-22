# PiperKey Solo — Landing Page

Landing page estática em Vite, HTML, CSS e JavaScript vanilla. O WhatsApp é a conversão principal e o agendamento de demonstração é a conversão secundária.

## Configuração

Use Node.js 20 ou superior, instale as dependências e copie as variáveis públicas:

```bash
npm install
cp .env.example .env.production
```

Preencha todas as variáveis de produção:

- `VITE_WHATSAPP_NUMBER`: número internacional, apenas dígitos.
- `VITE_DEMO_URL`: URL HTTPS da agenda.
- `VITE_SITE_URL`: domínio canônico HTTPS, sem barra final.
- `VITE_GA4_ID`: ID de medição GA4.
- `VITE_META_PIXEL_ID`: ID numérico do Meta Pixel.

O build falha quando qualquer valor obrigatório estiver ausente ou inválido.

## Comandos

```bash
npm run dev
npm test
npm run test:e2e
npm run build
npm run lighthouse
```

Os testes E2E usam Chromium em 1440 px, Firefox em 768 px e WebKit em 390 px. O Lighthouse exige nota mínima 90 nas quatro categorias, LCP abaixo de 2,5 s e CLS abaixo de 0,1.

## Estrutura

- `index.html`: landing page e fallback funcional sem JavaScript.
- `privacidade.html`: política de privacidade que precisa de aprovação jurídica.
- `src/config.js`: configuração pública, planos, preços e URLs de WhatsApp.
- `src/consent.js`: consentimento versionado em `localStorage`.
- `src/analytics.js`: carregamento condicional de GA4 e Meta Pixel.
- `src/ui.js`: preços, FAQ, CTAs, scroll depth, reveals e CTA móvel.
- `public/assets/`: logos oficiais, favicon e imagem social.

## Bloqueios antes da publicação

- Trocar os valores de exemplo por WhatsApp, agenda, domínio, GA4 e Meta Pixel reais.
- Substituir a composição demonstrativa do hero por capturas autênticas e anonimizadas da Margot e do CRM, quando forem fornecidas.
- Confirmar comercialmente preços, benefícios e claims existentes.
- Validar a fonte do claim de 75% e concluir a revisão jurídica da copy e da política de privacidade.
- Validar GA4 DebugView, Meta Test Events, WhatsApp, agenda e Safari em iPhone real.

Não há backend, formulário próprio, CMS, pagamento, autenticação ou armazenamento de leads neste projeto.
