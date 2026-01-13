# Aura Palette 🎨

Sistema de análise de colorimetria pessoal com IA.

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
cd /Users/ruyterfontes/.gemini/antigravity/scratch/auracolor
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e adicione suas chaves:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas chaves:

```env
OPENAI_API_KEY=sk-your-key-here
STRIPE_SECRET_KEY=sk_test_your-key-here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key-here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Executar

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 📱 Funcionalidades

| Recurso | Descrição |
|---------|-----------|
| **Landing Page** | Headline impactante com animações |
| **Cadastro** | Formulário simples (nome + email) |
| **Quiz** | 6 perguntas sobre tom de pele, olhos, cabelo |
| **Upload** | Drag-and-drop com dicas para foto ideal |
| **Análise IA** | GPT-4 Vision analisa colorimetria |
| **Preview** | Mostra temperatura e subtom (teaser) |
| **Pagamento** | Stripe Checkout - R$ 47 |
| **Relatório** | Paleta completa + dicas personalizadas |

---

## 🔑 APIs Necessárias

### OpenAI
- Crie conta em: [platform.openai.com](https://platform.openai.com)
- Gere uma API key
- Modelo usado: `gpt-4o` (Vision)

### Stripe
- Crie conta em: [stripe.com](https://stripe.com)
- Use chaves de **test mode** para desenvolvimento
- No painel: Developers → API Keys

---

## 📁 Estrutura

```
auracolor/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing
│   │   ├── signup/            # Cadastro
│   │   ├── quiz/              # Quiz interativo
│   │   ├── upload/            # Upload de foto
│   │   ├── preview/           # Preview parcial
│   │   ├── result/            # Relatório completo
│   │   └── api/
│   │       ├── analyze/       # OpenAI Vision
│   │       └── checkout/      # Stripe
│   └── components/
│       ├── Button/
│       ├── Card/
│       ├── Logo/
│       └── ProgressBar/
└── package.json
```

---

## 🎨 Identidade Visual

- **Cores**: Roxo (#7C3AED), Rosa (#EC4899), Dourado (#F59E0B)
- **Fonte**: Outfit (Google Fonts)
- **Design**: Glassmorphism, gradientes, animações suaves
