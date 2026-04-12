'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function VerifyPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState('')
  const router = useRouter()
  const { update } = useSession()

  // DO NOT auto-send OTP here
  // OTP is already sent by auth.ts during signIn

  async function handleResend() {
    setResending(true)
    setResendMsg('')
    const res = await fetch('/api/send-otp', { method: 'POST' })
    const data = await res.json()
    setResending(false)
    setResendMsg('Code resent! Check your email.')
    // show new OTP in dev mode
    if (data.devOtp) setCode(data.devOtp)
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
          We sent a 6-digit code to your email. Check your inbox.
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
        {resendMsg && <p className="text-green-400 text-sm mb-4">{resendMsg}</p>}

        <button
          onClick={handleVerify}
          disabled={code.length !== 6 || loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40
                     text-white font-semibold py-3 rounded-xl transition"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>

        <button
          onClick={handleResend}
          disabled={resending}
          className="text-gray-500 text-xs mt-4 hover:text-gray-300 
                     disabled:opacity-40 block mx-auto"
        >
          {resending ? 'Sending...' : 'Resend code'}
        </button>
      </div>
    </div>
  )
}