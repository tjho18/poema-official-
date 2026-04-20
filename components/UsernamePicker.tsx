'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { USERNAME_SHAPE, isReserved } from '@/lib/reserved'

type State =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'taken' }
  | { kind: 'invalid'; reason: string }
  | { kind: 'available' }

interface Props {
  userId: string
  initialDisplayName?: string
}

export default function UsernamePicker({ userId, initialDisplayName = '' }: Props) {
  const router  = useRouter()
  const search  = useSearchParams()
  const next    = search.get('next') ?? '/'
  const supabase = createClient()

  const [username, setUsername]    = useState('')
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [state, setState]          = useState<State>({ kind: 'idle' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]          = useState('')

  // Debounced availability check.
  useEffect(() => {
    const value = username.trim().toLowerCase()
    if (!value) { setState({ kind: 'idle' }); return }
    if (!USERNAME_SHAPE.test(value)) {
      setState({ kind: 'invalid', reason: 'lowercase letters, numbers, and underscores only (2–30 chars)' })
      return
    }
    if (isReserved(value)) {
      setState({ kind: 'invalid', reason: 'that name is reserved — try another' })
      return
    }

    setState({ kind: 'checking' })
    const handle = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', value)
        .maybeSingle()
      setState(data ? { kind: 'taken' } : { kind: 'available' })
    }, 300)

    return () => clearTimeout(handle)
  }, [username, supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (state.kind !== 'available') return
    setSubmitting(true); setError('')

    const value = username.trim().toLowerCase()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username: value,
        display_name: displayName.trim() || null,
      })
      .eq('id', userId)

    if (updateError) {
      setError(updateError.message)
      setSubmitting(false)
      return
    }

    // Full page refresh so middleware and server components re-read the profile.
    router.push(next)
    router.refresh()
  }

  const hint =
    state.kind === 'checking'  ? 'checking…'      :
    state.kind === 'taken'     ? 'already taken'  :
    state.kind === 'invalid'   ? state.reason     :
    state.kind === 'available' ? 'available'      : ''

  const hintTone =
    state.kind === 'available' ? 'text-ink-text'
    : state.kind === 'idle' || state.kind === 'checking'
      ? 'text-ink-muted/70'
      : 'text-red-700'

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display italic text-3xl text-ink-text mb-1 text-center tracking-wide">
          Choose a name
        </h1>
        <p className="font-body italic text-ink-muted text-sm text-center mb-10">
          this is how readers will find you
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="display" className="block font-body text-sm text-ink-muted mb-1.5">
              Display name
            </label>
            <input
              id="display"
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. Alice Nguyen"
              className="w-full bg-transparent border border-ink-text/25 rounded px-4 py-2.5 text-ink-text font-body text-base focus:outline-none focus:border-ink-text transition-colors placeholder:text-ink-muted/40"
            />
          </div>

          <div>
            <label htmlFor="username" className="block font-body text-sm text-ink-muted mb-1.5">
              Username
              <span className="ml-2 text-ink-muted/50 text-xs">poema.app/<em>{username.trim() || 'yourname'}</em></span>
            </label>
            <input
              id="username"
              type="text"
              required
              autoComplete="off"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase())}
              placeholder="yourname"
              className="w-full bg-transparent border border-ink-text/25 rounded px-4 py-2.5 text-ink-text font-body text-base focus:outline-none focus:border-ink-text transition-colors placeholder:text-ink-muted/40"
            />
            {hint && (
              <p className={`mt-1.5 font-body italic text-xs ${hintTone}`}>{hint}</p>
            )}
          </div>

          {error && <p className="text-red-700 font-body text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting || state.kind !== 'available'}
            className="w-full border border-ink-text text-ink-text font-body px-4 py-2.5 rounded text-sm tracking-wider hover:bg-ink-text hover:text-white transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? '…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
