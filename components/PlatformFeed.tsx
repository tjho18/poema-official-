import PoemCard from '@/components/PoemCard'
import type { PublicPoem } from '@/types/poem'

interface Props {
  poems: PublicPoem[]
}

// The "recent poems from the platform" strip below the hero.
// Intentionally quiet — no filters, no pagination, just presence.
export default function PlatformFeed({ poems }: Props) {
  if (poems.length === 0) return null

  return (
    <section className="w-full max-w-4xl mx-auto mt-24 mb-16 border-t border-ink-text/10 pt-16">
      <p className="font-body italic text-xs text-ink-muted/70 tracking-widest mb-8 text-center uppercase">
        Recently published
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {poems.map(p => (
          <PoemCard
            key={p.id}
            poem={p}
            byline={{ username: p.author_username, displayName: p.author_display_name }}
          />
        ))}
      </div>
    </section>
  )
}
