// File: app/login/page.tsx
'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [staySignedIn, setStaySignedIn] = useState(true)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    router.push('/dashboard')
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
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #161b2b inset !important; -webkit-text-fill-color: #dee1f7 !important; }
      `}</style>

      <div style={{position:'fixed', inset:0, zIndex:-1}} className="mesh" />
      <div style={{position:'fixed', inset:0, zIndex:-1, opacity:0.3}} className="dots" />

      <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px'}}>

        {/* Logo */}
        <div style={{textAlign:'center', marginBottom:'32px'}}>
          <h1 style={{fontFamily:'Syne', fontSize:'2.5rem', fontWeight:900, color:'#adc6ff', letterSpacing:'-0.05em', textTransform:'uppercase'}}>
            PROJECT_HUB
          </h1>
          <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f', letterSpacing:'0.2em', textTransform:'uppercase', marginTop:'6px'}}>
            University Research Network
          </p>
        </div>

        <div className="glass" style={{width:'100%', maxWidth:'400px', padding:'32px', borderRadius:'16px', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute', top:0, right:0, width:'96px', height:'96px', background:'linear-gradient(to bottom-left, rgba(160,120,255,0.1), transparent)', pointerEvents:'none'}} />
          <div style={{position:'absolute', bottom:0, left:0, width:'96px', height:'96px', background:'linear-gradient(to top-right, rgba(77,142,255,0.1), transparent)', pointerEvents:'none'}} />

          <h2 style={{fontFamily:'Syne', fontSize:'22px', fontWeight:700, marginBottom:'6px'}}>
            Welcome back
          </h2>
          <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f', marginBottom:'28px'}}>
            Sign in to access your projects
          </p>

          <form onSubmit={handleLogin} style={{display:'flex', flexDirection:'column', gap:'16px'}}>
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
                style={{width:'100%', background:'#161b2b', border:'1px solid rgba(66,71,84,0.5)', borderRadius:'10px', color:'#dee1f7', padding:'12px 14px', fontFamily:'DM Mono', fontSize:'14px', outline:'none', transition:'border-color 0.2s'}}
                onFocus={e => e.target.style.borderColor = '#adc6ff'}
                onBlur={e => e.target.style.borderColor = 'rgba(66,71,84,0.5)'}
              />
            </div>

            <div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px'}}>
                <label style={{fontFamily:'DM Mono', fontSize:'10px', color:'#adc6ff', textTransform:'uppercase', letterSpacing:'0.15em'}}>
                  Password
                </label>
                <Link href="/forgot-password" style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f', textDecoration:'none'}}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = '#adc6ff'}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = '#8c909f'}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{width:'100%', background:'#161b2b', border:'1px solid rgba(66,71,84,0.5)', borderRadius:'10px', color:'#dee1f7', padding:'12px 14px', fontFamily:'DM Mono', fontSize:'14px', outline:'none', transition:'border-color 0.2s'}}
                onFocus={e => e.target.style.borderColor = '#adc6ff'}
                onBlur={e => e.target.style.borderColor = 'rgba(66,71,84,0.5)'}
              />
            </div>

            {/* Stay signed in */}
            <div style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer'}} onClick={() => setStaySignedIn(!staySignedIn)}>
              <div style={{width:'18px', height:'18px', borderRadius:'4px', border:'1px solid', borderColor: staySignedIn ? '#adc6ff' : 'rgba(66,71,84,0.5)', background: staySignedIn ? 'rgba(173,198,255,0.15)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s', flexShrink:0}}>
                {staySignedIn && <span className="material-symbols-outlined" style={{fontSize:'12px', color:'#adc6ff'}}>check</span>}
              </div>
              <span style={{fontFamily:'DM Mono', fontSize:'11px', color:'#8c909f'}}>Stay signed in for 30 days</span>
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
              style={{width:'100%', padding:'14px', borderRadius:'10px', border:'none', background: loading ? '#424754' : '#adc6ff', color:'#002e6a', fontFamily:'Syne', fontWeight:900, fontSize:'14px', textTransform:'uppercase', letterSpacing:'0.15em', cursor: loading ? 'not-allowed' : 'pointer', transition:'all 0.2s', marginTop:'4px'}}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{display:'flex', alignItems:'center', gap:'12px', margin:'20px 0'}}>
            <div style={{flex:1, height:'1px', background:'rgba(66,71,84,0.3)'}} />
            <span style={{fontFamily:'DM Mono', fontSize:'10px', color:'#424754'}}>OR</span>
            <div style={{flex:1, height:'1px', background:'rgba(66,71,84,0.3)'}} />
          </div>

          <p style={{fontFamily:'DM Mono', fontSize:'11px', color:'#8c909f', textAlign:'center'}}>
            New here?{' '}
            <Link href="/register" style={{color:'#adc6ff', textDecoration:'underline'}}>
              Create an account
            </Link>
          </p>
        </div>

        <p style={{fontFamily:'DM Mono', fontSize:'9px', color:'rgba(66,71,84,0.6)', marginTop:'24px', textTransform:'uppercase', letterSpacing:'0.2em'}}>
          © 2024 PROJECT_HUB — Encrypted Connection
        </p>
      </div>
    </>
  )
}