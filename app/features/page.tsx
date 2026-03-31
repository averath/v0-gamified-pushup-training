"use client"

import Link from "next/link"
import {
  Zap,
  TrendingUp,
  Trophy,
  Users,
  Target,
  Scroll,
  BarChart3,
  Globe,
  Smartphone,
  Volume2,
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

const EXERCISES = [
  { id: "pushups", icon: "💪", name: "Push-ups", description: "The classic upper-body builder" },
  { id: "pullups", icon: "🏋️", name: "Pull-ups", description: "Back and bicep strength" },
  { id: "squats", icon: "🦵", name: "Squats", description: "Full-leg compound movement" },
  { id: "burpees", icon: "🔥", name: "Burpees", description: "Full-body cardio blaster" },
  { id: "planks", icon: "🧘", name: "Planks", description: "Core stability & endurance" },
  { id: "running", icon: "🏃", name: "Running", description: "Cardio tracked in minutes" },
]

const FEATURES = [
  {
    icon: TrendingUp,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    title: "Progressive Leveling",
    description:
      "An exponential XP curve means early gains come fast but mastery takes real dedication. Each level requires 15% more XP than the last — a true test of consistency.",
    bullets: [
      "Smooth exponential XP curve",
      "300+ reachable levels",
      "Milestone levels at 10, 25, 50, 100…",
      "Per-exercise independent levels",
    ],
  },
  {
    icon: Scroll,
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
    title: "Quest System",
    description:
      "Daily and weekly quests keep every session purposeful. Complete quests to earn bonus XP and unlock harder challenge tiers by leveling up.",
    bullets: [
      "Daily & weekly quest chains",
      "Normal, Hard, and Epic tiers",
      "Bonus XP on completion",
      "Auto-resets each period",
    ],
  },
  {
    icon: BarChart3,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    title: "Detailed Statistics",
    description:
      "Deep-dive into your performance history. Streaks, personal bests, weekly charts, and activity summaries give you full visibility into your progress.",
    bullets: [
      "Weekly bar charts",
      "Current & longest streak",
      "Best set tracking",
      "Days active & workout rate",
    ],
  },
  {
    icon: Trophy,
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
    title: "Global Leaderboard",
    description:
      "Compete across a combined XP leaderboard or drill down into per-exercise rankings. See exactly where you stand against every athlete on the platform.",
    bullets: [
      "Combined XP leaderboard",
      "Per-exercise sub-leaderboards",
      "Live rank updates",
      "XP multipliers for effort",
    ],
  },
  {
    icon: Target,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    title: "Multi-Exercise Tracking",
    description:
      "Track six different exercise types, each with its own level and XP progression. Switch between exercises instantly and log time-based or rep-based workouts.",
    bullets: [
      "6 exercise types",
      "Rep-based & time-based",
      "Per-exercise XP multipliers",
      "Independent level progression",
    ],
  },
  {
    icon: Share2,
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
    title: "Share Your Results",
    description:
      "Generate a shareable card with your username, level, total XP, and workout count. Show off your progress on social media with one tap.",
    bullets: [
      "One-tap share card",
      "Shows level & XP",
      "Custom username badge",
      "Works on all platforms",
    ],
  },
  {
    icon: Smartphone,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    title: "Install as PWA",
    description:
      "Add Level Fitness to your home screen for a native app feel. Works offline, loads instantly, and sends you straight to your dashboard.",
    bullets: [
      "Installable on any device",
      "Home screen shortcut",
      "Fast load times",
      "No app store needed",
    ],
  },
  {
    icon: Globe,
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
    title: "Multilingual Support",
    description:
      "The entire app is available in English and Polish, including all exercise names, UI labels, and motivational copy. More languages coming soon.",
    bullets: [
      "English & Polish",
      "Translated exercise names",
      "Instant language switch",
      "Full UI coverage",
    ],
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
              <span className="font-bold text-xl tracking-tight">LEVEL FITNESS</span>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/auth/sign-up">
              <Button>Start Training Free</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 border-b border-border/40">
        <div className="container mx-auto max-w-6xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
            <Star className="w-4 h-4" />
            Everything you get
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-balance leading-[0.9]">
            BUILT FOR
            <br />
            <span className="text-primary">SERIOUS</span>
            <br />
            ATHLETES
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Every feature is designed to keep you accountable, motivated, and progressing. No fluff — just tools that
            make you stronger.
          </p>
        </div>
      </section>

      {/* Main Feature Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className={`bg-card border ${feature.border} rounded-2xl p-8 space-y-5 hover:border-opacity-60 transition-all group`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center shrink-0`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${feature.color}`} />
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
              6 EXERCISE TYPES
            </h2>
            <p className="text-muted-foreground text-lg">Each with independent leveling and XP tracking</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {EXERCISES.map((ex) => (
              <div
                key={ex.id}
                className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/40 transition-colors"
              >
                <span className="text-4xl">{ex.icon}</span>
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
              9 RANK TIERS
            </h2>
            <p className="text-muted-foreground text-lg">Climb from Rookie to Legend — each tier harder to reach than the last</p>
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
                  Lv.{tier.minLevel}
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
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-3">QUEST CHAINS</h2>
            <p className="text-muted-foreground text-lg">
              Complete base quests, level up, and unlock harder tiers for more XP
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daily */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-lg uppercase tracking-wide">Daily Quests</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex justify-between items-center">
                  <span>Daily Grind → Beast → Legend</span>
                  <span className="text-primary font-semibold">25–150 XP</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>First Session → Triple Session</span>
                  <span className="text-primary font-semibold">10–40 XP</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Big Set → Max Set</span>
                  <span className="text-primary font-semibold">35–80 XP</span>
                </li>
              </ul>
            </div>
            {/* Weekly */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-lg uppercase tracking-wide">Weekly Quests</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex justify-between items-center">
                  <span>Weekly Warrior → Perfect Week</span>
                  <span className="text-primary font-semibold">100–250 XP</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Volume King → Unstoppable</span>
                  <span className="text-primary font-semibold">150–600 XP</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Dedicated → Relentless</span>
                  <span className="text-primary font-semibold">120–275 XP</span>
                </li>
              </ul>
            </div>
            {/* Unlock mechanic */}
            <div className="bg-card border border-primary/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg uppercase tracking-wide">Unlock System</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Harder quest tiers are locked behind the previous tier. You must complete the base quest AND level up
                during the same period to unlock the upgraded version.
              </p>
              <div className="flex items-center gap-2 text-xs text-primary font-medium">
                <Zap className="w-3 h-3" />
                Earn up to 1,000+ XP per week
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-balance">
            READY TO <span className="text-primary">LEVEL UP?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto text-pretty">
            Start for free. No credit card required. Your first level-up is one workout away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-lg px-10 h-14 font-bold">
                Start Training Free
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button size="lg" variant="outline" className="text-lg px-10 h-14 font-bold bg-transparent">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
