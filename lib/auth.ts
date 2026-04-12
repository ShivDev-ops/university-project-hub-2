// File: lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import AzureADProvider from 'next-auth/providers/azure-ad'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateOTP, storeOTP, sendOTPEmail } from '@/lib/otp'

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId:     process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId:     'common',
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      const email = user.email ?? ''
      console.log('SIGNIN EMAIL:', email)

      // Uncomment when ready for production:
      // if (!email.endsWith('@lpu.in')) return '/auth/error?error=AccessDenied'

      const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('verified, profile_complete, is_suspended, user_id')
        .eq('email', email)
        .single()

      console.log('EXISTING PROFILE:', existing)

      // Suspended user
      if (existing?.is_suspended) return '/suspended'

      // New user — create profile + send OTP
      if (!existing) {
        const userId = crypto.randomUUID()
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
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
        console.log('INSERT ERROR:', insertError)
        const otp = generateOTP()
        await storeOTP(userId, otp)
        await sendOTPEmail(email, otp)
        return '/verify'
      }

      // Existing but not verified — resend OTP
      if (!existing.verified) {
        const otp = generateOTP()
        await storeOTP(existing.user_id, otp)
        await sendOTPEmail(email, otp)
        return '/verify'
      }

      // Verified but profile incomplete
      if (!existing.profile_complete) {
        return '/onboarding'
      }

      // All good — go to dashboard
      return '/dashboard'
    },

    async jwt({ token, account, trigger }) {
      if (account) token.id = token.sub

      if (account || trigger === 'update') {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('verified, profile_complete, is_admin, is_suspended, user_id')
          .eq('email', token.email)
          .single()

        console.log('JWT PROFILE:', profile)

        if (profile) {
          token.verified         = profile.verified
          token.profile_complete = profile.profile_complete
          token.is_admin         = profile.is_admin
          token.is_suspended     = profile.is_suspended
          token.dbUserId         = profile.user_id
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
    signIn: '/login',
    error:  '/auth/error',
  },

  session: {
    strategy: 'jwt',
  },
}