import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PushupTracker } from "@/components/pushup-tracker"

export const revalidate = 60 // Revalidate every 60 seconds

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    {
      data: { user },
    },
    profileResult,
    workoutsResult,
    totalResult,
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("username").limit(1).maybeSingle(),
    supabase.from("workouts").select("*").order("created_at", { ascending: false }).limit(50),
    supabase
      .from("workouts")
      .select("pushups")
      .then(({ data }) => data?.reduce((sum, w) => sum + w.pushups, 0) || 0),
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
      initialTotal={totalResult}
      username={profileResult.data?.username || user.email || ""}
    />
  )
}
