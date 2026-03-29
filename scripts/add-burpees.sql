-- Add burpees as a new workout type
INSERT INTO exercise_types (id, name, display_name, icon, measurement_type, xp_multiplier)
VALUES ('burpees', 'burpees', 'Burpees', '🏋️', 'reps', 1.5)
ON CONFLICT (id) DO NOTHING;
