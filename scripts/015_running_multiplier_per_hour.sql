-- Update running's XP multiplier to 2 XP per hour.
-- Running values are stored in minutes, so the per-minute multiplier is 2/60.
update public.exercise_types
  set xp_multiplier = round((2.0 / 60.0)::numeric, 6)
  where id = 'running';
