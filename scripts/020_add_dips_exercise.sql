-- Add dips as a new workout type
INSERT INTO exercise_types (id, name, display_name, icon, measurement_type, xp_multiplier)
VALUES ('dips', 'dips', 'Dips', '💪', 'reps', 1.3)
ON CONFLICT (id) DO NOTHING;
