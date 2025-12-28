-- Add is_quest_reward column to differentiate quest XP from actual workouts
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS is_quest_reward BOOLEAN DEFAULT FALSE;

-- Add comment to explain the column
COMMENT ON COLUMN workouts.is_quest_reward IS 'True if this entry is a quest reward, false if it is an actual workout session';
