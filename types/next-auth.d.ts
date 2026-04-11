// File: types/next-auth.d.ts
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id:               string
      email:            string
      name:             string
      image:            string
      verified:         boolean
      profile_complete: boolean
      is_admin:         boolean
      is_suspended:     boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    verified:         boolean
    profile_complete: boolean
    is_admin:         boolean
    is_suspended:     boolean
    dbUserId:         string
  }
}