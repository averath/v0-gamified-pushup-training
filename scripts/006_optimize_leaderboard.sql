-- Add index on exercise_type for faster filtering
create index if not exists leaderboard_stats_exercise_idx 
  on public.leaderboard_stats(exercise_type, total_reps desc);

-- Optimize the materialized view refresh to be less aggressive
-- Drop the trigger that refreshes on every workout change
drop trigger if exists refresh_leaderboard_on_workout on public.workouts;

-- Instead, we'll rely on the revalidate setting in Next.js (30 seconds)
-- and manual refreshes when needed. This prevents constant refreshes
-- that can slow down the database during high traffic.

-- Optional: Create a function to manually refresh when needed
create or replace function manual_refresh_leaderboard()
returns void as $$
begin
  refresh materialized view concurrently public.leaderboard_stats;
end;
$$ language plpgsql;

-- Grant execute permission
grant execute on function manual_refresh_leaderboard() to authenticated;
