"use client"

import { useLanguage } from "@/lib/i18n/language-context"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <Button variant="ghost" size="sm" onClick={() => setLanguage(language === "en" ? "pl" : "en")} className="gap-2">
      <Globe className="w-4 h-4" />
      <span className="font-medium">{language === "en" ? "PL" : "EN"}</span>
    </Button>
  )
}
