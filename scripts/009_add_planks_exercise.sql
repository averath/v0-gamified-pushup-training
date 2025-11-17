-- Add planks as a time-based exercise measured in seconds
insert into public.exercise_types (id, name, display_name, icon, measurement_type) values
  ('planks', 'planks', 'Planks', '📍', 'seconds')
on conflict (id) do nothing;
