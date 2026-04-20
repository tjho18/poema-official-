import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Poem, PublicPoem } from '@/types/poem'
import type { Profile } from '@/types/profile'

// Platform-wide feed: latest published poems across all poets.
export async function getRecentPlatformPoems(limit = 30): Promise<PublicPoem[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('public_poems')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at',   { ascending: false })
    .limit(limit)
  return (data as PublicPoem[]) ?? []
}

// The hero poem on the homepage — we load the latest N and let the client
// pick a random one (keeps the "another poem" cycle quick without re-fetch).
export async function getHeroPool(limit = 40): Promise<PublicPoem[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('public_poems')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at',   { ascending: false })
    .limit(limit)
  return (data as PublicPoem[]) ?? []
}

// Look up a poet's profile by username (case-insensitive).
export async function getPoetByUsername(username: string): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .maybeSingle<Profile>()
  return data ?? null
}

// All published poems by a given poet.
export async function getPoemsByPoet(authorId: string): Promise<Poem[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('poems')
    .select('*')
    .eq('author_id', authorId)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at',   { ascending: false })
  return (data as Poem[]) ?? []
}

// Fetch a specific poem by author + slug, but only if it's readable
// under RLS (either published-and-due, or the current user owns it).
export async function getPoemByAuthorAndSlug(
  authorId: string,
  slug: string,
): Promise<Poem | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('poems')
    .select('*')
    .eq('author_id', authorId)
    .eq('slug', slug)
    .maybeSingle<Poem>()
  return data ?? null
}

// All of a user's own poems (any status) — for dashboard.
export async function getMyPoems(userId: string): Promise<Poem[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('poems')
    .select('*')
    .eq('author_id', userId)
    .order('updated_at', { ascending: false })
  return (data as Poem[]) ?? []
}
