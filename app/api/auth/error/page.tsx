'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  AccessDenied: {
    title:   'Access Denied',
    message: 'Only university email addresses are allowed. Please sign in with your @university.edu account.',
  },
  OAuthSignin: {
    title:   'Sign In Error',
    message: 'There was a problem signing in with Microsoft. Please try again.',
  },
  OAuthCallback: {
    title:   'Authentication Error',
    message: 'Something went wrong during authentication. Please try again.',
  },
  SessionRequired: {
    title:   'Session Expired',
    message: 'Your session has expired. Please sign in again.',
  },
  Default: {
    title:   'Something went wrong',
    message: 'An unexpected error occurred. Please try again or contact support.',
  },
}

function ErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorKey = searchParams.get('error') ?? 'Default'
  const error = ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.Default

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2">{error.title}</h1>
        <p className="text-gray-400 mb-8">{error.message}</p>

        {/* Error code */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 inline-block mb-8">
          <p className="text-gray-500 text-sm">
            Error code: <span className="text-gray-300 font-mono">{errorKey}</span>
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Back to Login
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Go to Home
          </button>
        </div>

        <p className="text-gray-600 text-sm mt-6">
          If this keeps happening, contact your university IT support.
        </p>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}