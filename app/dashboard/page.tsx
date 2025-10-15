import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PushupTracker } from "@/components/pushup-tracker"

export const revalidate = 60

export default async function DashboardPage() {
  const supabase = await createClient()

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
      .then(({ data }) => {
        const pushups = data?.filter((w) => w.exercise_type === "pushups").reduce((sum, w) => sum + w.pushups, 0) || 0
        const squats = data?.filter((w) => w.exercise_type === "squats").reduce((sum, w) => sum + w.pushups, 0) || 0
        return { pushups, squats }
      }),
  ])

  if (!user) {
    redirect("/auth/login")
  }

  const { data: workouts, error } = workoutsResult

  if (error) {
    console.error("Error fetching workouts:", error)
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
