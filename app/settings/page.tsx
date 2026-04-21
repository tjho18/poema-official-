import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { requireUser } from '@/lib/auth'
import NavBar from '@/components/NavBar'

export const metadata = { title: 'Settings — Poema' }
export const dynamic  = 'force-dynamic'

export default async function SettingsPage() {
  const { user, profile } = await requireUser()

  async function updateDisplayName(formData: FormData) {
    'use server'
    const supabase = await createServerSupabaseClient()
    const { data: { user: me } } = await supabase.auth.getUser()
    if (!me) redirect('/signin')

    const displayName = (formData.get('display_name') as string).trim()
    await supabase
      .from('profiles')
      .update({ display_name: displayName || null })
      .eq('id', me.id)

    revalidatePath('/settings')
    revalidatePath('/dashboard')
    if (profile.username) revalidatePath(`/${profile.username}`)
    redirect('/settings')
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 pt-20 pb-16 sm:py-24">
      <NavBar />
      <div className="max-w-md mx-auto">

        <div className="mb-12 border-b border-ink-text/10 pb-6">
          <h1 className="font-display italic text-2xl text-ink-text tracking-wide">Settings</h1>
          <p className="font-body italic text-ink-muted text-xs mt-1">@{profile.username}</p>
        </div>

        <form action={updateDisplayName} className="space-y-8">
          <div>
            <label htmlFor="display_name" className="block font-body italic text-sm text-ink-muted mb-2">
              Display name
              <span className="ml-2 text-ink-muted/50 not-italic text-xs">
                how your name appears to readers
              </span>
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              defaultValue={profile.display_name ?? ''}
              placeholder={profile.username ?? ''}
              maxLength={60}
              className="w-full bg-transparent border-b border-ink-text/30 pb-2 text-ink-text font-display italic text-xl focus:outline-none focus:border-ink-text transition-colors placeholder:text-ink-muted/30"
            />
            <p className="mt-2 font-body text-xs text-ink-muted/60">
              If left blank, your username <span className="italic">@{profile.username}</span> is shown instead.
            </p>
          </div>

          <button
            type="submit"
            className="border border-ink-text bg-ink-text text-white font-body px-7 py-2 rounded text-sm tracking-wider hover:opacity-80 transition-opacity duration-200"
          >
            Save
          </button>
        </form>

      </div>
    </div>
  )
}
