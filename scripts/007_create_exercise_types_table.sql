-- Create exercise_types table to manage workout types dynamically
create table if not exists public.exercise_types (
  id text primary key,
  name text not null,
  display_name text not null,
  icon text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.exercise_types enable row level security;

-- Allow everyone to read exercise types
create policy "Exercise types are viewable by everyone"
  on public.exercise_types for select
  using (true);

-- Only allow service role to insert/update/delete exercise types
create policy "Only service role can modify exercise types"
  on public.exercise_types for all
  using (auth.role() = 'service_role');

-- Seed with current exercise types
insert into public.exercise_types (id, name, display_name, icon) values
  ('pushups', 'pushups', 'Push-ups', '💪'),
  ('pullups', 'pullups', 'Pull-ups', '🏋️'),
  ('squats', 'squats', 'Squats', '🦵')
on conflict (id) do nothing;

-- Drop the old check constraint
alter table public.workouts 
  drop constraint if exists valid_exercise_type;

-- Add foreign key constraint to workouts table
alter table public.workouts
  add constraint fk_exercise_type
  foreign key (exercise_type)
  references public.exercise_types(id)
  on delete restrict;

-- Create index for faster lookups
create index if not exists idx_exercise_types_id on public.exercise_types(id);

-- Grant select to authenticated users
grant select on public.exercise_types to authenticated;
grant select on public.exercise_types to anon;
