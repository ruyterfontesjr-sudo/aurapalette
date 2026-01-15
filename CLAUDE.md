# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aura Palette is a Brazilian AI-powered personal colorimetry analysis platform. Users complete a 6-question quiz, upload a photo, and receive AI analysis that determines their color season (12 types across 4 seasons). A partial preview is shown free, with full detailed report unlocked after R$47 payment via Stripe (card) or AbacatePay (PIX).

## Commands

```bash
npm run dev      # Development server (port 3000 or 3001)
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## Architecture

### Tech Stack
- **Next.js 14** with App Router (server/client components)
- **Supabase** for PostgreSQL database and authentication
- **OpenAI GPT-4o Vision** for photo colorimetry analysis
- **Stripe** for card payments, **AbacatePay** for PIX (Brazilian instant payment)
- **CSS Modules** with glassmorphism design pattern

### Key Files & Directories
- `src/app/` - App Router pages and API routes
- `src/contexts/AuthContext.tsx` - Authentication state (signUp, signIn, signOut)
- `src/lib/checkpoints.ts` - Funnel checkpoint system using localStorage
- `src/lib/supabase.ts` - Browser client, `supabase-server.ts` - Server client with service role
- `src/config.ts` - Pricing (R$47), testimonials, FAQs, social proof stats
- `src/data/trends2026.ts` - Color trend data by season
- `supabase/functions/abacate-billing-webhook/` - Edge Function for PIX webhook

### User Flow & Funnel
```
Landing → Signup → Quiz (6 questions) → Upload → AI Analysis → Preview → Checkout → Result
```

Checkpoint system (`checkpoints.ts`) enforces progression - users cannot skip steps. State persists in localStorage:
- `aurapalette_quiz` - Quiz answers
- `aurapalette_analysis` - AI analysis result
- `aurapalette_payment` - Payment status
- `aurapalette_checkpoint` - Current stage

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/analyze` | POST | GPT-4o Vision analysis - input: `{image, quizData}`, returns season/colors/recommendations |
| `/api/checkout` | POST | Creates Stripe checkout session |
| `/api/checkout/pix` | POST | Creates AbacatePay PIX QR code - input: `{name, email, cellphone, cpf}` |
| `/api/checkout/pix/status` | GET | Polls PIX status - query: `?id=pixId&email=email` |
| `/api/webhooks/stripe` | POST | Stripe payment webhook |
| `/api/webhooks/abacatepay` | POST | AbacatePay payment webhook |

### Database (Supabase)

**`checkouts` table:**
- `billing_id` - PIX ID from AbacatePay (used for status lookup)
- `email`, `amount` (4700 cents), `status` (pending/paid), `paid_at`, `created_at`

Webhook at `supabase/functions/abacate-billing-webhook/index.ts` handles payment confirmation. Uses 3 strategies to find checkout: pixQrCode.id → billing.id → email fallback.

### Payment Flow (PIX)

1. Frontend creates PIX via `/api/checkout/pix` with CPF
2. AbacatePay returns QR code, stored in Supabase with `billing_id`
3. Frontend polls `/api/checkout/pix/status` every 3 seconds
4. On payment: webhook updates Supabase OR polling detects via AbacatePay API
5. Status check uses REST API directly (not Supabase JS client) to avoid caching issues

### Path Alias
`@/*` maps to `src/*` (tsconfig.json)

## Environment Variables

Required in `.env.local`:
```env
OPENAI_API_KEY=sk-...                           # GPT-4o Vision
STRIPE_SECRET_KEY=sk_...                        # Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...       # Stripe (frontend)
STRIPE_WEBHOOK_SECRET=whsec_...                 # Stripe webhook validation
ABACATEPAY_API_KEY=abc_...                      # PIX payments
ABACATEPAY_WEBHOOK_SECRET=...                   # AbacatePay webhook (also in Supabase secrets)
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...                # Server-side DB operations
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

The app gracefully falls back to mock data when API keys are missing.

## Known Issues & Context

- **PIX caching**: Supabase JS client returns stale data from Vercel cache. Status endpoint uses direct REST API calls with cache-busting headers to work around this.
- **Webhook secret**: AbacatePay webhook requires `ABACATEPAY_WEBHOOK_SECRET` configured both in Vercel env vars AND Supabase Edge Function secrets.
- **Color seasons**: 12 types - Primavera (Clara/Quente/Intensa), Verão (Claro/Suave/Frio), Outono (Suave/Quente/Profundo), Inverno (Claro/Frio/Profundo)

## Supabase CLI

```bash
supabase start              # Start local Supabase
supabase functions serve    # Run Edge Functions locally
supabase functions deploy abacate-billing-webhook  # Deploy webhook
supabase secrets set KEY=value  # Set Edge Function secrets
```
