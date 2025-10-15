import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PushupTracker } from "@/components/pushup-tracker"

export const revalidate = 60

export default async function DashboardPage() {
  const supabase = await createClient()

  console.log("[v0] Fetching dashboard data...")

  const [
    {
      data: { user },
    },
    profileResult,
    workoutsResult,
    totalsResult,
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("username").limit(1).maybeSingle(),
    supabase.from("workouts").select("*").order("created_at", { ascending: false }).limit(50),
    supabase
      .from("workouts")
      .select("pushups, exercise_type")
      .then(({ data, error }) => {
        console.log("[v0] Workouts data:", data)
        console.log("[v0] Workouts error:", error)

        const pushups =
          data
            ?.filter((w) => !w.exercise_type || w.exercise_type === "pushups")
            .reduce((sum, w) => sum + w.pushups, 0) || 0
        const squats = data?.filter((w) => w.exercise_type === "squats").reduce((sum, w) => sum + w.pushups, 0) || 0

        console.log("[v0] Total pushups:", pushups)
        console.log("[v0] Total squats:", squats)

        return { pushups, squats }
      }),
  ])

  if (!user) {
    redirect("/auth/login")
  }

  const { data: workouts, error } = workoutsResult

  console.log("[v0] Workouts result:", workouts)
  console.log("[v0] Workouts error:", error)

  if (error) {
    console.error("[v0] Error fetching workouts:", error)
  }

  return (
    <PushupTracker
      initialWorkouts={workouts || []}
      initialTotalPushups={totalsResult.pushups}
      initialTotalSquats={totalsResult.squats}
      username={profileResult.data?.username || user.email || ""}
    />
  )
}
