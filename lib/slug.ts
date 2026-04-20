// Slugify a title into a URL-safe segment.
// Collapses whitespace and punctuation to single hyphens, lowercases.
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')   // strip diacritics
    .replace(/['']/g, '')              // apostrophes disappear rather than becoming hyphens
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// Given a desired base slug and an author, find a unique slug by
// appending -2, -3, ... if needed. Pass the Supabase client so this
// works in Server Actions and route handlers alike.
import type { SupabaseClient } from '@supabase/supabase-js'

export async function ensureUniqueSlug(
  supabase: SupabaseClient,
  authorId: string,
  base: string,
  excludePoemId?: string,
): Promise<string> {
  const root = slugify(base) || 'untitled'
  let candidate = root
  let n = 1

  while (true) {
    let q = supabase
      .from('poems')
      .select('id')
      .eq('author_id', authorId)
      .eq('slug', candidate)
    if (excludePoemId) q = q.neq('id', excludePoemId)
    const { data } = await q.maybeSingle()
    if (!data) return candidate
    n += 1
    candidate = `${root}-${n}`
  }
}
