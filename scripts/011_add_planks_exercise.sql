-- Add planks as a new seconds-based exercise
insert into public.exercise_types (id, name, display_name, icon, measurement_type) values
  ('planks', 'planks', 'Planks', '🏋️', 'seconds')
on conflict (id) do nothing;
