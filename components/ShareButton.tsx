'use client'

import { useState } from 'react'

interface Props {
  title: string
  poet: string
}

export default function ShareButton({ title, poet }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url  = window.location.href
    const text = `"${title}" by ${poet}`

    // Web Share API — opens native sheet on mobile (iOS/Android)
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url })
      } catch {
        // User dismissed the sheet — no action needed
      }
      return
    }

    // Fallback: copy link to clipboard on desktop
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked — silently fail
    }
  }

  return (
    <button
      onClick={handleShare}
      className="font-body italic text-xs text-ink-muted/60 hover:text-ink-muted tracking-widest transition-colors"
    >
      {copied ? 'link copied' : 'send this poem'}
    </button>
  )
}
