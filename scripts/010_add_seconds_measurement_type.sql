-- Update the constraint to support 'seconds' as a measurement type
alter table public.exercise_types
  drop constraint if exists exercise_types_measurement_type_check;

alter table public.exercise_types
  add constraint exercise_types_measurement_type_check
  check (measurement_type in ('reps', 'minutes', 'seconds'));
