'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface Props {
  poetId: string
  initialFollowing: boolean
  followerCount: number
}

export default function FollowButton({ poetId, initialFollowing, followerCount }: Props) {
  const [following, setFollowing] = useState(initialFollowing)
  const [count, setCount] = useState(followerCount)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const me = data.user?.id ?? null
      setUserId(me)
      if (!me) return
      // Re-check follow state
      supabase
        .from('follows')
        .select('follower_id', { count: 'exact', head: true })
        .eq('follower_id', me)
        .eq('followee_id', poetId)
        .then(({ count: c }) => {
          setFollowing((c ?? 0) > 0)
        })
    })
  }, [poetId])

  // Still loading auth state
  if (userId === undefined) return null

  // Not logged in: show link to signin
  if (userId === null) {
    return (
      <span className="font-body italic text-sm text-ink-muted">
        <Link href="/signin" className="hover:text-ink-text transition-colors">
          follow
        </Link>
        <span className="ml-2 text-ink-muted/50 text-xs">{count}</span>
      </span>
    )
  }

  // Don't render for own page — handled by parent, but guard here too
  if (userId === poetId) return null

  async function toggle() {
    if (loading || !userId) return
    setLoading(true)
    const supabase = createClient()
    if (following) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', userId)
        .eq('followee_id', poetId)
      setFollowing(false)
      setCount(c => Math.max(0, c - 1))
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: userId, followee_id: poetId })
      setFollowing(true)
      setCount(c => c + 1)
    }
    setLoading(false)
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={toggle}
        disabled={loading}
        className={`font-body italic text-sm transition-colors ${
          following ? 'text-ink-text' : 'text-ink-muted hover:text-ink-text'
        }`}
      >
        {following ? 'following' : 'follow'}
      </button>
      <span className="font-body text-xs text-ink-muted/50">{count}</span>
    </span>
  )
}
