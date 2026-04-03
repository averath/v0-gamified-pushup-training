-- Per-exercise time-filtered leaderboard views.
-- These mirror leaderboard_stats but restrict to a time window.
-- Regular views (not materialized) so they bypass workouts RLS just like
-- the combined_leaderboard_* views do.

-- ── Last Day ──────────────────────────────────────────────────────────────────

create or replace view public.leaderboard_stats_day as
select
  p.id,
  p.username,
  w.exercise_type,
  coalesce(sum(w.value), 0)::bigint as total_reps,
  count(w.id)::bigint               as workout_count
from public.profiles p
inner join public.workouts w on p.id = w.user_id
where w.is_quest_reward = false
  and w.created_at >= now() - interval '1 day'
group by p.id, p.username, w.exercise_type
having coalesce(sum(w.value), 0) > 0
order by total_reps desc;

grant select on public.leaderboard_stats_day to authenticated, anon;

-- ── Last Week ─────────────────────────────────────────────────────────────────

create or replace view public.leaderboard_stats_week as
select
  p.id,
  p.username,
  w.exercise_type,
  coalesce(sum(w.value), 0)::bigint as total_reps,
  count(w.id)::bigint               as workout_count
from public.profiles p
inner join public.workouts w on p.id = w.user_id
where w.is_quest_reward = false
  and w.created_at >= now() - interval '7 days'
group by p.id, p.username, w.exercise_type
having coalesce(sum(w.value), 0) > 0
order by total_reps desc;

grant select on public.leaderboard_stats_week to authenticated, anon;

-- ── Last Month ────────────────────────────────────────────────────────────────

create or replace view public.leaderboard_stats_month as
select
  p.id,
  p.username,
  w.exercise_type,
  coalesce(sum(w.value), 0)::bigint as total_reps,
  count(w.id)::bigint               as workout_count
from public.profiles p
inner join public.workouts w on p.id = w.user_id
where w.is_quest_reward = false
  and w.created_at >= now() - interval '30 days'
group by p.id, p.username, w.exercise_type
having coalesce(sum(w.value), 0) > 0
order by total_reps desc;

grant select on public.leaderboard_stats_month to authenticated, anon;

-- ── Last Year ─────────────────────────────────────────────────────────────────

create or replace view public.leaderboard_stats_year as
select
  p.id,
  p.username,
  w.exercise_type,
  coalesce(sum(w.value), 0)::bigint as total_reps,
  count(w.id)::bigint               as workout_count
from public.profiles p
inner join public.workouts w on p.id = w.user_id
where w.is_quest_reward = false
  and w.created_at >= now() - interval '1 year'
group by p.id, p.username, w.exercise_type
having coalesce(sum(w.value), 0) > 0
order by total_reps desc;

grant select on public.leaderboard_stats_year to authenticated, anon;
