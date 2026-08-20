'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SquaresBackground from '@/components/ui/SquaresBackground'

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
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-zinc-950">
        <SquaresBackground />
        
        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-10">
            <h1 className="font-sans text-3xl font-bold text-emerald-500 tracking-tight flex items-center justify-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              PROJECT_HUB
            </h1>
            <p className="font-mono text-[10px] text-zinc-500 tracking-[0.2em] uppercase mt-2">
              University Research Network
            </p>
          </div>

          <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-md p-8 relative overflow-hidden shadow-2xl">
            {/* Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl pointer-events-none" />
            
            <h2 className="font-sans text-xl font-bold text-zinc-100 mb-1">
              Welcome back
            </h2>
            <p className="font-mono text-xs text-zinc-400 mb-8">
              Sign in to access your projects
            </p>

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div>
                <label className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block mb-2">
                  Your email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-sm text-zinc-100 px-4 py-3 font-mono text-sm outline-none transition-colors focus:border-emerald-500/50 focus:bg-zinc-900/80"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                    Password
                  </label>
                  <Link href="/forgot-password" className="font-mono text-[10px] text-zinc-500 hover:text-emerald-500 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-sm text-zinc-100 px-4 py-3 font-mono text-sm outline-none transition-colors focus:border-emerald-500/50 focus:bg-zinc-900/80"
                />
              </div>

              {/* Stay signed in */}
              <div 
                className="flex items-center gap-3 cursor-pointer group mt-1" 
                onClick={() => setStaySignedIn(!staySignedIn)}
              >
                <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all flex-shrink-0 ${staySignedIn ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-zinc-950/50 border-zinc-800 group-hover:border-zinc-600'}`}>
                  {staySignedIn && <span className="material-symbols-outlined text-[12px] text-emerald-500 font-bold">check</span>}
                </div>
                <span className="font-mono text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">Stay signed in for 30 days</span>
              </div>

              {error && (
                <p className="text-red-400 font-mono text-xs p-3 bg-red-500/10 border border-red-500/20 rounded-sm mt-2">
                  ⚠ {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-sm border-none bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="font-mono text-[10px] text-zinc-600">OR</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <p className="font-mono text-[11px] text-zinc-500 text-center">
              New here?{' '}
              <Link href="/register" className="text-emerald-500 hover:text-emerald-400 hover:underline transition-all">
                Create an account
              </Link>
            </p>
          </div>

          <p className="font-mono text-[9px] text-zinc-700 text-center mt-8 uppercase tracking-widest">
            © 2024 PROJECT_HUB — Encrypted Connection
          </p>
        </div>
      </div>
    </>
  )
}