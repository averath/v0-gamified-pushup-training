import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PushupTracker } from "@/components/pushup-tracker"

export const revalidate = 60

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [profileResult, recentWorkoutsResult, totalsResult] = await Promise.all([
    supabase.from("profiles").select("username").eq("id", user.id).maybeSingle(),
    supabase.from("workouts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("workouts").select("pushups, exercise_type").eq("user_id", user.id),
  ])

  const { data: recentWorkouts, error: workoutsError } = recentWorkoutsResult
  const { data: allWorkouts, error: totalsError } = totalsResult

  if (workoutsError) {
    console.error("Error fetching workouts:", workoutsError)
  }

  if (totalsError) {
    console.error("Error fetching totals:", totalsError)
  }

  const totals = {
    pushups: 0,
    pullups: 0,
    squats: 0,
  }

  allWorkouts?.forEach((w) => {
    const type = w.exercise_type || "pushups"
    totals[type as keyof typeof totals] += w.pushups
  })

  return (
    <PushupTracker
      initialWorkouts={recentWorkouts || []}
      initialTotals={totals}
      username={profileResult.data?.username || user.email || ""}
    />
  )
}
