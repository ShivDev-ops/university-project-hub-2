// File: proxy.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET
  
  // Next.js 16 may use different cookie names
  const token = await getToken({ 
    req,
    secret,
    cookieName: process.env.NEXTAUTH_URL?.startsWith('https') 
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token',
  })

  const path = req.nextUrl.pathname
  console.log('[proxy] path:', path, '| token:', !!token, '| verified:', token?.verified)

  // No token → go to login
  if (!token) {
    console.log('[proxy] no token → /login')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (token?.is_suspended === true) {
    return NextResponse.redirect(new URL('/suspended', req.url))
  }

  if (token.verified !== true && path !== '/verify') {
    console.log('[proxy] not verified → /verify')
    return NextResponse.redirect(new URL('/verify', req.url))
  }

  if (token.verified === true && token.profile_complete !== true &&
      path !== '/onboarding' && path !== '/profile/setup') {
    console.log('[proxy] profile incomplete → /onboarding')
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  if (path.startsWith('/admin') && token?.is_admin !== true) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/verify',
    '/dashboard/:path*',
    '/projects/:path*',
    '/profile/:path*',
    '/chat/:path*',
    '/notifications/:path*',
    '/admin/:path*',
    '/onboarding/:path*',
  ],
}