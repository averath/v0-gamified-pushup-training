export const translations = {
  en: {
    workoutTypes: {
      pushups: "Push-ups",
      pullups: "Pull-ups",
      squats: "Squats",
      running: "Running",
      planks: "Planks",
      burpees: "Burpees",
    },
    hero: {
      badge: "Level Up Your Fitness",
      title: {
        line1: "TRANSFORM",
        line2: "WORKOUTS",
        line3: "INTO POWER",
      },
      subtitle:
        "Track every rep. Level up your strength. Compete with athletes worldwide in the ultimate gamified training experience.",
      cta: {
        start: "Start Training Free",
        dashboard: "Go to Dashboard",
        continue: "Continue Training",
        leaderboard: "View Leaderboard",
      },
      stats: {
        levels: "Progressive Levels",
        reps: "Reps Tracked",
        potential: "Potential Unlocked",
      },
      features: {
        title: "LEVEL UP YOUR GAME",
        subtitle: "Every rep counts. Every level matters.",
        progressive: {
          title: "Progressive Leveling",
          description:
            "Start at Level 1 with just 10 reps. Each level requires 10x more. Watch your strength multiply exponentially across all your exercises.",
        },
        tracking: {
          title: "Real-Time Tracking",
          description:
            "Log your workouts instantly. See your progress visualized with dynamic charts and celebrate every milestone.",
        },
        leaderboard: {
          title: "Global Leaderboard",
          description: "Compete with athletes worldwide. Climb the ranks and prove your dedication to the grind.",
        },
      },
      cta2: {
        title: "READY TO LEVEL UP?",
        subtitle: "Join the community of dedicated athletes pushing their limits every single day.",
        button: "Start Your Journey",
      },
    },
    nav: {
      login: "Log in",
      signup: "Sign up",
    },
  },
  pl: {
    workoutTypes: {
      pushups: "Pompki",
      pullups: "Podciąganie",
      squats: "Przysiady",
      running: "Bieganie",
      planks: "Deski",
      burpees: "Burpees",
    },
    hero: {
      badge: "Rozwijaj Swoją Formę",
      title: {
        line1: "PRZEKSZTAŁĆ",
        line2: "TRENINGI",
        line3: "W MOC",
      },
      subtitle:
        "Śledź każde powtórzenie. Rozwijaj swoją siłę. Rywalizuj z sportowcami na całym świecie w najlepszym zgamifikowanym doświadczeniu treningowym.",
      cta: {
        start: "Zacznij Trening Za Darmo",
        dashboard: "Przejdź do Panelu",
        continue: "Kontynuuj Trening",
        leaderboard: "Zobacz Ranking",
      },
      stats: {
        levels: "Poziomów Progresji",
        reps: "Śledzonych Powtórzeń",
        potential: "Odblokowany Potencjał",
      },
      features: {
        title: "ROZWIJAJ SWOJĄ GRĘ",
        subtitle: "Każde powtórzenie się liczy. Każdy poziom ma znaczenie.",
        progressive: {
          title: "Progresywny System Poziomów",
          description:
            "Zacznij od Poziomu 1 z zaledwie 10 powtórzeniami. Każdy poziom wymaga 10x więcej. Obserwuj jak Twoja siła rośnie wykładniczo we wszystkich ćwiczeniach.",
        },
        tracking: {
          title: "Śledzenie w Czasie Rzeczywistym",
          description:
            "Loguj swoje treningi natychmiast. Zobacz swój postęp zwizualizowany na dynamicznych wykresach i świętuj każdy kamień milowy.",
        },
        leaderboard: {
          title: "Globalny Ranking",
          description:
            "Rywalizuj ze sportowcami z całego świata. Wspinaj się w rankingu i udowodnij swoje zaangażowanie.",
        },
      },
      cta2: {
        title: "GOTOWY NA WYŻSZY POZIOM?",
        subtitle: "Dołącz do społeczności oddanych sportowców przekraczających swoje granice każdego dnia.",
        button: "Rozpocznij Swoją Podróż",
      },
    },
    nav: {
      login: "Zaloguj się",
      signup: "Zarejestruj się",
    },
  },
} as const

export type Language = keyof typeof translations
export type TranslationKey = typeof translations.en
