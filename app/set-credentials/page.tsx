// File: app/set-credentials/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function SetCredentialsPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { update } = useSession()

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

    // Check username
    const checkRes = await fetch('/api/auth/check-username', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })
    const checkData = await checkRes.json()

    if (checkData.taken) {
      setError('Username already taken')
      setLoading(false)
      return
    }

    // Save credentials
    const res = await fetch('/api/auth/save-credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Failed to save credentials')
      return
    }

    await update()
    router.push('/profile/setup')
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Manrope:wght@400;500;600&family=DM+Mono&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background-color: #09090b; color: #f4f4f5; font-family: 'Manrope', sans-serif; }
        .glass { background: rgba(24,24,27,0.7); backdrop-filter: blur(20px); border: 1px solid rgba(16,185,129,0.1); }
        .mesh { background: radial-gradient(circle at 50% 50%, rgba(16,185,129,0.05) 0%, #09090b 70%); }
        .dots { background-image: radial-gradient(rgba(16,185,129,0.08) 1px, transparent 0); background-size: 24px 24px; }
        .neon { box-shadow: 0 0 24px rgba(16,185,129,0.35); }
      `}</style>

      <div style={{position:'fixed', inset:0, zIndex:-1}} className="mesh" />
      <div style={{position:'fixed', inset:0, zIndex:-1, opacity:0.3}} className="dots" />

      <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px'}}>

        <div style={{textAlign:'center', marginBottom:'32px'}}>
          <h1 style={{fontFamily:'Inter', fontSize:'2.5rem', fontWeight:900, color:'#10b981', letterSpacing:'-0.05em', textTransform:'uppercase'}}>
            PROJECT_HUB
          </h1>
          <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#71717a', letterSpacing:'0.2em', textTransform:'uppercase', marginTop:'6px'}}>
            One time setup
          </p>
        </div>

        <div className="glass" style={{width:'100%', maxWidth:'400px', padding:'32px', borderRadius:'6px', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute', top:0, right:0, width:'96px', height:'96px', background:'linear-gradient(to bottom-left, rgba(160,120,255,0.1), transparent)', pointerEvents:'none'}} />

          <h2 style={{fontFamily:'Inter', fontSize:'22px', fontWeight:700, marginBottom:'6px'}}>
            Set your login credentials
          </h2>
          <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#71717a', marginBottom:'24px'}}>
            Create a username and password so you can log in without Microsoft next time
          </p>

          <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'16px'}}>
            <div>
              <label style={{fontFamily:'DM Mono', fontSize:'10px', color:'#10b981', textTransform:'uppercase', letterSpacing:'0.15em', display:'block', marginBottom:'6px'}}>
                Username
              </label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="your_username"
                required
                style={{width:'100%', background:'#18181b', border:'1px solid rgba(39,39,42,0.5)', borderRadius:'4px', color:'#f4f4f5', padding:'12px 14px', fontFamily:'DM Mono', fontSize:'14px', outline:'none', transition:'border-color 0.2s'}}
                onFocus={e => e.target.style.borderColor = '#10b981'}
                onBlur={e => e.target.style.borderColor = 'rgba(39,39,42,0.5)'}
              />
              <p style={{fontFamily:'DM Mono', fontSize:'9px', color:'#27272a', marginTop:'4px'}}>
                Lowercase letters, numbers, underscores only
              </p>
            </div>

            <div>
              <label style={{fontFamily:'DM Mono', fontSize:'10px', color:'#10b981', textTransform:'uppercase', letterSpacing:'0.15em', display:'block', marginBottom:'6px'}}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                style={{width:'100%', background:'#18181b', border:'1px solid rgba(39,39,42,0.5)', borderRadius:'4px', color:'#f4f4f5', padding:'12px 14px', fontFamily:'DM Mono', fontSize:'14px', outline:'none', transition:'border-color 0.2s'}}
                onFocus={e => e.target.style.borderColor = '#10b981'}
                onBlur={e => e.target.style.borderColor = 'rgba(39,39,42,0.5)'}
              />
            </div>

            <div>
              <label style={{fontFamily:'DM Mono', fontSize:'10px', color:'#10b981', textTransform:'uppercase', letterSpacing:'0.15em', display:'block', marginBottom:'6px'}}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                style={{width:'100%', background:'#18181b', border:'1px solid rgba(39,39,42,0.5)', borderRadius:'4px', color:'#f4f4f5', padding:'12px 14px', fontFamily:'DM Mono', fontSize:'14px', outline:'none', transition:'border-color 0.2s'}}
                onFocus={e => e.target.style.borderColor = '#10b981'}
                onBlur={e => e.target.style.borderColor = 'rgba(39,39,42,0.5)'}
              />
            </div>

            {error && (
              <p style={{color:'#ffb4ab', fontFamily:'DM Mono', fontSize:'11px', padding:'10px', background:'rgba(255,68,68,0.05)', border:'1px solid rgba(255,68,68,0.1)', borderRadius:'4px'}}>
                ⚠ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="neon"
              style={{width:'100%', padding:'14px', borderRadius:'4px', border:'none', background: loading ? '#27272a' : '#10b981', color:'#000000', fontFamily:'Inter', fontWeight:900, fontSize:'14px', textTransform:'uppercase', letterSpacing:'0.15em', cursor: loading ? 'not-allowed' : 'pointer', transition:'all 0.2s'}}
            >
              {loading ? 'Saving...' : 'Save & Continue →'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}