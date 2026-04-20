'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import PoemDisplay from '@/components/PoemDisplay'
import type { PublicPoem } from '@/types/poem'

interface Props {
  poems: PublicPoem[]
}

function pickRandom(poems: PublicPoem[], excludeId?: string): PublicPoem | null {
  const pool = poems.length > 1 ? poems.filter(p => p.id !== excludeId) : poems
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function HomeHeroClient({ poems }: Props) {
  const [currentPoem, setCurrentPoem] = useState<PublicPoem | null>(null)

  const cyclePoem = useCallback(() => {
    const next = pickRandom(poems, currentPoem?.id)
    if (next) setCurrentPoem(next)
  }, [poems, currentPoem?.id])

  useEffect(() => {
    setCurrentPoem(pickRandom(poems))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (poems.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="font-body italic text-ink-muted text-lg">No poems yet.</p>
      </div>
    )
  }

  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center w-full pt-24">
      <div className="flex-1 flex items-center justify-center w-full">
        {currentPoem ? (
          <div className="flex flex-col items-center">
            <PoemDisplay
              title={currentPoem.title}
              content={currentPoem.content}
              tags={currentPoem.tags}
              animate={true}
            />
            <p className="mt-10 font-body italic text-sm text-ink-muted tracking-wider">
              — <Link
                href={`/${currentPoem.author_username}`}
                className="hover:text-ink-text transition-colors"
              >
                {currentPoem.author_display_name || currentPoem.author_username}
              </Link>
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-16">
        <button
          onClick={cyclePoem}
          className="font-body italic text-xs text-ink-muted/60 hover:text-ink-muted transition-colors tracking-widest"
        >
          another poem
        </button>
      </div>
    </section>
  )
}
