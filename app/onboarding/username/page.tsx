import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import UsernamePicker from '@/components/UsernamePicker'

export const metadata = { title: 'Choose a name — Poema' }
export const dynamic = 'force-dynamic'

export default async function OnboardingUsernamePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('id', user.id)
    .maybeSingle<{ username: string | null; display_name: string | null }>()

  if (profile?.username) redirect('/')

  return (
    <Suspense>
      <UsernamePicker
        userId={user.id}
        initialDisplayName={profile?.display_name ?? ''}
      />
    </Suspense>
  )
}
