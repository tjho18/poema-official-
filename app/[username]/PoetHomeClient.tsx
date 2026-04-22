'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import PoemDisplay from '@/components/PoemDisplay'
import ShareButton from '@/components/ShareButton'
import FollowButton from '@/components/FollowButton'
import type { Poem } from '@/types/poem'

interface Props {
  poems: Poem[]
  username: string
  displayName: string
  bio: string | null
  poetId: string
  viewerIsOwner: boolean
  initialFollowing: boolean
  followerCount: number
}

function pickRandom(poems: Poem[], excludeId?: string): Poem | null {
  const pool = poems.length > 1 ? poems.filter(p => p.id !== excludeId) : poems
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

type Tab = 'poem' | 'about'

export default function PoetHomeClient({
  poems,
  username,
  displayName,
  bio,
  poetId,
  viewerIsOwner,
  initialFollowing,
  followerCount,
}: Props) {
  const [currentPoem, setCurrentPoem] = useState<Poem | null>(null)
  const [tab, setTab] = useState<Tab>('poem')

  const cyclePoem = useCallback(() => {
    const next = pickRandom(poems, currentPoem?.id)
    if (next) setCurrentPoem(next)
  }, [poems, currentPoem?.id])

  useEffect(() => {
    setCurrentPoem(pickRandom(poems))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (poems.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
        <h1 className="font-display italic text-3xl text-ink-text mb-3 tracking-wide">{displayName}</h1>
        <p className="font-body italic text-ink-muted text-lg">No poems yet.</p>
      </div>
    )
  }

  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center w-full pt-24 pb-12">
      {/* Tab switcher */}
      <div className="flex items-center gap-3 mb-10 font-body italic text-sm text-ink-muted/60">
        <button
          onClick={() => setTab('poem')}
          className={`transition-colors ${tab === 'poem' ? 'text-ink-muted' : 'hover:text-ink-muted/80'}`}
        >
          poem
        </button>
        <span className="text-ink-muted/30">·</span>
        <button
          onClick={() => setTab('about')}
          className={`transition-colors ${tab === 'about' ? 'text-ink-muted' : 'hover:text-ink-muted/80'}`}
        >
          about
        </button>
      </div>

      {tab === 'poem' ? (
        <>
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
                  — {displayName}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col items-center gap-5 mt-16">
            <button
              onClick={cyclePoem}
              className="font-body italic text-sm text-ink-muted/60 hover:text-ink-muted transition-colors tracking-widest"
            >
              another poem
            </button>

            {currentPoem?.slug && (
              <ShareButton
                title={currentPoem.title}
                poet={displayName}
                url={`${typeof window !== 'undefined' ? window.location.origin : ''}/${username}/p/${currentPoem.slug}`}
                className="font-body italic text-sm text-ink-muted/60 hover:text-ink-muted transition-colors tracking-widest"
              />
            )}

            <Link
              href={`/${username}/poems`}
              className="font-body italic text-sm text-ink-muted/60 hover:text-ink-muted transition-colors tracking-widest"
            >
              all poems →
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-6 max-w-sm w-full px-4">
          <h2 className="font-display italic text-2xl text-ink-text tracking-wide">
            {displayName}
          </h2>

          {!viewerIsOwner && (
            <FollowButton
              poetId={poetId}
              initialFollowing={initialFollowing}
              followerCount={followerCount}
            />
          )}

          {bio ? (
            <p className="font-body italic text-sm text-ink-muted text-center leading-relaxed">
              {bio}
            </p>
          ) : (
            <p className="font-body italic text-sm text-ink-muted/30 text-center">
              no bio yet
            </p>
          )}
        </div>
      )}
    </section>
  )
}
