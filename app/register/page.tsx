'use client'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function RegisterPage() {
  function handleMicrosoftSignIn() {
    signIn('azure-ad', { callbackUrl: '/dashboard' })
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
            Create Account
          </p>
        </div>

        <div className="glass" style={{width:'100%', maxWidth:'400px', padding:'32px', borderRadius:'16px', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute', top:0, right:0, width:'96px', height:'96px', background:'linear-gradient(to bottom-left, rgba(160,120,255,0.1), transparent)', pointerEvents:'none'}} />

          <h2 style={{fontFamily:'Syne', fontSize:'22px', fontWeight:700, marginBottom:'6px'}}>
            Get started
          </h2>
          <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f', marginBottom:'32px'}}>
            Sign up with your university Microsoft account to continue
          </p>

          <button
            onClick={handleMicrosoftSignIn}
            className="neon"
            style={{width:'100%', padding:'14px', borderRadius:'10px', border:'none', background:'#adc6ff', color:'#002e6a', fontFamily:'Syne', fontWeight:900, fontSize:'14px', textTransform:'uppercase', letterSpacing:'0.15em', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginBottom:'24px'}}
          >
            <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            Continue with Microsoft
          </button>

          <p style={{fontFamily:'DM Mono', fontSize:'11px', color:'#8c909f', textAlign:'center'}}>
            Already have an account?{' '}
            <Link href="/login" style={{color:'#adc6ff', textDecoration:'underline'}}>Sign in</Link>
          </p>
        </div>
      </div>
    </>
  )
}