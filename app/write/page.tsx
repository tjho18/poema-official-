import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { requireUser } from '@/lib/auth'
import { ensureUniqueSlug } from '@/lib/slug'
import PoemEditor from '@/components/PoemEditor'
import NavBar from '@/components/NavBar'

export const metadata = { title: 'Write — Poema' }
export const dynamic  = 'force-dynamic'

export default async function WritePage() {
  const { user, profile } = await requireUser()

  async function createPoem(formData: FormData) {
    'use server'
    const supabase = await createServerSupabaseClient()
    const { data: { user: me } } = await supabase.auth.getUser()
    if (!me) redirect('/signin')

    const title   = (formData.get('title') as string).trim()
    const content = (formData.get('content') as string)
    const tags    = (formData.get('tags') as string)
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
    const intent  = formData.get('intent') as string

    const slug = await ensureUniqueSlug(supabase, me.id, title)
    const isPublish = intent === 'publish'

    const { data: inserted } = await supabase.from('poems').insert({
      title,
      content,
      tags,
      slug,
      author_id: me.id,
      status: isPublish ? 'published' : 'draft',
      published_at: isPublish ? new Date().toISOString() : null,
    }).select('id').single()

    revalidatePath('/')
    revalidatePath('/explore')
    revalidatePath('/dashboard')
    if (profile.username) {
      revalidatePath(`/${profile.username}`)
      revalidatePath(`/${profile.username}/poems`)
      if (isPublish) revalidatePath(`/${profile.username}/p/${slug}`)
    }

    redirect(isPublish && profile.username
      ? `/${profile.username}/p/${slug}`
      : '/dashboard')
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 pt-20 pb-16 sm:py-24">
      <NavBar />
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-5 mb-12 border-b border-ink-text/10 pb-6">
          <Link href="/dashboard" className="font-body italic text-sm text-ink-muted hover:text-ink-text transition-colors">
            ← back
          </Link>
          <h1 className="font-display italic text-2xl text-ink-text tracking-wide">New poem</h1>
        </div>

        <PoemEditor action={createPoem} />
      </div>
    </div>
  )
}
