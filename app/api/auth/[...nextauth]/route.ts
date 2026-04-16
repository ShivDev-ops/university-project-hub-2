// File: app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

declare module 'next-auth/jwt' {
  interface JWT {
    verified:         boolean
    profile_complete: boolean
    is_admin:         boolean
    is_suspended:     boolean
    dbUserId:         string
    hasCredentials:   boolean
  }
}
