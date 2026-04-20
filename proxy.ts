import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require a signed-in user. Paths matching these prefixes
// bounce to /signin?next=<path> when unauthenticated.
const AUTH_REQUIRED_PREFIXES = [
  '/write',
  '/dashboard',
  '/settings',
  '/following',
  '/bookmarks',
]

// If an authenticated user has no username yet, we funnel them to onboarding.
// These paths are allowed during that funnel so the funnel itself, auth flows,
// and signout stay reachable.
const ONBOARDING_ALLOWED_PREFIXES = [
  '/onboarding',
  '/auth',
  '/signout',
]

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh the session cookie if expiring.
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const needsAuth = AUTH_REQUIRED_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))

  if (needsAuth && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // If signed in, make sure they've picked a username before using the app.
  if (user) {
    const inAllowedFunnel = ONBOARDING_ALLOWED_PREFIXES.some(
      p => pathname === p || pathname.startsWith(p + '/'),
    )
    if (!inAllowedFunnel) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle()
      if (!profile?.username) {
        const url = request.nextUrl.clone()
        url.pathname = '/onboarding/username'
        return NextResponse.redirect(url)
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    // Run on everything except Next internals, static assets, and the cron route
    // (which authenticates itself via bearer token).
    '/((?!_next/static|_next/image|favicon.ico|api/cron).*)',
  ],
}
