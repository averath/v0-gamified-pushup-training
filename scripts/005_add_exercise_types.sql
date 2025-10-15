-- Add exercise_type column to workouts table
alter table public.workouts 
add column exercise_type text not null default 'pushups' 
check (exercise_type in ('pushups', 'squats'));

-- Update existing workouts to be pushups
update public.workouts set exercise_type = 'pushups' where exercise_type is null;

-- Create composite index for better query performance
create index if not exists workouts_user_exercise_idx on public.workouts(user_id, exercise_type);

-- Update leaderboard view to show separate stats per exercise
drop view if exists public.leaderboard_stats;

create or replace view public.leaderboard_stats as
select 
  p.id,
  p.username,
  coalesce(sum(case when w.exercise_type = 'pushups' then w.pushups else 0 end), 0) as total_pushups,
  coalesce(sum(case when w.exercise_type = 'squats' then w.pushups else 0 end), 0) as total_squats,
  coalesce(sum(w.pushups), 0) as total_reps,
  count(w.id) as workout_count
from public.profiles p
left join public.workouts w on p.id = w.user_id
group by p.id, p.username
order by total_reps desc;

-- Grant select permission on the view to authenticated users
grant select on public.leaderboard_stats to authenticated;
