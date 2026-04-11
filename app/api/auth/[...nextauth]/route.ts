// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import AzureADProvider from 'next-auth/providers/azure-ad'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const handler = NextAuth({
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
      const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN ?? '@university.edu'

      if (!email.endsWith(allowedDomain)) {
        return false
      }

      // Create profile row on first login
      await supabaseAdmin.from('profiles').upsert(
        {
          user_id:    user.id,
          email:      user.email,
          name:       user.name,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

      return true
    },

    async jwt({ token, account }) {
      if (account) {
        token.id = token.sub
      }
      return token
    },

    async session({ session, token }) {
      // Use type assertion — tells TypeScript "trust me, id exists"
      if (session.user && token.sub) {
        (session.user as { id: string } & typeof session.user).id = token.sub
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error:  '/auth/error',
  },
})

export { handler as GET, handler as POST }