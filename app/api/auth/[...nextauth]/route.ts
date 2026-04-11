import NextAuth from 'next-auth'
import AzureADProvider from 'next-auth/providers/azure-ad'
import { createClient } from '@supabase/supabase-js'
import pages from 'next/dist/build/templates/pages'
 
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
 
const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: 'common',  // Accepts all Microsoft accounts
    }),
  ],
callbacks: {
  async signIn({ user, account, profile }) {
    const email = user.email || ''

    // Check if email ends with your university domain
    if (!email.endsWith('@outlook.com') && !email.endsWith('@hotmail.com') && !email.endsWith('@live.com')) {
      // Return false to block login
      // The user is redirected to /auth/ error?error=AccessDenied
      return false
    }

    // Create or update the user's profile row in Supabase
    await supabaseAdmin.from('profiles').upsert({
      user_id: user.id,
      email: user.email,
      name: user.name,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })  // Allow for now

    return true  // Allow login
  },
  async session({ session, token }) {
    // Attach user ID to the session so we can use it in pages
    if (session.user && token.sub) {
      session.user.id = token.sub
    }
    return session
  },
},
pages: {
    signIn: '/login',   // Your custom login page
    error: '/auth/error',
  },
})
 
export { handler as GET, handler as POST }