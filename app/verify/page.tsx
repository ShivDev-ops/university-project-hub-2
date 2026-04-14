// File: app/verify/page.tsx
'use client'
import { useState, useEffect, useRef } from 'react'
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
  const hasSent = useRef(false)

  useEffect(() => {
    if (hasSent.current) return
    hasSent.current = true
    sendOTP()
  }, [])

  async function sendOTP() {
    setSent(false)
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

  // Save credentials if coming from registration
  const regUsername = sessionStorage.getItem('reg_username')
  const regPassword = sessionStorage.getItem('reg_password')

  if (regUsername && regPassword) {
    await fetch('/api/auth/save-credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: regUsername, password: regPassword }),
    })
    sessionStorage.removeItem('reg_username')
    sessionStorage.removeItem('reg_password')
  }

  await update()
  router.push('/set-credentials')  // ← always go to set-credentials after verify
}

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&family=DM+Mono&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style>{`
        body { background-color: #0e1322; color: #dee1f7; font-family: 'Manrope', sans-serif; }
        .glass-panel { background: rgba(26,31,47,0.7); backdrop-filter: blur(20px); border: 1px solid rgba(173,198,255,0.1); }
        .mesh-gradient { background: radial-gradient(circle at 50% 50%, rgba(77,142,255,0.05) 0%, rgba(14,19,34,1) 70%); }
        .dot-grid { background-image: radial-gradient(rgba(173,198,255,0.1) 1px, transparent 0); background-size: 24px 24px; }
        .neon-glow { box-shadow: 0 0 20px rgba(77,142,255,0.3); }
      `}</style>

      <div className="fixed inset-0 mesh-gradient" style={{zIndex:-1}} />
      <div className="fixed inset-0 dot-grid opacity-30" style={{zIndex:-1}} />

      <div className="min-h-screen flex flex-col items-center justify-center px-4">

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 style={{fontFamily:'Syne', fontSize:'2.5rem', fontWeight:900, color:'#adc6ff', letterSpacing:'-0.05em', textTransform:'uppercase'}}>
            PROJECT_HUB
          </h1>
          <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f', letterSpacing:'0.2em', textTransform:'uppercase', marginTop:'4px'}}>
            Email Verification
          </p>
        </div>

        <div className="glass-panel w-full max-w-sm p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
            style={{background:'linear-gradient(to bottom-left, rgba(160,120,255,0.1), transparent)'}} />

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{background:'rgba(173,198,255,0.1)', border:'1px solid rgba(173,198,255,0.2)'}}>
            <span className="material-symbols-outlined" style={{fontSize:'28px', color:'#adc6ff'}}>
              mark_email_read
            </span>
          </div>

          <h2 style={{fontFamily:'Syne', fontSize:'22px', fontWeight:700, textAlign:'center', marginBottom:'8px'}}>
            Verify Your Email
          </h2>
          <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f', textAlign:'center', marginBottom:'24px'}}>
            {sent ? 'We sent a 6-digit code to your email.' : 'Sending code...'}
          </p>

          {/* Dev mode OTP */}
          {devOtp && (
            <div className="rounded-xl p-3 mb-4 text-center"
              style={{background:'rgba(255,180,0,0.05)', border:'1px solid rgba(255,180,0,0.2)'}}>
              <p style={{fontFamily:'DM Mono', fontSize:'9px', color:'#fbbf24', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'4px'}}>
                Dev Mode — OTP:
              </p>
              <p style={{fontFamily:'DM Mono', fontSize:'28px', fontWeight:700, color:'#fcd34d', letterSpacing:'12px'}}>
                {devOtp}
              </p>
            </div>
          )}

          {/* OTP Input */}
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="123456"
            style={{
              width:'100%',
              background:'#161b2b',
              border:'1px solid rgba(66,71,84,0.5)',
              borderRadius:'12px',
              color:'#dee1f7',
              padding:'16px',
              fontFamily:'DM Mono',
              fontSize:'28px',
              textAlign:'center',
              letterSpacing:'12px',
              outline:'none',
              marginBottom:'16px',
              transition:'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#adc6ff'}
            onBlur={e => e.target.style.borderColor = 'rgba(66,71,84,0.5)'}
          />

          {error && (
            <p style={{color:'#ffb4ab', fontFamily:'DM Mono', fontSize:'11px', textAlign:'center', marginBottom:'12px'}}>
              {error}
            </p>
          )}

          <button
            onClick={handleVerify}
            disabled={code.length !== 6 || loading}
            className="neon-glow w-full py-4 rounded-xl transition-all"
            style={{
              background: (code.length !== 6 || loading) ? '#424754' : '#adc6ff',
              color:'#002e6a',
              fontFamily:'Syne',
              fontWeight:900,
              textTransform:'uppercase',
              letterSpacing:'0.1em',
              border:'none',
              cursor: (code.length !== 6 || loading) ? 'not-allowed' : 'pointer',
              marginBottom:'16px',
            }}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <button
            onClick={sendOTP}
            style={{
              width:'100%',
              background:'transparent',
              border:'none',
              color:'#8c909f',
              fontFamily:'DM Mono',
              fontSize:'11px',
              cursor:'pointer',
              textAlign:'center',
            }}
          >
            Resend code
          </button>
        </div>

        <p style={{fontFamily:'DM Mono', fontSize:'9px', color:'rgba(66,71,84,0.8)', marginTop:'24px', textTransform:'uppercase', letterSpacing:'0.2em'}}>
          Code expires in 10 minutes
        </p>
      </div>
    </>
  )
}