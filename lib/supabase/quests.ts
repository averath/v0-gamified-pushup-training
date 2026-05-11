import { createClient } from "@/lib/supabase/client";

export type QuestPeriod = "daily" | "weekly";

export interface ClaimedQuest {
  quest_id: string;
  exercise_type: string;
  period_type: QuestPeriod;
  period_date: string;
}

export async function getClaimedQuests(userId: string, type: QuestPeriod, periodDate: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('claimed_quests')
    .select('quest_id, exercise_type')
    .eq('user_id', userId)
    .eq('period_type', type)
    .eq('period_date', periodDate);

  if (error) {
    console.error("Error fetching claimed quests:", error);
    return [];
  }

  return data || [];
}

export async function claimQuest(userId: string, questId: string, exerciseType: string, type: QuestPeriod, periodDate: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('claimed_quests')
    .insert([
      { 
        user_id: userId, 
        quest_id: questId, 
        exercise_type: exerciseType, 
        period_type: type, 
        period_date: periodDate 
      },
    ]);

  if (error) {
    console.error("Error claiming quest:", error);
    return false;
  }

  return true;
}

export async function unclaimQuest(userId: string, questId: string, exerciseType: string, type: QuestPeriod, periodDate: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('claimed_quests')
    .delete()
    .eq('user_id', userId)
    .eq('quest_id', questId)
    .eq('exercise_type', exerciseType)
    .eq('period_type', type)
    .eq('period_date', periodDate);

  if (error) {
    console.error("Error unclaming quest:", error);
    return false;
  }

  return true;
}