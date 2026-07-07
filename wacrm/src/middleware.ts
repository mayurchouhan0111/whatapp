import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // getUser() transparently refreshes an expired access token, which
  // ROTATES the refresh token and writes the new cookies onto
  // `supabaseResponse` via setAll() above. Any response we return in
  // place of `supabaseResponse` (every redirect / JSON branch below)
  // is a fresh object that does NOT carry those Set-Cookie headers, so
  // the rotated token never reaches the browser. The next request then
  // replays the old, now-consumed refresh token, the refresh fails, and
  // the session wedges — the user gets a broken reload after idling and
  // can only recover by manually clearing cookies (issue #288). Copy the
  // refreshed cookies onto whatever response we hand back to fix that.
  const withRefreshedCookies = <T extends NextResponse>(response: T): T => {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie)
    })
    return response
  }

  // Root landing page - redirect to dashboard if already logged in.
  if (user && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.search = ''
    return withRefreshedCookies(NextResponse.redirect(url))
  }

  // Auth pages - redirect to dashboard if already logged in.
  // Exception: when an invite token is in the query string we
  // send the already-signed-in user to /join/<token> instead so
  // they can accept the invitation in one click. Without this,
  // a forwarded invite link to someone who's already signed in
  // would silently drop them on /dashboard.
  if (user && (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup' ||
    request.nextUrl.pathname === '/forgot-password'
  )) {
    const url = request.nextUrl.clone()
    const inviteToken = request.nextUrl.searchParams.get('invite')
    if (
      inviteToken &&
      (request.nextUrl.pathname === '/login' ||
        request.nextUrl.pathname === '/signup')
    ) {
      url.pathname = `/join/${encodeURIComponent(inviteToken)}`
      url.search = ''
    } else {
      url.pathname = '/dashboard'
      url.search = ''
    }
    return withRefreshedCookies(NextResponse.redirect(url))
  }

  let hasActiveAccess = false
  let hasWorkspace = false

  if (user) {
    // Check workspace and subscription status
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('user_id', user.id)
      .single()

    if (profile?.account_id) {
      hasWorkspace = true
      // We will check saas_subscriptions for an active state. 
      // If none exists, or if it's expired/canceled, access is denied.
      const { data: sub } = await supabase
        .from('saas_subscriptions')
        .select('status')
        .eq('account_id', profile.account_id)
        .maybeSingle()

      if (sub && (sub.status === 'active' || sub.status === 'trialing')) {
        hasActiveAccess = true
      }
    }
  }

  // Protected pages - redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/inbox', '/contacts', '/pipelines', '/broadcasts', '/automations', '/settings']
  const adminPaths = ['/admin']
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
  const isAdminPath = adminPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if ((isProtectedPath || isAdminPath) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return withRefreshedCookies(NextResponse.redirect(url))
  }

  // SaaS Provisioning Gate
  // If the user is authenticated but trying to access the CRM without an active subscription
  if (isProtectedPath && user) {
    if (!hasWorkspace || !hasActiveAccess) {
      const url = request.nextUrl.clone()
      url.pathname = '/subscribe'
      return withRefreshedCookies(NextResponse.redirect(url))
    }
  }

  // API routes that need auth (not webhooks)
  if (!user && request.nextUrl.pathname.startsWith('/api/whatsapp/') &&
      !request.nextUrl.pathname.includes('/webhook')) {
    return withRefreshedCookies(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    )
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
