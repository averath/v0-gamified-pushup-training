-- Create a view for leaderboard that aggregates workout data
create or replace view public.leaderboard_stats as
select 
  p.id,
  p.username,
  coalesce(sum(w.pushups), 0) as total_pushups,
  count(w.id) as workout_count
from public.profiles p
left join public.workouts w on p.id = w.user_id
group by p.id, p.username
order by total_pushups desc;

-- Grant select permission on the view to authenticated users
grant select on public.leaderboard_stats to authenticated;
