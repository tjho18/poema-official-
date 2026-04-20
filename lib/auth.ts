import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Profile } from '@/types/profile'

// Returns the authenticated user + their profile, or redirects to /signin.
// Use in Server Components for any route that requires auth.
export async function requireUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  // If somehow the profile row doesn't exist (trigger failed), bounce to onboarding.
  if (!profile) redirect('/onboarding/username')

  // If username not chosen yet, bounce to onboarding.
  if (!profile.username) redirect('/onboarding/username')

  return { user, profile, supabase }
}

// Returns the current user + profile WITHOUT redirecting.
// Use in Server Components that render differently for signed-in users
// (e.g. NavBar, homepage) but don't require auth.
export async function getCurrentProfile(): Promise<{
  user: { id: string; email?: string } | null
  profile: Profile | null
}> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, profile: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  return { user: { id: user.id, email: user.email }, profile: profile ?? null }
}
