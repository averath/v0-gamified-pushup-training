-- Refresh materialized views so leaderboard_stats picks up the latest data
-- (including the quest-reward exclusion and value column changes from migration 014)
REFRESH MATERIALIZED VIEW CONCURRENTLY public.leaderboard_stats;
