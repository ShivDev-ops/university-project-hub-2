// File: app/profile/setup/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useFingerprint } from '@/hooks/useFingerprint'

const SKILL_OPTIONS = [
  'React', 'Next.js', 'TypeScript', 'Python', 'Machine Learning',
  'Node.js', 'PostgreSQL', 'Docker', 'Flutter', 'C++',
  'Java', 'Data Science', 'UI/UX Design', 'DevOps', 'MongoDB'
]

export default function ProfileSetupPage() {
  const [bio, setBio] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [githubUrl, setGithubUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fingerprint = useFingerprint()
  const router = useRouter()
  const { update } = useSession()

  function toggleSkill(skill: string) {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  async function handleSubmit() {
    if (selectedSkills.length === 0) {
      setError('Please select at least one skill')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bio,
        skills:     selectedSkills,
        github_url: githubUrl,
        fingerprint,
      }),
    })

    if (!res.ok) {
      setError('Failed to save profile. Please try again.')
      setLoading(false)
      return
    }

    // Refresh session so proxy sees profile_complete: true
    await update()
    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Set Up Your Profile</h1>
          <p className="text-gray-400">Tell your future teammates about yourself.</p>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Short Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="e.g. 3rd year CS student interested in ML and web dev..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3
                       text-white resize-none h-24 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Skills */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Skills{' '}
            <span className="text-purple-400">(select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map(skill => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  selectedSkills.includes(skill)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          {selectedSkills.length > 0 && (
            <p className="text-purple-400 text-xs mt-2">
              {selectedSkills.length} skill{selectedSkills.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* GitHub */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            GitHub Profile URL{' '}
            <span className="text-gray-500">(optional but recommended)</span>
          </label>
          <input
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/yourusername"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3
                       text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40
                     text-white font-semibold py-3 rounded-xl text-lg transition"
        >
          {loading ? 'Saving...' : 'Complete Profile →'}
        </button>

        <p className="text-gray-600 text-xs text-center mt-4">
          You can update your profile anytime from settings
        </p>
      </div>
    </div>
  )
}