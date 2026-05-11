-- Creates a server-side record of quest claims to prevent double-claiming
-- across multiple devices using the same account.
-- The unique constraint on (user_id, quest_id, period_key, exercise_type)
-- mirrors the client's questKey = `${quest.id}-${exerciseType}` per period.

create table if not exists public.quest_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_id text not null,
  period_key text not null,       -- "YYYY-MM-DD" (daily = today, weekly = Monday of current week)
  exercise_type text not null references public.exercise_types(id),
  claimed_at timestamp with time zone default now(),

  unique (user_id, quest_id, period_key, exercise_type)
);

alter table public.quest_claims enable row level security;

create policy "Users can view their own quest claims"
  on public.quest_claims for select
  using (auth.uid() = user_id);

create policy "Users can insert their own quest claims"
  on public.quest_claims for insert
  with check (auth.uid() = user_id);
