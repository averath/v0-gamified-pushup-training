# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
npm run start    # Run production server after build
```

No test framework is configured. Database migrations are run manually in the Supabase SQL editor — there is no migration runner CLI.

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

## Architecture Overview

**LVL UP** is a gamified fitness tracker (Next.js 16 App Router, React 19, TypeScript, Supabase, Tailwind CSS 4, shadcn/ui). Users log reps across 7 exercise types, earn XP, level up through 9 tiers (Rookie → Legend), complete quests, and compete on global leaderboards.

### Key Directories

- `/app` — Next.js App Router pages. Protected routes: `/dashboard`, `/stats`. Public: `/`, `/leaderboard`, `/features`.
- `/components` — UI components. `pushup-tracker.tsx` is the main dashboard with most state.
- `/lib/level-system.ts` — All level/XP calculations.
- `/lib/i18n/` — EN/PL translations via React Context (`useLanguage()` hook).
- `/lib/supabase/` — Supabase client (`client.ts`), server-side client (`server.ts`), auth middleware (`middleware.ts`).
- `/scripts/` — Numbered SQL migration files (001–020+). Run manually in Supabase.
- `/hooks/` — `use-selected-exercise.ts` persists exercise selection to localStorage.

### Level System

Exponential XP curve in `/lib/level-system.ts`:
- `BASE_XP = 20`, `GROWTH_FACTOR = 1.15`
- `calculateLevel(totalXP)` uses binary search
- 9 tiers with milestones at levels 10, 25, 50, 75, 100, 150, 200, 250, 300, 500, 1000

### Exercise XP Multipliers

Each exercise has an `xp_multiplier` in the `exercise_types` table. Push-ups are baseline (1.0×); pull-ups are 3.0×, running 10.0×, etc. The combined leaderboard sums `value × xp_multiplier` across all exercises.

### Quest Rewards

Claimed quests insert a workout row with `is_quest_reward = true`. This is how bonus XP is stored — no separate rewards table.

### Auth & Supabase Sessions

The app uses Supabase SSR pattern. **Never create a singleton Supabase client** — always create a new server client per request (`createClient()` from `lib/supabase/server.ts`) to avoid session desync. Middleware in `middleware.ts` (entry point `proxy.ts`) refreshes sessions on every request and redirects unauthenticated users away from protected routes.

### Internationalization

Language preference is stored in localStorage and managed via `LanguageProvider` context. To add a language: add translations to `/lib/i18n/translations.ts`, update the `Language` type, and update the LanguageProvider validation.

### Adding a New Exercise

1. Create `/scripts/XXX_add_[exercise]_exercise.sql` and run it in Supabase:
   ```sql
   INSERT INTO exercise_types (id, name, display_name, icon, xp_multiplier)
   VALUES ('[id]', '[name]', '[Display Name]', '[emoji]', [multiplier]);
   ```
2. Add translations in `/lib/i18n/translations.ts`.
3. Leaderboard views pick it up automatically.

### Caching

Next.js HTTP caching is configured in `next.config.mjs` (1-week max-age for pages, immutable for hashed JS/CSS chunks). The dashboard loads all workouts once and filters client-side — no per-query caching layer.

### PWA

The app is installable as a PWA. `public/manifest.json` + `public/sw.js` handle this. No special configuration needed for development.
