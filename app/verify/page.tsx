// File: app/verify/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function VerifyPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [devOtp, setDevOtp] = useState('')
  const router = useRouter()
  const { update } = useSession()

  useEffect(() => {
    sendOTP()
  }, [])

  async function sendOTP() {
    const res = await fetch('/api/send-otp', { method: 'POST' })
    const data = await res.json()
    setSent(true)
    if (data.devOtp) setDevOtp(data.devOtp)
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

    // Refresh session so proxy sees verified: true
    await update()
    router.push('/profile/setup')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm text-center">

        <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
        <p className="text-gray-400 text-sm mb-6">
          {sent ? 'We sent a 6-digit code to your email.' : 'Sending code...'}
        </p>

        {/* Dev mode OTP display */}
        {devOtp && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4">
            <p className="text-yellow-400 text-xs mb-1">Dev Mode — OTP Code:</p>
            <p className="text-yellow-300 text-2xl font-mono font-bold tracking-widest">
              {devOtp}
            </p>
          </div>
        )}

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