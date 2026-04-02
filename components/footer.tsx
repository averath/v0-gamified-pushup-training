import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-8 px-4 mt-auto">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Made with <span className="text-red-500">❤️</span> by Konrad
            </p>
            <a
              href="https://buycoffee.to/pushupmaster"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="https://buycoffee.to/static/img/share/share-button-primary.png"
                width={175}
                height={46}
                alt="Buy me a coffee on buycoffee.to"
                className="hover:opacity-90 transition-opacity"
              />
            </a>
          </div>
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
