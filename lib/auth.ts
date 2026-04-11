// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import AzureADProvider from 'next-auth/providers/azure-ad'

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId:     process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId:     'common',
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Store the user's ID in the JWT token
      if (account) {
        token.id = token.sub  // 'sub' is the Microsoft user ID
      }
      return token
    },
    async session({ session, token }) {
      // Copy the ID from the token into the session
      if (session.user && token.sub) {
        session.user.id = token.sub  // ← this is what gives you session.user.id
      }
      return session
    },
  },
}