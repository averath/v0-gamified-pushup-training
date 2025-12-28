import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { NextIntlClientProvider } from "next-intl"
import { getLocale } from "@/lib/i18n"
import "./globals.css"
import { Suspense } from "react"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = (await import(`@/messages/${locale}.json`)).default

  return (
    <html lang={locale}>
      <body className={`font-sans ${inter.variable} ${jetbrainsMono.variable}`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Suspense fallback={<div>Loading...</div>}>
            {children}
            <Analytics />
            <SpeedInsights />
          </Suspense>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
