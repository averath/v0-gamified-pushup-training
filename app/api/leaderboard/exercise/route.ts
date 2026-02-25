import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const exerciseId = searchParams.get("id")
  if (!exerciseId) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from("leaderboard_stats")
    .select("id, username, exercise_type, total_reps, workout_count")
    .eq("exercise_type", exerciseId)
    .order("total_reps", { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
