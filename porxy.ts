// File: proxy.ts
// Route protection for all phases
// Phase 2: auth + verify + profile
// Phase 3+: projects, chat, notifications
// Phase 4+: admin, scoring
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: process.env.NEXTAUTH_URL?.startsWith('https')
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token',
  })

  const path = req.nextUrl.pathname

  // No token → login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Suspended
  if (token.is_suspended === true) {
    return NextResponse.redirect(new URL('/suspended', req.url))
  }

  // Not verified → verify
  if (token.verified !== true && path !== '/verify') {
    return NextResponse.redirect(new URL('/verify', req.url))
  }

  // Verified but profile incomplete → onboarding
  if (
    token.verified === true &&
    token.profile_complete !== true &&
    path !== '/onboarding' &&
    path !== '/profile/setup'
  ) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  // Admin guard — Phase 4+
  if (path.startsWith('/admin') && token.is_admin !== true) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Phase 2
    '/verify',
    '/onboarding',
    '/profile/:path*',
    // Phase 3
    '/dashboard/:path*',
    '/projects/:path*',
    '/chat/:path*',
    '/notifications/:path*',
    // Phase 4
    '/admin/:path*',
  ],
}