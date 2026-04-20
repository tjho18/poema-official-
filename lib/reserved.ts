// Reserved usernames — mirrors the DB reserved_slugs table.
// Keep in sync with supabase/migrations/0001_platform.sql.
// The DB trigger is the hard guarantee; this is a UX niceness so
// users get immediate feedback without a round-trip.
export const RESERVED_SLUGS = new Set<string>([
  'signin', 'signup', 'signout', 'auth', 'write', 'settings',
  'following', 'bookmarks', 'explore', 'dashboard', 'admin',
  'api', 'poems', 'collections', 'p', 'c', 'about', 'terms',
  'privacy', 'help', 'search', 'notifications', 'home', 'new',
  'edit', 'drafts', 'static', '_next', 'favicon.ico',
  'onboarding', 'poema', 'www',
])

export function isReserved(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase())
}

// Same shape check as the DB constraint: lowercase alphanumerics + underscore, 2-30 chars.
export const USERNAME_SHAPE = /^[a-z0-9_]{2,30}$/
