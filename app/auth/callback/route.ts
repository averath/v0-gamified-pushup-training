import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Check if this is a password recovery flow
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // If it's a password reset, redirect to reset-password page
        // The user will have a session now, so they can update their password
        if (requestUrl.searchParams.get('type') === 'recovery') {
          return NextResponse.redirect(new URL('/auth/reset-password', requestUrl.origin))
        }
        
        return NextResponse.redirect(new URL(next, requestUrl.origin))
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth/error', requestUrl.origin))
}
