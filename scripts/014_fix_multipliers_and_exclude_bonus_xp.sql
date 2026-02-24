-- 1. Update running multiplier: 2× per hour (was 10× per minute)
update public.exercise_types set xp_multiplier = 2.0 where id = 'running';

-- 2. Recreate combined_leaderboard INCLUDING quest-reward rows
--    Quest bonus XP counts toward the combined total; it is only excluded in
--    the per-exercise sub-leaderboards (leaderboard_stats below).
create or replace view public.combined_leaderboard as
select
  p.id,
  p.username,
  floor(coalesce(sum(w.value * et.xp_multiplier), 0))::bigint as total_xp,
  count(distinct w.id) filter (where not w.is_quest_reward) as workout_count
from public.profiles p
inner join public.workouts w on p.id = w.user_id
inner join public.exercise_types et on w.exercise_type = et.id
group by p.id, p.username
having floor(coalesce(sum(w.value * et.xp_multiplier), 0)) > 0
order by total_xp desc;

grant select on public.combined_leaderboard to authenticated;
grant select on public.combined_leaderboard to anon;

-- 3. Recreate leaderboard_stats (materialized view) to:
--    a) Use w.value instead of old w.pushups column
--    b) Exclude quest-reward rows (is_quest_reward = false)
drop materialized view if exists public.leaderboard_stats cascade;

create materialized view public.leaderboard_stats as
select
  p.id,
  p.username,
  w.exercise_type,
  coalesce(sum(w.value), 0)::bigint as total_reps,
  count(w.id)::bigint as workout_count
from public.profiles p
inner join public.workouts w on p.id = w.user_id
where w.is_quest_reward = false
group by p.id, p.username, w.exercise_type
having coalesce(sum(w.value), 0) > 0
order by total_reps desc;

-- Unique index (required for concurrent refresh)
create unique index leaderboard_stats_idx
  on public.leaderboard_stats(id, exercise_type);

-- Performance index for per-exercise queries
create index leaderboard_stats_exercise_idx
  on public.leaderboard_stats(exercise_type, total_reps desc);

-- Grant access
grant select on public.leaderboard_stats to authenticated;
grant select on public.leaderboard_stats to anon;

-- Refresh immediately with the new definition
refresh materialized view public.leaderboard_stats;
