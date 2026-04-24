// File: middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {  // ← rename from proxy to middleware
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: req.url.startsWith('https')
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token',
  })

  const path = req.nextUrl.pathname

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (token.is_suspended === true) {
    return NextResponse.redirect(new URL('/suspended', req.url))
  }

  if (token.verified !== true && path !== '/verify') {
    return NextResponse.redirect(new URL('/verify', req.url))
  }

  if (
    token.verified === true &&
    !token.hasCredentials &&
    path !== '/set-credentials'
  ) {
    return NextResponse.redirect(new URL('/set-credentials', req.url))
  }

  if (
    token.verified === true &&
    token.hasCredentials === true &&
    token.profile_complete !== true &&
    path !== '/profile/setup'
  ) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  if (path.startsWith('/admin') && token.is_admin !== true) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/verify',
    '/register', 
    '/set-credentials',
    '/profile/:path*',
    '/dashboard/:path*',
    '/projects/:path*',
    '/chat/:path*',
    '/notifications/:path*',
    '/admin/:path*',
  ],
}