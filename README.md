# BookAI — AI Appointment Booking System

Multi-tenant SaaS platform for AI-powered appointment booking. Built with Next.js, Supabase, OpenAI, Resend, Twilio, and n8n.

## Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL + RLS)
- **Auth:** Supabase Auth (email + Google OAuth)
- **AI:** OpenRouter (free/cheap models) or OpenAI direct
- **Email:** Resend
- **WhatsApp:** Twilio
- **Automation:** n8n
- **Deploy:** Vercel

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL editor
3. Enable Google OAuth in Authentication → Providers
4. Add your site URL and redirect URL: `http://localhost:3000/api/auth/callback`

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
  app/
    (auth)/          Login & signup
    (booking)/       Public booking & chat pages
    (dashboard)/     Business owner dashboard
    api/             REST API routes
  components/        UI components
  hooks/             React hooks
  lib/               Supabase clients
  prompts/           AI prompt templates
  services/          Business logic
  types/             TypeScript types
supabase/
  migrations/        Database schema + RLS
workflows/           n8n automation templates
```

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login`, `/signup` | Authentication |
| `/book/[businessId]` | Public booking form |
| `/chat/[businessId]` | AI chatbot |
| `/dashboard` | Business overview |
| `/dashboard/appointments` | Manage bookings |
| `/dashboard/services` | Service CRUD |
| `/dashboard/ai-settings` | AI tone & FAQs |

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables from `.env.example`
4. Deploy
