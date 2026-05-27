"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/language-context"
import { useEffect, useState } from "react"

export default function AuthErrorPage() {
  const { t } = useLanguage()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(new URLSearchParams(window.location.search).get("error"))
  }, [])

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">{t.auth.error.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error ? (
                <p className="text-sm text-muted-foreground">
                  {t.auth.error.prefix} {error}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">{t.auth.error.fallback}</p>
              )}
              <Button asChild className="w-full">
                <Link href="/auth/login">{t.common.backToLogin}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
