import { redirect, notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

interface Props {
  params: Promise<{ id: string }>
}

// Legacy poem URL. Redirects to the canonical /{username}/p/{slug} form
// so links shared before the platform launch stay alive.
export default async function LegacyPoemRedirect({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: poem } = await supabase
    .from('poems')
    .select('slug, author_id')
    .eq('id', id)
    .maybeSingle<{ slug: string | null; author_id: string | null }>()

  if (!poem || !poem.slug || !poem.author_id) notFound()

  const { data: author } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', poem.author_id)
    .maybeSingle<{ username: string | null }>()

  if (!author?.username) notFound()

  redirect(`/${author.username}/p/${poem.slug}`)
}
