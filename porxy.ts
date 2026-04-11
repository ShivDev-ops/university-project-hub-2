import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path  = req.nextUrl.pathname

    if (token?.is_suspended) {
      return NextResponse.redirect(new URL('/suspended', req.url))
    }
    if (token && !token.verified && path !== '/verify') {
      return NextResponse.redirect(new URL('/verify', req.url))
    }
    if (token?.verified && !token.profile_complete && path !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }
    if (path.startsWith('/admin') && !token?.is_admin) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/((?!login|$|api/auth|_next/static|_next/image|favicon.ico|suspended).*)',
  ],
}