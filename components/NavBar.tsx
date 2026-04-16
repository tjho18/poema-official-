import Link from 'next/link'

// Masthead-style navbar: thin bottom rule like a newspaper header.
// No color, no background tint — just type on white.
export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-4 bg-white/90 backdrop-blur-sm border-b border-ink-text/10">
      <Link
        href="/"
        className="font-display italic text-xl tracking-widest text-ink-text hover:opacity-60 transition-opacity"
      >
        Poema
      </Link>

      <div className="flex gap-8 text-sm text-ink-muted tracking-wider">
        <Link
          href="/explore"
          className="hover:text-ink-text transition-colors duration-200"
        >
          Explore
        </Link>
        <Link
          href="/admin"
          className="hover:text-ink-text transition-colors duration-200"
        >
          Admin
        </Link>
      </div>
    </nav>
  )
}
