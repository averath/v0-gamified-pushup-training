-- Add composite index for faster user workout queries
create index if not exists workouts_user_created_idx on public.workouts(user_id, created_at desc);

-- Convert leaderboard view to materialized view for better performance
drop view if exists public.leaderboard_stats;

create materialized view public.leaderboard_stats as
select 
  p.id,
  p.username,
  coalesce(sum(w.pushups), 0) as total_pushups,
  count(w.id) as workout_count
from public.profiles p
left join public.workouts w on p.id = w.user_id
group by p.id, p.username
order by total_pushups desc;

-- Create index on materialized view for faster queries
create unique index if not exists leaderboard_stats_id_idx on public.leaderboard_stats(id);
create index if not exists leaderboard_stats_pushups_idx on public.leaderboard_stats(total_pushups desc);

-- Grant select permission
grant select on public.leaderboard_stats to authenticated;
grant select on public.leaderboard_stats to anon;

-- Function to refresh leaderboard stats
create or replace function refresh_leaderboard_stats()
returns trigger as $$
begin
  refresh materialized view concurrently public.leaderboard_stats;
  return null;
end;
$$ language plpgsql;

-- Trigger to refresh leaderboard when workouts change
drop trigger if exists refresh_leaderboard_on_workout_change on public.workouts;
create trigger refresh_leaderboard_on_workout_change
  after insert or update or delete on public.workouts
  for each statement
  execute function refresh_leaderboard_stats();

-- Trigger to refresh leaderboard when profiles change
drop trigger if exists refresh_leaderboard_on_profile_change on public.profiles;
create trigger refresh_leaderboard_on_profile_change
  after insert or update or delete on public.profiles
  for each statement
  execute function refresh_leaderboard_stats();

-- Initial refresh
refresh materialized view public.leaderboard_stats;
