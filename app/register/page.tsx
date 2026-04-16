// File: app/register/page.tsx
'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function RegisterPage() {
  const [step, setStep] = useState<'form' | 'microsoft'>('form')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
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

    setLoading(true)

    // Check username availability
    const res = await fetch('/api/auth/check-username', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })
    const data = await res.json()
    setLoading(false)

    if (data.taken) {
      setError('Username already taken — try another')
      return
    }

    // Store temporarily
    sessionStorage.setItem('reg_username', username)
    sessionStorage.setItem('reg_password', password)
    setStep('microsoft')
  }

  function handleMicrosoftSignIn() {
    signIn('azure-ad')
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Manrope:wght@400;500;600&family=DM+Mono&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
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
            Create Account
          </p>
        </div>

        <div className="glass" style={{width:'100%', maxWidth:'400px', padding:'32px', borderRadius:'16px', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute', top:0, right:0, width:'96px', height:'96px', background:'linear-gradient(to bottom-left, rgba(160,120,255,0.1), transparent)', pointerEvents:'none'}} />

          {/* Progress bar */}
          <div style={{display:'flex', gap:'8px', marginBottom:'28px'}}>
            <div style={{flex:1, height:'3px', borderRadius:'999px', background: step === 'form' ? '#adc6ff' : '#6bd8cb', transition:'background 0.3s'}} />
            <div style={{flex:1, height:'3px', borderRadius:'999px', background: step === 'microsoft' ? '#adc6ff' : '#25293a', transition:'background 0.3s'}} />
          </div>

          {step === 'form' ? (
            <>
              <h2 style={{fontFamily:'Syne', fontSize:'22px', fontWeight:700, marginBottom:'6px'}}>
                Choose your identity
              </h2>
              <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f', marginBottom:'24px'}}>
                This is how others will find you on the platform
              </p>

              <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                <div>
                  <label style={{fontFamily:'DM Mono', fontSize:'10px', color:'#adc6ff', textTransform:'uppercase', letterSpacing:'0.15em', display:'block', marginBottom:'6px'}}>
                    Username
                  </label>
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="your_username"
                    required
                    style={{width:'100%', background:'#161b2b', border:'1px solid rgba(66,71,84,0.5)', borderRadius:'10px', color:'#dee1f7', padding:'12px 14px', fontFamily:'DM Mono', fontSize:'14px', outline:'none', transition:'border-color 0.2s'}}
                    onFocus={e => e.target.style.borderColor = '#adc6ff'}
                    onBlur={e => e.target.style.borderColor = 'rgba(66,71,84,0.5)'}
                  />
                  <p style={{fontFamily:'DM Mono', fontSize:'9px', color:'#424754', marginTop:'4px'}}>
                    Lowercase letters, numbers, underscores only
                  </p>
                </div>

                <div>
                  <label style={{fontFamily:'DM Mono', fontSize:'10px', color:'#adc6ff', textTransform:'uppercase', letterSpacing:'0.15em', display:'block', marginBottom:'6px'}}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    style={{width:'100%', background:'#161b2b', border:'1px solid rgba(66,71,84,0.5)', borderRadius:'10px', color:'#dee1f7', padding:'12px 14px', fontFamily:'DM Mono', fontSize:'14px', outline:'none', transition:'border-color 0.2s'}}
                    onFocus={e => e.target.style.borderColor = '#adc6ff'}
                    onBlur={e => e.target.style.borderColor = 'rgba(66,71,84,0.5)'}
                  />
                </div>

                <div>
                  <label style={{fontFamily:'DM Mono', fontSize:'10px', color:'#adc6ff', textTransform:'uppercase', letterSpacing:'0.15em', display:'block', marginBottom:'6px'}}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    style={{width:'100%', background:'#161b2b', border:'1px solid rgba(66,71,84,0.5)', borderRadius:'10px', color:'#dee1f7', padding:'12px 14px', fontFamily:'DM Mono', fontSize:'14px', outline:'none', transition:'border-color 0.2s'}}
                    onFocus={e => e.target.style.borderColor = '#adc6ff'}
                    onBlur={e => e.target.style.borderColor = 'rgba(66,71,84,0.5)'}
                  />
                </div>

                {error && (
                  <p style={{color:'#ffb4ab', fontFamily:'DM Mono', fontSize:'11px', padding:'10px', background:'rgba(255,68,68,0.05)', border:'1px solid rgba(255,68,68,0.1)', borderRadius:'8px'}}>
                    ⚠ {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="neon"
                  style={{width:'100%', padding:'14px', borderRadius:'10px', border:'none', background: loading ? '#424754' : '#adc6ff', color:'#002e6a', fontFamily:'Syne', fontWeight:900, fontSize:'14px', textTransform:'uppercase', letterSpacing:'0.15em', cursor: loading ? 'not-allowed' : 'pointer', transition:'all 0.2s'}}
                >
                  {loading ? 'Checking...' : 'Continue →'}
                </button>

                <p style={{fontFamily:'DM Mono', fontSize:'11px', color:'#8c909f', textAlign:'center'}}>
                  Already have an account?{' '}
                  <Link href="/login" style={{color:'#adc6ff', textDecoration:'underline'}}>Sign in</Link>
                </p>
              </form>
            </>
          ) : (
            <>
              <h2 style={{fontFamily:'Syne', fontSize:'22px', fontWeight:700, marginBottom:'6px'}}>
                Verify university email
              </h2>
              <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f', marginBottom:'24px'}}>
                Connect your Microsoft account to complete signup
              </p>

              {/* Summary */}
              <div style={{padding:'16px', borderRadius:'10px', background:'rgba(173,198,255,0.05)', border:'1px solid rgba(173,198,255,0.1)', marginBottom:'24px'}}>
                <p style={{fontFamily:'DM Mono', fontSize:'9px', color:'#8c909f', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px'}}>
                  Your username will be
                </p>
                <p style={{fontFamily:'DM Mono', fontSize:'20px', color:'#adc6ff', fontWeight:700}}>
                  @{username}
                </p>
                <p style={{fontFamily:'DM Mono', fontSize:'9px', color:'#8c909f', marginTop:'8px'}}>
                  Your login email and credentials will be sent to your university email after signup
                </p>
              </div>

              <button
                onClick={handleMicrosoftSignIn}
                className="neon"
                style={{width:'100%', padding:'14px', borderRadius:'10px', border:'none', background:'#adc6ff', color:'#002e6a', fontFamily:'Syne', fontWeight:900, fontSize:'14px', textTransform:'uppercase', letterSpacing:'0.15em', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginBottom:'12px'}}
              >
                <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                </svg>
                Continue with Microsoft
              </button>

              <button
                onClick={() => setStep('form')}
                style={{width:'100%', background:'transparent', border:'none', color:'#8c909f', fontFamily:'DM Mono', fontSize:'11px', cursor:'pointer', padding:'8px'}}
              >
                ← Back
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}