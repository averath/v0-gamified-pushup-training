import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Pushup Track - Gamified Fitness Training",
  description:
    "Transform push-ups into power. Track every rep, level up your strength, and compete with athletes worldwide in the ultimate gamified training experience.",
  generator: "v0.app",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pushup-track.vercel.app"),
  openGraph: {
    title: "Pushup Track - Gamified Fitness Training",
    description:
      "Transform push-ups into power. Track every rep, level up your strength, and compete with athletes worldwide.",
    type: "website",
    locale: "en_US",
    siteName: "Pushup Track",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Pushup Track - Gamified Fitness Training",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pushup Track - Gamified Fitness Training",
    description:
      "Transform push-ups into power. Track every rep, level up your strength, and compete with athletes worldwide.",
    images: ["/og-image.jpg"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
          <Analytics />
          <SpeedInsights />
        </Suspense>
      </body>
    </html>
  )
}
