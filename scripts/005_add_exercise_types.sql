-- Add exercise_type column to workouts table
alter table public.workouts 
  add column if not exists exercise_type text not null default 'pushups';

-- Add check constraint to ensure valid exercise types
alter table public.workouts
  add constraint valid_exercise_type 
  check (exercise_type in ('pushups', 'pullups', 'squats'));

-- Update existing workouts to have 'pushups' as exercise type
update public.workouts 
set exercise_type = 'pushups' 
where exercise_type is null;

-- Create composite index for faster queries by user and exercise type
create index if not exists workouts_user_exercise_idx 
  on public.workouts(user_id, exercise_type, created_at desc);

-- Drop and recreate the leaderboard view to include exercise types
drop materialized view if exists public.leaderboard_stats;

create materialized view public.leaderboard_stats as
select 
  p.id,
  p.username,
  w.exercise_type,
  coalesce(sum(w.pushups), 0) as total_reps,
  count(w.id) as workout_count
from public.profiles p
left join public.workouts w on p.id = w.user_id
group by p.id, p.username, w.exercise_type
having coalesce(sum(w.pushups), 0) > 0
order by total_reps desc;

-- Create index on the materialized view
create unique index if not exists leaderboard_stats_idx 
  on public.leaderboard_stats(id, exercise_type);

-- Grant select permission to authenticated users
grant select on public.leaderboard_stats to authenticated;

-- Create function to refresh leaderboard
create or replace function refresh_leaderboard_stats()
returns trigger as $$
begin
  refresh materialized view concurrently public.leaderboard_stats;
  return null;
end;
$$ language plpgsql;

-- Create trigger to refresh leaderboard on workout changes
drop trigger if exists refresh_leaderboard_on_workout on public.workouts;
create trigger refresh_leaderboard_on_workout
  after insert or update or delete on public.workouts
  for each statement
  execute function refresh_leaderboard_stats();
