import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { requireUser } from '@/lib/auth'
import { ensureUniqueSlug, slugify } from '@/lib/slug'
import PoemEditor from '@/components/PoemEditor'
import NavBar from '@/components/NavBar'
import type { Poem } from '@/types/poem'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata = { title: 'Edit — Poema' }
export const dynamic  = 'force-dynamic'

export default async function EditPoemPage({ params }: Props) {
  const { id } = await params
  const { user, profile, supabase } = await requireUser()

  const { data: poem } = await supabase
    .from('poems')
    .select('*')
    .eq('id', id)
    .eq('author_id', user.id)
    .maybeSingle<Poem>()

  if (!poem) notFound()

  async function updatePoem(formData: FormData) {
    'use server'
    const sb = await createServerSupabaseClient()
    const { data: { user: me } } = await sb.auth.getUser()
    if (!me) redirect('/signin')

    const title   = (formData.get('title') as string).trim()
    const content = (formData.get('content') as string)
    const tags    = (formData.get('tags') as string)
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
    const intent  = formData.get('intent') as string
    const isPublish = intent === 'publish'

    // Re-slug only if title changed enough to change the slug's root.
    let slug = poem!.slug
    const desired = slugify(title)
    const current = poem!.slug ?? ''
    const currentRoot = current.replace(/-\d+$/, '')
    if (!slug || (desired && desired !== currentRoot)) {
      slug = await ensureUniqueSlug(sb, me.id, title, id)
    }

    const updates: Record<string, unknown> = {
      title, content, tags, slug,
      status: isPublish ? 'published' : 'draft',
    }
    // First publish stamps published_at. Re-publishes preserve the existing timestamp.
    if (isPublish && !poem!.published_at) {
      updates.published_at = new Date().toISOString()
    }

    await sb.from('poems').update(updates).eq('id', id)

    revalidatePath('/')
    revalidatePath('/explore')
    revalidatePath('/dashboard')
    if (profile.username) {
      revalidatePath(`/${profile.username}`)
      revalidatePath(`/${profile.username}/poems`)
      revalidatePath(`/${profile.username}/p/${slug}`)
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
          <h1 className="font-display italic text-2xl text-ink-text tracking-wide">Edit poem</h1>
          <span className="ml-auto font-body italic text-xs text-ink-muted/70 tracking-widest uppercase">
            {poem.status}
          </span>
        </div>

        <PoemEditor initialData={poem} action={updatePoem} editing />
      </div>
    </div>
  )
}
