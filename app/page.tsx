import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy, TrendingUp, Users, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm fixed top-0 w-full z-50 bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">LEVEL FITNESS</span>
          </div>
          <nav className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
                <Zap className="w-4 h-4" />
                Level Up Your Fitness
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-balance leading-[0.9]">
              TRANSFORM
              <br />
              <span className="text-primary">WORKOUTS</span>
              <br />
              INTO POWER
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Track every rep. Level up your strength. Compete with athletes worldwide in the ultimate gamified training
              experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8 h-14 font-bold">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/sign-up">
                  <Button size="lg" className="text-lg px-8 h-14 font-bold">
                    Start Training Free
                  </Button>
                </Link>
              )}
              <Link href="/leaderboard">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 font-bold bg-transparent">
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y border-border/40">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-5xl font-black text-primary">10+</div>
              <div className="text-muted-foreground font-medium">Progressive Levels</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-black text-accent">1000+</div>
              <div className="text-muted-foreground font-medium">Reps Tracked</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-black text-primary">∞</div>
              <div className="text-muted-foreground font-medium">Potential Unlocked</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">LEVEL UP YOUR GAME</h2>
            <p className="text-xl text-muted-foreground">Every rep counts. Every level matters.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-card border border-border rounded-2xl p-8 space-y-4 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Progressive Leveling</h3>
              <p className="text-muted-foreground leading-relaxed">
                Start at Level 1 with just 10 reps. Each level requires 10x more. Watch your strength multiply
                exponentially across all your exercises.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border rounded-2xl p-8 space-y-4 hover:border-accent/50 transition-colors">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold">Real-Time Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Log your workouts instantly. See your progress visualized with dynamic charts and celebrate every
                milestone.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border rounded-2xl p-8 space-y-4 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Global Leaderboard</h3>
              <p className="text-muted-foreground leading-relaxed">
                Compete with athletes worldwide. Climb the ranks and prove your dedication to the grind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-balance">READY TO LEVEL UP?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the community of dedicated athletes pushing their limits every single day.
          </p>
          {user ? (
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-12 h-14 font-bold">
                Continue Training
              </Button>
            </Link>
          ) : (
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-lg px-12 h-14 font-bold">
                Start Your Journey
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">LEVEL FITNESS</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 Level Fitness. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
