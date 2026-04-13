// File: app/register/page.tsx
'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [step, setStep] = useState<'details' | 'microsoft'>('details')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Check username availability
    setLoading(true)
    const res = await fetch('/api/auth/check-username', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })
    const data = await res.json()
    setLoading(false)

    if (data.taken) {
      setError('Username already taken')
      return
    }

    // Store in sessionStorage temporarily
    sessionStorage.setItem('reg_username', username)
    sessionStorage.setItem('reg_password', password)
    setStep('microsoft')
  }

  function handleMicrosoftSignIn() {
    signIn('azure-ad', { callbackUrl: '/dashboard' })
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

        <div className="mb-8 text-center">
          <h1 style={{fontFamily:'Syne', fontSize:'2.5rem', fontWeight:900, color:'#adc6ff', letterSpacing:'-0.05em', textTransform:'uppercase'}}>
            PROJECT_HUB
          </h1>
          <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f', letterSpacing:'0.2em', textTransform:'uppercase', marginTop:'4px'}}>
            Create Account
          </p>
        </div>

        <div className="glass-panel w-full max-w-sm p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
            style={{background:'linear-gradient(to bottom-left, rgba(160,120,255,0.1), transparent)'}} />

          {/* Progress */}
          <div className="flex gap-2 mb-8">
            <div className="h-1 flex-1 rounded-full" style={{background: step === 'details' ? '#adc6ff' : '#6bd8cb'}} />
            <div className="h-1 flex-1 rounded-full" style={{background: step === 'microsoft' ? '#adc6ff' : '#25293a'}} />
          </div>

          {step === 'details' ? (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <h2 style={{fontFamily:'Syne', fontSize:'20px', fontWeight:700, marginBottom:'4px'}}>
                Choose your identity
              </h2>
              <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f', marginBottom:'20px'}}>
                This is how others will find you on the platform
              </p>

              <div>
                <label style={{fontFamily:'DM Mono', fontSize:'10px', color:'#adc6ff', textTransform:'uppercase', letterSpacing:'0.15em', display:'block', marginBottom:'6px'}}>
                  Username
                </label>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="your_username"
                  required
                  style={{width:'100%', background:'#161b2b', border:'1px solid rgba(66,71,84,0.5)', borderRadius:'8px', color:'#dee1f7', padding:'12px', fontFamily:'DM Mono', fontSize:'14px', outline:'none'}}
                  onFocus={e => e.target.style.borderColor = '#adc6ff'}
                  onBlur={e => e.target.style.borderColor = 'rgba(66,71,84,0.5)'}
                />
                <p style={{fontFamily:'DM Mono', fontSize:'9px', color:'#8c909f', marginTop:'4px'}}>
                  Only lowercase letters, numbers and underscores
                </p>
              </div>

              <div>
                <label style={{fontFamily:'DM Mono', fontSize:'10px', color:'#adc6ff', textTransform:'uppercase', letterSpacing:'0.15em', display:'block', marginBottom:'6px'}}>
                  Password
                </label>
                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  type="password"
                  required
                  style={{width:'100%', background:'#161b2b', border:'1px solid rgba(66,71,84,0.5)', borderRadius:'8px', color:'#dee1f7', padding:'12px', fontFamily:'DM Mono', fontSize:'14px', outline:'none'}}
                  onFocus={e => e.target.style.borderColor = '#adc6ff'}
                  onBlur={e => e.target.style.borderColor = 'rgba(66,71,84,0.5)'}
                />
              </div>

              <div>
                <label style={{fontFamily:'DM Mono', fontSize:'10px', color:'#adc6ff', textTransform:'uppercase', letterSpacing:'0.15em', display:'block', marginBottom:'6px'}}>
                  Confirm Password
                </label>
                <input
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  type="password"
                  required
                  style={{width:'100%', background:'#161b2b', border:'1px solid rgba(66,71,84,0.5)', borderRadius:'8px', color:'#dee1f7', padding:'12px', fontFamily:'DM Mono', fontSize:'14px', outline:'none'}}
                  onFocus={e => e.target.style.borderColor = '#adc6ff'}
                  onBlur={e => e.target.style.borderColor = 'rgba(66,71,84,0.5)'}
                />
              </div>

              {error && (
                <p style={{color:'#ffb4ab', fontFamily:'DM Mono', fontSize:'11px'}}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="neon-glow w-full py-4 rounded-lg transition-all hover:scale-[1.02]"
                style={{background: loading ? '#424754' : '#adc6ff', color:'#002e6a', fontFamily:'Syne', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', border:'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop:'8px'}}
              >
                {loading ? 'Checking...' : 'Continue →'}
              </button>

              <div className="text-center">
                <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f'}}>
                  Already have an account?{' '}
                  <Link href="/login" style={{color:'#adc6ff', textDecoration:'underline'}}>
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 style={{fontFamily:'Syne', fontSize:'20px', fontWeight:700, marginBottom:'4px'}}>
                  Verify your university email
                </h2>
                <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f'}}>
                  Connect your Microsoft account to complete registration
                </p>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-lg" style={{background:'rgba(173,198,255,0.05)', border:'1px solid rgba(173,198,255,0.1)'}}>
                <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'4px'}}>
                  Your username
                </p>
                <p style={{fontFamily:'DM Mono', fontSize:'16px', color:'#adc6ff', fontWeight:700}}>
                  @{username}
                </p>
              </div>

              <button
                onClick={handleMicrosoftSignIn}
                className="neon-glow w-full flex items-center justify-center gap-3 py-4 rounded-lg transition-all hover:scale-[1.02]"
                style={{background:'#adc6ff', color:'#002e6a', fontFamily:'Syne', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', border:'none'}}
              >
                <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                </svg>
                Verify with Microsoft
              </button>

              <button
                onClick={() => setStep('details')}
                style={{width:'100%', background:'transparent', border:'none', color:'#8c909f', fontFamily:'DM Mono', fontSize:'11px', cursor:'pointer'}}
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}