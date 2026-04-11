'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function VerifyPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const router = useRouter()
  const { update } = useSession()

  useEffect(() => {
    sendOTP()
  }, [])

  async function sendOTP() {
    await fetch('/api/send-otp', { method: 'POST' })
    setSent(true)
  }

  async function handleVerify() {
    setLoading(true)
    setError('')

    const res = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Verification failed')
      setLoading(false)
      return
    }

    // ← This is the key fix: refresh the session so
    // proxy.ts sees verified: true
    await update()

    router.push('/profile/setup')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
        <p className="text-gray-400 text-sm mb-6">
          {sent ? 'We sent a 6-digit code to your email.' : 'Sending code...'}
        </p>
        <input
          type="text"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="123456"
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3
                     text-white text-center text-2xl tracking-widest mb-4 
                     focus:outline-none focus:border-purple-500"
        />
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <button
          onClick={handleVerify}
          disabled={code.length !== 6 || loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40
                     text-white font-semibold py-3 rounded-xl transition"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
        <button
          onClick={sendOTP}
          className="text-gray-500 text-xs mt-4 hover:text-gray-300 block mx-auto"
        >
          Resend code
        </button>
      </div>
    </div>
  )
}