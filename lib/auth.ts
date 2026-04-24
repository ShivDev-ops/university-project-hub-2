// File: lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import AzureADProvider from 'next-auth/providers/azure-ad'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId:     process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId:     'common',
    }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('user_id, email, full_name, avatar_url, password_hash')
          .eq('email', credentials.email)
          .single()

        if (!profile?.password_hash) return null

        const isValid = await bcrypt.compare(
          credentials.password,
          profile.password_hash
        )
        if (!isValid) return null

        return {
          id:    profile.user_id,
          email: profile.email,
          name:  profile.full_name,
          image: profile.avatar_url,
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Credentials provider — let it through, authorize() already validated
      if (account?.provider === 'credentials') return true

      const email = user.email ?? ''
      console.log('SIGNIN EMAIL:', email)

      const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('is_suspended, user_id')
        .eq('email', email)
        .single()

      console.log('EXISTING PROFILE:', existing)

      // Block suspended users
      if (existing?.is_suspended) {
        return `/auth/error?error=suspended`
      }

      // Brand new user — create profile, middleware handles redirect to /verify
      if (!existing) {
        const userId = crypto.randomUUID()
        const { error } = await supabaseAdmin.from('profiles').insert({
          user_id:          userId,
          email:            email,
          full_name:        user.name,
          avatar_url:       user.image,
          verified:         false,
          profile_complete: false,
          is_admin:         false,
          is_suspended:     false,
          score:            500,
        })
        if (error) {
          console.error('PROFILE INSERT ERROR:', error)
          return false
        }
      }

      // Always return true — middleware will handle all redirects
      return true
    },

    async jwt({ token, account, trigger, user }) {
  if (account) token.id = token.sub

  if (account || trigger === 'update') {
    // Retry up to 3 times — handles Supabase propagation delay on new signups
    let profile = null
    for (let i = 0; i < 3; i++) {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('verified, profile_complete, is_admin, is_suspended, user_id, username, password_hash')
        .eq('email', token.email)
        .single()

      if (data) {
        profile = data
        break
      }

      // Wait 500ms before retrying
      await new Promise(res => setTimeout(res, 500))
    }

    console.log('JWT PROFILE:', profile)

    if (profile) {
      token.verified         = profile.verified
      token.profile_complete = profile.profile_complete
      token.is_admin         = profile.is_admin
      token.is_suspended     = profile.is_suspended
      token.dbUserId         = profile.user_id
      token.hasCredentials   = !!(profile.username && profile.password_hash)
    } else {
      // Profile still not found — set safe defaults for a brand new user
      // Middleware will redirect to /verify which is correct
      token.verified         = false
      token.profile_complete = false
      token.is_admin         = false
      token.is_suspended     = false
      token.hasCredentials   = false
      console.error('JWT: profile not found after 3 retries, using defaults')
    }
  }

  return token
},

    async session({ session, token }) {
      if (session.user) {
        session.user.id               = token.dbUserId as string ?? token.sub!
        session.user.verified         = token.verified as boolean
        session.user.profile_complete = token.profile_complete as boolean
        session.user.is_admin         = token.is_admin as boolean
        session.user.is_suspended     = token.is_suspended as boolean
      }
      return session
    },
  },

pages: {
    signIn:  '/login',
    error:   '/auth/error',
    newUser: '/verify',    // ← add this line
  },

  session: {
    strategy: 'jwt',
    maxAge:   30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}