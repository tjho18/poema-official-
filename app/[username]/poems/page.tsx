import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getPoetByUsername, getPoemsByPoet } from '@/lib/queries'
import NavBar from '@/components/NavBar'
import GradientBackground from '@/components/GradientBackground'

interface Props {
  params: Promise<{ username: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const poet = await getPoetByUsername(username)
  if (!poet?.username) return { title: 'Not found — Poema' }
  const name = poet.display_name || poet.username
  return { title: `All poems by ${name} — Poema` }
}

export default async function PoetPoemsPage({ params }: Props) {
  const { username } = await params
  const poet = await getPoetByUsername(username)
  if (!poet?.username) notFound()
  if (username !== poet.username) redirect(`/${poet.username}/poems`)

  const poems = await getPoemsByPoet(poet.id)
  const displayName = poet.display_name || poet.username

  return (
    <div className="min-h-screen px-6 py-24">
      <GradientBackground />
      <NavBar />

      <div className="max-w-4xl mx-auto">
        {/* Header — name only, no bio per spec */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-3xl text-ink-accent mb-3 tracking-wide">
            All Poems by {displayName}
          </h1>
          <p className="font-body text-ink-muted text-sm">
            {poems.length} {poems.length === 1 ? 'poem' : 'poems'}
          </p>
        </div>

        {poems.length === 0 ? (
          <p className="text-center font-body text-ink-muted mt-20">No poems yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {poems.map(poem => (
              <Link
                key={poem.id}
                href={`/${poet.username}/p/${poem.slug}`}
                className="group block px-6 py-7 rounded hover:bg-black/[0.025] transition-colors duration-300"
              >
                <h2 className="font-display italic font-semibold text-lg text-ink-text mb-4 group-hover:opacity-70 transition-opacity duration-200">
                  {poem.title}
                </h2>
                <p className="font-body text-ink-muted text-base leading-relaxed whitespace-pre-line line-clamp-3">
                  {poem.content.split('\n').slice(0, 3).join('\n')}
                </p>
                {poem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-5">
                    {poem.tags.map(tag => (
                      <span key={tag} className="font-body italic text-xs text-ink-muted/70">
                        [{tag}]
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-16">
          <Link
            href={`/${poet.username}`}
            className="font-body italic text-xs text-ink-muted/60 hover:text-ink-muted tracking-widest transition-colors"
          >
            ← back to {displayName}
          </Link>
        </div>
      </div>
    </div>
  )
}
