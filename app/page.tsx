import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PushupTracker } from "@/components/pushup-tracker"

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single()

  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching workouts:", error)
  }

  const totalPushups = workouts?.reduce((sum, workout) => sum + workout.pushups, 0) || 0

  return (
    <PushupTracker
      initialWorkouts={workouts || []}
      initialTotal={totalPushups}
      username={profile?.username || user.email || ""}
    />
  )
}
