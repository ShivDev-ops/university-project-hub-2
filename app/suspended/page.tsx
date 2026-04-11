'use client'
import { signOut } from 'next-auth/react'

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2">Account Suspended</h1>
        <p className="text-gray-400 mb-8">
          Your account has been suspended due to a policy violation.
          Please contact your university administrator for more information.
        </p>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}