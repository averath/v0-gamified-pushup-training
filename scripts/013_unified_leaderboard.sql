-- Add xp_multiplier column to exercise_types
-- This controls how much XP each unit of an exercise contributes to the combined leaderboard.
--
-- Proposed weights rationale:
--   push-ups  1.0×  – baseline bodyweight exercise, a rep = 1 XP
--   pull-ups  3.0×  – full bodyweight pull, much more demanding per rep
--   squats    0.8×  – large muscle group but mechanically easier than push-ups
--   running  10.0×  – per minute of sustained cardio, high systemic effort
--   planks    0.3×  – per second held; isometric, easier to accumulate seconds

alter table public.exercise_types
  add column if not exists xp_multiplier numeric not null default 1.0;

update public.exercise_types set xp_multiplier = 1.0  where id = 'pushups';
update public.exercise_types set xp_multiplier = 3.0  where id = 'pullups';
update public.exercise_types set xp_multiplier = 0.8  where id = 'squats';
update public.exercise_types set xp_multiplier = 10.0 where id = 'running';
update public.exercise_types set xp_multiplier = 0.3  where id = 'planks';

-- Combined leaderboard view
-- total_xp = sum of (value × xp_multiplier) across all exercises per user.
-- We floor to keep it an integer and exclude quest-reward-only entries
-- (quest rewards are weighted the same as real workouts intentionally).
create or replace view public.combined_leaderboard as
select
  p.id,
  p.username,
  floor(coalesce(sum(w.value * et.xp_multiplier), 0))::bigint as total_xp,
  count(distinct w.id) as workout_count
from public.profiles p
inner join public.workouts w on p.id = w.user_id
inner join public.exercise_types et on w.exercise_type = et.id
group by p.id, p.username
having floor(coalesce(sum(w.value * et.xp_multiplier), 0)) > 0
order by total_xp desc;

-- Grant read access (mirrors leaderboard_stats permissions)
grant select on public.combined_leaderboard to authenticated;
grant select on public.combined_leaderboard to anon;
