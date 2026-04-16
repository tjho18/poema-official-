import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // We must re-create the response object whenever cookies are written,
  // so that Set-Cookie headers propagate back to the browser.
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
          // Must update both the request and response cookies
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

  // Refresh the session — keeps auth tokens alive on every request
  const { data: { session } } = await supabase.auth.getSession()

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isAdminRoot  = request.nextUrl.pathname === '/admin'

  // Protect all /admin sub-routes except /admin itself (which shows the login form)
  if (isAdminRoute && !isAdminRoot && !session) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // --- Future: subdomain detection stub ---
  // When poet accounts ship, read this header in layouts to serve per-poet content.
  const host = request.headers.get('host') ?? ''
  const subdomain = host.split('.')[0]
  const isSubdomain = host.includes('.') && subdomain !== 'www' && subdomain !== 'poema'
  if (isSubdomain) {
    response.headers.set('x-poet-slug', subdomain)
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    // Also run middleware on all routes so the subdomain header is set globally.
    // Exclude static files and Next internals for performance.
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
