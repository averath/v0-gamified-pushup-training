-- Add measurement_type to exercise_types table
alter table public.exercise_types
  add column if not exists measurement_type text not null default 'reps'
  check (measurement_type in ('reps', 'minutes'));

-- Rename pushups column to value for generic use
alter table public.workouts
  rename column pushups to value;

-- Add a comment to clarify the value column
comment on column public.workouts.value is 'The workout value - either reps or minutes depending on exercise type';

-- Add a time-based exercise example (running)
insert into public.exercise_types (id, name, display_name, icon, measurement_type) values
  ('running', 'running', 'Running', '🏃', 'minutes')
on conflict (id) do nothing;

-- Update existing exercises to explicitly set measurement_type
update public.exercise_types
  set measurement_type = 'reps'
  where id in ('pushups', 'pullups', 'squats');
