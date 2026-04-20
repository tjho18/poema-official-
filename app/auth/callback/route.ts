import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Handles both OAuth returns and email magic-link / confirmation returns.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  const supabase = await createServerSupabaseClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      // Re-surface to the signin page with a message.
      return NextResponse.redirect(`${origin}/signin?error=${encodeURIComponent(error.message)}`)
    }
  }

  // If the user doesn't have a username yet, send them to onboarding.
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.username) {
      return NextResponse.redirect(`${origin}/onboarding/username?next=${encodeURIComponent(next)}`)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
