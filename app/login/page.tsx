// File: app/login/page.tsx
'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [tab, setTab] = useState<'microsoft' | 'credentials'>('microsoft')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleCredentialsLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError('Invalid username or password')
      setLoading(false)
      return
    }

    router.push('/dashboard')
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
            University Research Network
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel w-full max-w-sm p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
            style={{background:'linear-gradient(to bottom-left, rgba(160,120,255,0.1), transparent)'}} />

          {/* Tabs */}
          <div className="flex mb-8 rounded-lg overflow-hidden" style={{border:'1px solid rgba(66,71,84,0.3)'}}>
            <button
              onClick={() => setTab('microsoft')}
              className="flex-1 py-2 text-xs transition-all"
              style={{
                fontFamily:'DM Mono',
                textTransform:'uppercase',
                letterSpacing:'0.1em',
                background: tab === 'microsoft' ? 'rgba(173,198,255,0.1)' : 'transparent',
                color: tab === 'microsoft' ? '#adc6ff' : '#8c909f',
                borderRight:'1px solid rgba(66,71,84,0.3)',
              }}
            >
              Microsoft
            </button>
            <button
              onClick={() => setTab('credentials')}
              className="flex-1 py-2 text-xs transition-all"
              style={{
                fontFamily:'DM Mono',
                textTransform:'uppercase',
                letterSpacing:'0.1em',
                background: tab === 'credentials' ? 'rgba(173,198,255,0.1)' : 'transparent',
                color: tab === 'credentials' ? '#adc6ff' : '#8c909f',
              }}
            >
              Username
            </button>
          </div>

          {tab === 'microsoft' ? (
            <div className="space-y-4">
              <p style={{fontFamily:'DM Mono', fontSize:'11px', color:'#8c909f', textAlign:'center', marginBottom:'24px'}}>
                Sign in with your university Microsoft account
              </p>
              <button
                onClick={() => signIn('azure-ad', { callbackUrl: '/dashboard' })}
                className="neon-glow w-full flex items-center justify-center gap-3 py-4 rounded-lg transition-all hover:scale-[1.02]"
                style={{background:'#adc6ff', color:'#002e6a', fontFamily:'Syne', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', border:'none'}}
              >
                <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                </svg>
                Continue with Microsoft
              </button>
              <div className="text-center mt-6">
                <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f'}}>
                  Don't have an account?{' '}
                  <Link href="/register" style={{color:'#adc6ff', textDecoration:'underline'}}>
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div>
                <label style={{fontFamily:'DM Mono', fontSize:'10px', color:'#adc6ff', textTransform:'uppercase', letterSpacing:'0.15em', display:'block', marginBottom:'6px'}}>
                  Username
                </label>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="your_username"
                  required
                  style={{width:'100%', background:'#161b2b', border:'1px solid rgba(66,71,84,0.5)', borderRadius:'8px', color:'#dee1f7', padding:'12px', fontFamily:'DM Mono', fontSize:'14px', outline:'none'}}
                  onFocus={e => e.target.style.borderColor = '#adc6ff'}
                  onBlur={e => e.target.style.borderColor = 'rgba(66,71,84,0.5)'}
                />
              </div>
              <div>
                <label style={{fontFamily:'DM Mono', fontSize:'10px', color:'#adc6ff', textTransform:'uppercase', letterSpacing:'0.15em', display:'block', marginBottom:'6px'}}>
                  Password
                </label>
                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
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
                style={{background: loading ? '#424754' : '#adc6ff', color:'#002e6a', fontFamily:'Syne', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', border:'none', cursor: loading ? 'not-allowed' : 'pointer'}}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="text-center mt-4">
                <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f'}}>
                  Don't have an account?{' '}
                  <Link href="/register" style={{color:'#adc6ff', textDecoration:'underline'}}>
                    Create one
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>

        <p style={{fontFamily:'DM Mono', fontSize:'9px', color:'rgba(66,71,84,0.8)', marginTop:'24px', textTransform:'uppercase', letterSpacing:'0.2em'}}>
          © 2024 PROJECT_HUB — Encrypted Connection
        </p>
      </div>
    </>
  )
}