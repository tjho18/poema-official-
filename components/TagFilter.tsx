'use client'

// Tags as italic bracketed annotations — like editorial footnotes.
// Active tag: bold + underlined. Inactive: italic gray.
interface Props {
  tags: string[]
  active: string   // '' = all
  onChange: (tag: string) => void
}

export default function TagFilter({ tags, active, onChange }: Props) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center" role="group" aria-label="Filter by mood">
      {['all', ...tags].map(tag => {
        const isActive = tag === 'all' ? active === '' : active === tag
        return (
          <button
            key={tag}
            onClick={() => onChange(tag === 'all' ? '' : tag)}
            className={[
              'font-body text-sm transition-all duration-200 cursor-pointer',
              isActive
                ? 'font-bold not-italic text-ink-text border-b border-ink-text pb-px'
                : 'italic text-ink-muted hover:text-ink-text',
            ].join(' ')}
            aria-pressed={isActive}
          >
            [{tag}]
          </button>
        )
      })}
    </div>
  )
}
