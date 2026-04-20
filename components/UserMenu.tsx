'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface Props {
  username: string
  displayName: string
}

// A small identity chip that expands into a dropdown on click.
// No avatars for now — just initials.
export default function UserMenu({ username, displayName }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const initial = (displayName || username).trim().charAt(0).toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-8 h-8 rounded-full border border-ink-text/30 flex items-center justify-center font-display italic text-sm text-ink-text hover:border-ink-text transition-colors"
        aria-label="Account menu"
      >
        {initial}
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 w-56 bg-white border border-ink-text/10 rounded shadow-sm py-2 z-30"
        >
          <div className="px-4 py-2 border-b border-ink-text/10">
            <p className="font-display italic text-sm text-ink-text truncate">{displayName}</p>
            <p className="font-body text-xs text-ink-muted truncate">@{username}</p>
          </div>

          <MenuLink href={`/${username}`}>My page</MenuLink>
          <MenuLink href="/dashboard">Dashboard</MenuLink>
          <MenuLink href="/settings">Settings</MenuLink>

          <form action="/auth/signout" method="post" className="border-t border-ink-text/10 mt-2 pt-1">
            <button
              type="submit"
              className="block w-full text-left px-4 py-2 font-body text-sm text-ink-muted hover:text-ink-text hover:bg-black/[0.025] transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 font-body text-sm text-ink-text hover:bg-black/[0.025] transition-colors"
    >
      {children}
    </Link>
  )
}
