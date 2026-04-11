// File: app/login/page.tsx
'use client'  // Needs to be client because it uses browser interaction (button click)
import { signIn } from 'next-auth/react'
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-gray-400 text-sm mb-8">
          Sign in with your university Microsoft account
        </p>
        {/* The signIn function from next-auth triggers the Microsoft OAuth flow */}
        {/* 'azure-ad' matches the provider name we set in route.ts */}
        {/* callbackUrl tells Microsoft where to send the user after login */}
        <button
          onClick={() => signIn('azure-ad', { callbackUrl: '/dashboard' })}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold
                     py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition"
        >
          {/* Microsoft Logo SVG */}
          <svg width="20" height="20" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
            <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
          </svg>
          Continue with Microsoft
        </button>
        <p className="text-gray-600 text-xs mt-6">
          Only @lpu.in email addresses are accepted
        </p>
      </div>
    </div>
  )
}