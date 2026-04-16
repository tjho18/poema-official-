'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // router.refresh() causes Next.js to re-run Server Components with the
    // newly set session cookie — the page will then show the dashboard.
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display italic text-3xl text-ink-text mb-1 text-center tracking-wide">
          Poema
        </h1>
        <p className="font-body italic text-ink-muted text-sm text-center mb-10">
          admin access
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block font-body text-sm text-ink-muted mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border border-ink-text/25 rounded px-4 py-2.5 text-ink-text font-body text-base focus:outline-none focus:border-ink-text transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-body text-sm text-ink-muted mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border border-ink-text/25 rounded px-4 py-2.5 text-ink-text font-body text-base focus:outline-none focus:border-ink-text transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-700 font-body text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-ink-text text-ink-text font-body px-4 py-2.5 rounded text-sm tracking-wider hover:bg-ink-text hover:text-white transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
