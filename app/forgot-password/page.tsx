// File: app/forgot-password/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Email not found')
      return
    }

    setStep('otp')
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/verify-reset-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Invalid OTP')
      return
    }

    setStep('reset')
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Reset failed')
      return
    }

    setSuccess('Password reset! Redirecting to login...')
    setTimeout(() => router.push('/login'), 2000)
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Manrope:wght@400;500;600&family=DM+Mono&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background-color: #0e1322; color: #dee1f7; font-family: 'Manrope', sans-serif; }
        .glass { background: rgba(26,31,47,0.7); backdrop-filter: blur(20px); border: 1px solid rgba(173,198,255,0.1); }
        .mesh { background: radial-gradient(circle at 50% 50%, rgba(77,142,255,0.05) 0%, #0e1322 70%); }
        .dots { background-image: radial-gradient(rgba(173,198,255,0.08) 1px, transparent 0); background-size: 24px 24px; }
        .neon { box-shadow: 0 0 24px rgba(77,142,255,0.35); }
      `}</style>

      <div style={{position:'fixed', inset:0, zIndex:-1}} className="mesh" />
      <div style={{position:'fixed', inset:0, zIndex:-1, opacity:0.3}} className="dots" />

      <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px'}}>

        <div style={{textAlign:'center', marginBottom:'32px'}}>
          <h1 style={{fontFamily:'Syne', fontSize:'2.5rem', fontWeight:900, color:'#adc6ff', letterSpacing:'-0.05em', textTransform:'uppercase'}}>
            PROJECT_HUB
          </h1>
          <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f', letterSpacing:'0.2em', textTransform:'uppercase', marginTop:'6px'}}>
            Password Reset
          </p>
        </div>

        <div className="glass" style={{width:'100%', maxWidth:'400px', padding:'32px', borderRadius:'16px', position:'relative', overflow:'hidden'}}>

          {/* Progress */}
          <div style={{display:'flex', gap:'8px', marginBottom:'28px'}}>
            {(['email','otp','reset'] as const).map((s, i) => (
              <div key={s} style={{flex:1, height:'3px', borderRadius:'999px', background: ['email','otp','reset'].indexOf(step) >= i ? '#adc6ff' : '#25293a', transition:'background 0.3s'}} />
            ))}
          </div>

          {step === 'email' && (
            <>
              <h2 style={{fontFamily:'Syne', fontSize:'22px', fontWeight:700, marginBottom:'6px'}}>Forgot password?</h2>
              <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f', marginBottom:'24px'}}>
                Enter your university email and we'll send a reset code
              </p>
              <form onSubmit={handleSendOTP} style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                <div>
                  <label style={{fontFamily:'DM Mono', fontSize:'10px', color:'#adc6ff', textTransform:'uppercase', letterSpacing:'0.15em', display:'block', marginBottom:'6px'}}>
                    University Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    required
                    style={{width:'100%', background:'#161b2b', border:'1px solid rgba(66,71,84,0.5)', borderRadius:'10px', color:'#dee1f7', padding:'12px 14px', fontFamily:'DM Mono', fontSize:'14px', outline:'none'}}
                    onFocus={e => e.target.style.borderColor = '#adc6ff'}
                    onBlur={e => e.target.style.borderColor = 'rgba(66,71,84,0.5)'}
                  />
                </div>
                {error && <p style={{color:'#ffb4ab', fontFamily:'DM Mono', fontSize:'11px'}}>⚠ {error}</p>}
                <button type="submit" disabled={loading} className="neon"
                  style={{width:'100%', padding:'14px', borderRadius:'10px', border:'none', background: loading ? '#424754' : '#adc6ff', color:'#002e6a', fontFamily:'Syne', fontWeight:900, fontSize:'14px', textTransform:'uppercase', letterSpacing:'0.15em', cursor: loading ? 'not-allowed' : 'pointer'}}>
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
                <Link href="/login" style={{fontFamily:'DM Mono', fontSize:'11px', color:'#8c909f', textAlign:'center', textDecoration:'none'}}>
                  ← Back to login
                </Link>
              </form>
            </>
          )}

          {step === 'otp' && (
            <>
              <h2 style={{fontFamily:'Syne', fontSize:'22px', fontWeight:700, marginBottom:'6px'}}>Enter reset code</h2>
              <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f', marginBottom:'24px'}}>
                We sent a 6-digit code to {email}
              </p>
              <form onSubmit={handleVerifyOTP} style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  required
                  style={{width:'100%', background:'#161b2b', border:'1px solid rgba(66,71,84,0.5)', borderRadius:'12px', color:'#dee1f7', padding:'16px', fontFamily:'DM Mono', fontSize:'28px', textAlign:'center', letterSpacing:'12px', outline:'none'}}
                  onFocus={e => e.target.style.borderColor = '#adc6ff'}
                  onBlur={e => e.target.style.borderColor = 'rgba(66,71,84,0.5)'}
                />
                {error && <p style={{color:'#ffb4ab', fontFamily:'DM Mono', fontSize:'11px'}}>⚠ {error}</p>}
                <button type="submit" disabled={loading || otp.length !== 6} className="neon"
                  style={{width:'100%', padding:'14px', borderRadius:'10px', border:'none', background:(loading || otp.length !== 6) ? '#424754' : '#adc6ff', color:'#002e6a', fontFamily:'Syne', fontWeight:900, fontSize:'14px', textTransform:'uppercase', letterSpacing:'0.15em', cursor:(loading || otp.length !== 6) ? 'not-allowed' : 'pointer'}}>
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>
            </>
          )}

          {step === 'reset' && (
            <>
              <h2 style={{fontFamily:'Syne', fontSize:'22px', fontWeight:700, marginBottom:'6px'}}>Set new password</h2>
              <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f', marginBottom:'24px'}}>
                Choose a strong password for your account
              </p>
              <form onSubmit={handleResetPassword} style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                <div>
                  <label style={{fontFamily:'DM Mono', fontSize:'10px', color:'#adc6ff', textTransform:'uppercase', letterSpacing:'0.15em', display:'block', marginBottom:'6px'}}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    style={{width:'100%', background:'#161b2b', border:'1px solid rgba(66,71,84,0.5)', borderRadius:'10px', color:'#dee1f7', padding:'12px 14px', fontFamily:'DM Mono', fontSize:'14px', outline:'none'}}
                    onFocus={e => e.target.style.borderColor = '#adc6ff'}
                    onBlur={e => e.target.style.borderColor = 'rgba(66,71,84,0.5)'}
                  />
                </div>
                <div>
                  <label style={{fontFamily:'DM Mono', fontSize:'10px', color:'#adc6ff', textTransform:'uppercase', letterSpacing:'0.15em', display:'block', marginBottom:'6px'}}>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    style={{width:'100%', background:'#161b2b', border:'1px solid rgba(66,71,84,0.5)', borderRadius:'10px', color:'#dee1f7', padding:'12px 14px', fontFamily:'DM Mono', fontSize:'14px', outline:'none'}}
                    onFocus={e => e.target.style.borderColor = '#adc6ff'}
                    onBlur={e => e.target.style.borderColor = 'rgba(66,71,84,0.5)'}
                  />
                </div>
                {error && <p style={{color:'#ffb4ab', fontFamily:'DM Mono', fontSize:'11px'}}>⚠ {error}</p>}
                {success && <p style={{color:'#6bd8cb', fontFamily:'DM Mono', fontSize:'11px'}}>✓ {success}</p>}
                <button type="submit" disabled={loading} className="neon"
                  style={{width:'100%', padding:'14px', borderRadius:'10px', border:'none', background: loading ? '#424754' : '#adc6ff', color:'#002e6a', fontFamily:'Syne', fontWeight:900, fontSize:'14px', textTransform:'uppercase', letterSpacing:'0.15em', cursor: loading ? 'not-allowed' : 'pointer'}}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}