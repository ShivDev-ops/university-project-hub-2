'use client'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {/* Icon */}
        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-2">Welcome aboard!</h1>
        <p className="text-gray-400 mb-2">
          Hey {session?.user?.name?.split(' ')[0] ?? 'there'} 👋
        </p>
        <p className="text-gray-400 mb-8">
          Before you can browse projects and connect with teammates,
          we need a few details about you.
        </p>

        {/* Steps preview */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 text-left space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium">Add your skills</p>
              <p className="text-gray-400 text-sm">Tell us what technologies you work with</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium">Write a short bio</p>
              <p className="text-gray-400 text-sm">Help teammates know who you are</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium">Link your GitHub</p>
              <p className="text-gray-400 text-sm">Optional but boosts your profile score</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/profile/setup')}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl text-lg transition"
        >
          Set Up My Profile →
        </button>

        <p className="text-gray-600 text-sm mt-4">Takes less than 2 minutes</p>
      </div>
    </div>
  )
}