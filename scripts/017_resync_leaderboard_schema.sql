-- Full resync of unified leaderboard schema.
-- Safe to re-run: uses CREATE OR REPLACE for views and ADD COLUMN IF NOT EXISTS.
-- Re-applies all changes from scripts 013–015 in one idempotent script.

-- ── 1. XP multipliers ─────────────────────────────────────────────────────────

alter table public.exercise_types
  add column if not exists xp_multiplier numeric not null default 1.0;

-- push-ups  1.0×  per rep   – baseline bodyweight
-- pull-ups  3.0×  per rep   – full bodyweight pull, far more demanding
-- squats    0.8×  per rep   – large muscle group, mechanically easier
-- running   0.03333×/min    – equals 2 XP per hour of running
-- planks    0.3×  per sec   – isometric hold

update public.exercise_types set xp_multiplier = 1.0              where id = 'pushups';
update public.exercise_types set xp_multiplier = 3.0              where id = 'pullups';
update public.exercise_types set xp_multiplier = 0.8              where id = 'squats';
update public.exercise_types set xp_multiplier = round(2.0/60, 6) where id = 'running';
update public.exercise_types set xp_multiplier = 0.3              where id = 'planks';

-- ── 2. Combined leaderboard view (includes bonus XP) ─────────────────────────

create or replace view public.combined_leaderboard as
select
  p.id,
  p.username,
  floor(coalesce(sum(w.value * et.xp_multiplier), 0))::bigint as total_xp,
  count(distinct w.id) filter (where not w.is_quest_reward)    as workout_count
from public.profiles p
inner join public.workouts w  on p.id = w.user_id
inner join public.exercise_types et on w.exercise_type = et.id
group by p.id, p.username
having floor(coalesce(sum(w.value * et.xp_multiplier), 0)) > 0
order by total_xp desc;

grant select on public.combined_leaderboard to authenticated;
grant select on public.combined_leaderboard to anon;

-- ── 3. Per-exercise materialized view (excludes bonus XP) ────────────────────

drop materialized view if exists public.leaderboard_stats cascade;

create materialized view public.leaderboard_stats as
select
  p.id,
  p.username,
  w.exercise_type,
  coalesce(sum(w.value), 0)::bigint as total_reps,
  count(w.id)::bigint               as workout_count
from public.profiles p
inner join public.workouts w on p.id = w.user_id
where w.is_quest_reward = false
group by p.id, p.username, w.exercise_type
having coalesce(sum(w.value), 0) > 0
order by total_reps desc;

-- Unique index required for CONCURRENTLY refresh
create unique index leaderboard_stats_idx
  on public.leaderboard_stats(id, exercise_type);

-- Performance index for per-exercise queries
create index leaderboard_stats_exercise_idx
  on public.leaderboard_stats(exercise_type, total_reps desc);

grant select on public.leaderboard_stats to authenticated;
grant select on public.leaderboard_stats to anon;

-- Populate immediately
refresh materialized view public.leaderboard_stats;
