"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy, TrendingUp, Users, Zap } from "lucide-react"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/lib/i18n/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { InstallPWAButton } from "@/components/install-pwa-button"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

function LandingPageContent() {
  const { t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient()

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm fixed top-0 w-full z-50 bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">LEVEL FITNESS</span>
          </div>
          <nav className="flex items-center gap-2">
            <InstallPWAButton />
            <LanguageSwitcher />
            <Link href="/features">
              <Button variant="ghost" className="hidden sm:inline-flex">Features</Button>
            </Link>
            {user ? (
              <Link href="/dashboard">
                <Button>{t.hero.cta.dashboard}</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">{t.nav.login}</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button>{t.nav.signup}</Button>
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
                {t.hero.badge}
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-balance leading-[0.9]">
              {t.hero.title.line1}
              <br />
              <span className="text-primary">{t.hero.title.line2}</span>
              <br />
              {t.hero.title.line3}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty">{t.hero.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8 h-14 font-bold">
                    {t.hero.cta.dashboard}
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/sign-up">
                  <Button size="lg" className="text-lg px-8 h-14 font-bold">
                    {t.hero.cta.start}
                  </Button>
                </Link>
              )}
              <Link href="/leaderboard">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 font-bold bg-transparent">
                  {t.hero.cta.leaderboard}
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
              <div className="text-muted-foreground font-medium">{t.hero.stats.levels}</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-black text-accent">1000+</div>
              <div className="text-muted-foreground font-medium">{t.hero.stats.reps}</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-black text-primary">∞</div>
              <div className="text-muted-foreground font-medium">{t.hero.stats.potential}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">{t.hero.features.title}</h2>
            <p className="text-xl text-muted-foreground">{t.hero.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-card border border-border rounded-2xl p-8 space-y-4 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">{t.hero.features.progressive.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{t.hero.features.progressive.description}</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border rounded-2xl p-8 space-y-4 hover:border-accent/50 transition-colors">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold">{t.hero.features.tracking.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{t.hero.features.tracking.description}</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border rounded-2xl p-8 space-y-4 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">{t.hero.features.leaderboard.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{t.hero.features.leaderboard.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-balance">{t.hero.cta2.title}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t.hero.cta2.subtitle}</p>
          {user ? (
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-12 h-14 font-bold">
                {t.hero.cta.continue}
              </Button>
            </Link>
          ) : (
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-lg px-12 h-14 font-bold">
                {t.hero.cta2.button}
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default function LandingPage() {
  return <LandingPageContent />
}
