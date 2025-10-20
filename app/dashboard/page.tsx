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

  const [profileResult, workoutsResult] = await Promise.all([
    supabase.from("profiles").select("username").eq("id", user.id).maybeSingle(),
    supabase.from("workouts").select("*").order("created_at", { ascending: false }).limit(100),
  ])

  const { data: workouts, error } = workoutsResult

  if (error) {
    console.error("Error fetching workouts:", error)
  }

  const totals = {
    pushups: 0,
    pullups: 0,
    squats: 0,
  }

  workouts?.forEach((w) => {
    const type = w.exercise_type || "pushups"
    totals[type as keyof typeof totals] += w.pushups
  })

  return (
    <PushupTracker
      initialWorkouts={workouts || []}
      initialTotals={totals}
      username={profileResult.data?.username || user.email || ""}
    />
  )
}
