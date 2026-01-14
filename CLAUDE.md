# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aura Palette is a personal colorimetry analysis system using AI. Users complete a quiz, upload a photo, and receive AI-powered color analysis with personalized recommendations for clothing, makeup, and accessories. The app uses a freemium model with Stripe/PIX payments to unlock full reports.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database/Auth**: Supabase
- **AI**: OpenAI GPT-4o Vision for photo analysis
- **Payments**: Stripe (card) + AbacatePay (PIX)
- **Styling**: CSS Modules with glassmorphism design

### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable UI components (Button, Card, Logo, ProgressBar)
- `src/contexts/` - React Context providers (AuthContext)
- `src/lib/` - Supabase client setup and utilities
- `src/config.ts` - Central configuration (pricing, testimonials, FAQs)
- `supabase/` - Supabase local development config and functions

### User Flow
1. Landing (`/`) → Signup (`/signup`) → Quiz (`/quiz`) → Upload (`/upload`)
2. AI analysis via `/api/analyze` (GPT-4o Vision)
3. Preview (`/preview`) shows partial results
4. Payment via `/api/checkout` or `/api/checkout/pix`
5. Full report at `/result`

### API Routes
- `POST /api/analyze` - Sends photo to GPT-4o Vision, returns colorimetry analysis JSON
- `POST /api/checkout` - Creates Stripe checkout session
- `POST /api/checkout/pix` - Creates PIX payment via AbacatePay
- `GET /api/checkout/pix/status` - Polls PIX payment status
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `POST /api/webhooks/abacatepay` - AbacatePay webhook handler

### Path Alias
Use `@/*` to import from `src/*` (configured in tsconfig.json).

## Environment Variables

Required in `.env.local`:
- `OPENAI_API_KEY` - For GPT-4o Vision analysis
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe payments
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase
- `NEXT_PUBLIC_BASE_URL` - App URL (default: http://localhost:3000)

The app gracefully falls back to mock data when API keys are missing.
