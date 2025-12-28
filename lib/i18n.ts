import { cookies } from "next/headers"
import type { Locale } from "@/i18n"

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  return (cookieStore.get("NEXT_LOCALE")?.value as Locale) || "en"
}

export async function setLocale(locale: Locale) {
  const cookieStore = await cookies()
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 365 * 24 * 60 * 60, // 1 year
  })
}
