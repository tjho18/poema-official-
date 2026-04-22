import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import NavBar from '@/components/NavBar'
import GradientBackground from '@/components/GradientBackground'
import PoemCard from '@/components/PoemCard'
import type { PublicPoem } from '@/types/poem'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ tag?: string }>
}

export default async function ExplorePage({ searchParams }: Props) {
  const { tag } = await searchParams
  const activeTag = tag ?? ''
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('public_poems')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at',   { ascending: false })

  if (activeTag) query = query.contains('tags', [activeTag])

  const { data, error } = await query
  const poems: PublicPoem[] = error ? [] : ((data ?? []) as PublicPoem[])

  const { data: allData } = await supabase.from('public_poems').select('tags')
  const allTags = [...new Set((allData ?? []).flatMap((p: { tags: string[] }) => p.tags))].sort()

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-20 pb-16 sm:py-24">
      <GradientBackground />
      <NavBar />

      <div className="max-w-xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="font-display text-3xl text-ink-accent mb-3 tracking-wide">
            Explore
          </h1>
          <p className="font-body text-ink-muted text-sm">
            {poems.length} {poems.length === 1 ? 'poem' : 'poems'}
            {activeTag && ` tagged "${activeTag}"`}
          </p>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center mb-12" role="group" aria-label="Filter by mood">
            <Link
              href="/explore"
              className={[
                'font-body text-sm transition-all duration-200',
                !activeTag
                  ? 'font-bold not-italic text-ink-text border-b border-ink-text pb-px'
                  : 'italic text-ink-muted hover:text-ink-text',
              ].join(' ')}
            >
              [all]
            </Link>
            {allTags.map(tag => (
              <Link
                key={tag}
                href={`/explore?tag=${encodeURIComponent(tag)}`}
                className={[
                  'font-body text-sm transition-all duration-200',
                  activeTag === tag
                    ? 'font-bold not-italic text-ink-text border-b border-ink-text pb-px'
                    : 'italic text-ink-muted hover:text-ink-text',
                ].join(' ')}
              >
                [{tag}]
              </Link>
            ))}
          </div>
        )}

        {poems.length === 0 ? (
          <p className="text-center font-body text-ink-muted mt-20">
            {activeTag ? `No poems tagged "${activeTag}" yet.` : 'No poems yet.'}
          </p>
        ) : (
          <div className="divide-y divide-ink-text/10">
            {poems.map(poem => (
              <PoemCard
                key={poem.id}
                poem={poem}
                byline={{
                  username:    poem.author_username,
                  displayName: poem.author_display_name,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
