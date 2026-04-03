-- Time-filtered leaderboard views: last day, last week, last month, last year.
-- Each view mirrors the logic of combined_leaderboard / leaderboard_stats
-- but restricts workouts to the relevant time window.

-- ── 1. Combined time-based views (XP) ────────────────────────────────────────

create or replace view public.combined_leaderboard_day as
select
  p.id,
  p.username,
  floor(coalesce(sum(w.value * et.xp_multiplier), 0))::bigint as total_xp,
  count(distinct w.id) filter (where not w.is_quest_reward)    as workout_count
from public.profiles p
inner join public.workouts w  on p.id = w.user_id
inner join public.exercise_types et on w.exercise_type = et.id
where w.created_at >= now() - interval '1 day'
group by p.id, p.username
having floor(coalesce(sum(w.value * et.xp_multiplier), 0)) > 0
order by total_xp desc;

create or replace view public.combined_leaderboard_week as
select
  p.id,
  p.username,
  floor(coalesce(sum(w.value * et.xp_multiplier), 0))::bigint as total_xp,
  count(distinct w.id) filter (where not w.is_quest_reward)    as workout_count
from public.profiles p
inner join public.workouts w  on p.id = w.user_id
inner join public.exercise_types et on w.exercise_type = et.id
where w.created_at >= now() - interval '7 days'
group by p.id, p.username
having floor(coalesce(sum(w.value * et.xp_multiplier), 0)) > 0
order by total_xp desc;

create or replace view public.combined_leaderboard_month as
select
  p.id,
  p.username,
  floor(coalesce(sum(w.value * et.xp_multiplier), 0))::bigint as total_xp,
  count(distinct w.id) filter (where not w.is_quest_reward)    as workout_count
from public.profiles p
inner join public.workouts w  on p.id = w.user_id
inner join public.exercise_types et on w.exercise_type = et.id
where w.created_at >= now() - interval '30 days'
group by p.id, p.username
having floor(coalesce(sum(w.value * et.xp_multiplier), 0)) > 0
order by total_xp desc;

create or replace view public.combined_leaderboard_year as
select
  p.id,
  p.username,
  floor(coalesce(sum(w.value * et.xp_multiplier), 0))::bigint as total_xp,
  count(distinct w.id) filter (where not w.is_quest_reward)    as workout_count
from public.profiles p
inner join public.workouts w  on p.id = w.user_id
inner join public.exercise_types et on w.exercise_type = et.id
where w.created_at >= now() - interval '1 year'
group by p.id, p.username
having floor(coalesce(sum(w.value * et.xp_multiplier), 0)) > 0
order by total_xp desc;

-- Grant permissions
grant select on public.combined_leaderboard_day   to authenticated, anon;
grant select on public.combined_leaderboard_week  to authenticated, anon;
grant select on public.combined_leaderboard_month to authenticated, anon;
grant select on public.combined_leaderboard_year  to authenticated, anon;
