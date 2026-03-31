import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-8 px-4 mt-auto">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Made with <span className="text-red-500">❤️</span> by Konrad
          </p>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/leaderboard" className="hover:text-foreground transition-colors">
              Leaderboard
            </Link>
            <Link href="/auth/sign-up" className="hover:text-foreground transition-colors">
              Sign up
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
