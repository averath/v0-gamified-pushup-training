-- Create workouts table to store push-up sessions
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pushups integer not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.workouts enable row level security;

-- RLS Policies for workouts
create policy "Users can view their own workouts"
  on public.workouts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own workouts"
  on public.workouts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own workouts"
  on public.workouts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own workouts"
  on public.workouts for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists workouts_user_id_idx on public.workouts(user_id);
create index if not exists workouts_created_at_idx on public.workouts(created_at desc);
