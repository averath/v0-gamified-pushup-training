"use client"

import Link from "next/link"
import {
  Zap,
  TrendingUp,
  Trophy,
  Target,
  Scroll,
  BarChart3,
  Globe,
  Smartphone,
  Share2,
  Flame,
  Calendar,
  Shield,
  Star,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { LEVEL_TIERS } from "@/lib/level-system"
import { useLanguage } from "@/lib/i18n/language-context"

const EXERCISE_META = [
  { id: "pushups", icon: "💪" },
  { id: "pullups", icon: "🏋️" },
  { id: "squats", icon: "🦵" },
  { id: "burpees", icon: "🔥" },
  { id: "planks", icon: "🧘" },
  { id: "running", icon: "🏃" },
]

const FEATURE_META = [
  {
    icon: TrendingUp,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Scroll,
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
  {
    icon: BarChart3,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Trophy,
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
  {
    icon: Target,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Share2,
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
  {
    icon: Smartphone,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Globe,
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
]

const TIER_ICONS: Record<string, string> = {
  Rookie: "🌱",
  Bronze: "🥉",
  Silver: "🥈",
  Gold: "🥇",
  Platinum: "💎",
  Diamond: "💠",
  Master: "⚔️",
  Grandmaster: "👑",
  Legend: "🔥",
}

export default function FeaturesPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm fixed top-0 w-full z-50 bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl tracking-tight">{t.app.name}</span>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/auth/sign-up">
              <Button>{t.hero.cta.start}</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 border-b border-border/40">
        <div className="container mx-auto max-w-6xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
            <Star className="w-4 h-4" />
            {t.featuresPage.badge}
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-balance leading-[0.9]">
            {t.featuresPage.title.line1}
            <br />
            <span className="text-primary">{t.featuresPage.title.line2}</span>
            <br />
            {t.featuresPage.title.line3}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">{t.featuresPage.subtitle}</p>
        </div>
      </section>

      {/* Main Feature Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {t.featuresPage.features.map((feature, index) => {
              const meta = FEATURE_META[index]
              const Icon = meta.icon
              return (
                <div
                  key={feature.title}
                  className={`bg-card border ${meta.border} rounded-2xl p-8 space-y-5 hover:border-opacity-60 transition-all group`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${meta.bg} rounded-xl flex items-center justify-center shrink-0`}>
                      <Icon className={`w-6 h-6 ${meta.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${meta.color}`} />
                        <span className="text-foreground">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Exercise Types */}
      <section className="py-16 px-4 border-y border-border/40 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-3">
              {t.featuresPage.exercisesTitle}
            </h2>
            <p className="text-muted-foreground text-lg">{t.featuresPage.exercisesSubtitle}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {t.featuresPage.exercises.map((ex, index) => (
              <div
                key={EXERCISE_META[index].id}
                className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/40 transition-colors"
              >
                <span className="text-4xl">{EXERCISE_META[index].icon}</span>
                <div>
                  <p className="font-bold text-foreground">{ex.name}</p>
                  <p className="text-xs text-muted-foreground">{ex.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Level Tiers */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-3">
              {t.featuresPage.rankTiersTitle}
            </h2>
            <p className="text-muted-foreground text-lg">{t.featuresPage.rankTiersSubtitle}</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
            {LEVEL_TIERS.map((tier) => (
              <div
                key={tier.name}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <span className="text-3xl">{TIER_ICONS[tier.name]}</span>
                <p className="text-xs font-bold text-foreground text-center">{tier.name}</p>
                <p className="text-xs text-muted-foreground text-center">
                  {t.common.levelPrefix}{tier.minLevel}
                  {tier.maxLevel !== Infinity ? `–${tier.maxLevel}` : "+"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quest types quick summary */}
      <section className="py-16 px-4 border-y border-border/40 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-3">{t.featuresPage.questChainsTitle}</h2>
            <p className="text-muted-foreground text-lg">
              {t.featuresPage.questChainsSubtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daily */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-lg uppercase tracking-wide">{t.featuresPage.quests.dailyTitle}</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex justify-between items-center">
                  <span>{t.featuresPage.quests.daily[0]}</span>
                  <span className="text-primary font-semibold">{t.featuresPage.quests.dailyXp[0]}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>{t.featuresPage.quests.daily[1]}</span>
                  <span className="text-primary font-semibold">{t.featuresPage.quests.dailyXp[1]}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>{t.featuresPage.quests.daily[2]}</span>
                  <span className="text-primary font-semibold">{t.featuresPage.quests.dailyXp[2]}</span>
                </li>
              </ul>
            </div>
            {/* Weekly */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-lg uppercase tracking-wide">{t.featuresPage.quests.weeklyTitle}</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex justify-between items-center">
                  <span>{t.featuresPage.quests.weekly[0]}</span>
                  <span className="text-primary font-semibold">{t.featuresPage.quests.weeklyXp[0]}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>{t.featuresPage.quests.weekly[1]}</span>
                  <span className="text-primary font-semibold">{t.featuresPage.quests.weeklyXp[1]}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>{t.featuresPage.quests.weekly[2]}</span>
                  <span className="text-primary font-semibold">{t.featuresPage.quests.weeklyXp[2]}</span>
                </li>
              </ul>
            </div>
            {/* Unlock mechanic */}
            <div className="bg-card border border-primary/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg uppercase tracking-wide">{t.featuresPage.quests.unlockTitle}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t.featuresPage.quests.unlockDescription}
              </p>
              <div className="flex items-center gap-2 text-xs text-primary font-medium">
                <Zap className="w-3 h-3" />
                {t.featuresPage.quests.unlockXp}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-balance">
            {t.featuresPage.ctaTitlePrefix} <span className="text-primary">{t.featuresPage.ctaTitleHighlight}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto text-pretty">
            {t.featuresPage.ctaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-lg px-10 h-14 font-bold">
                {t.hero.cta.start}
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button size="lg" variant="outline" className="text-lg px-10 h-14 font-bold bg-transparent">
                {t.hero.cta.leaderboard}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
