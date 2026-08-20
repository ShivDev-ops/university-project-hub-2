'use client'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import SquaresBackground from '@/components/ui/SquaresBackground'

export default function RegisterPage() {
  function handleMicrosoftSignIn() {
    signIn('azure-ad', { callbackUrl: '/dashboard' })
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-zinc-950">
        <SquaresBackground />
        
        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-10">
            <h1 className="font-sans text-3xl font-bold text-emerald-500 tracking-tight flex items-center justify-center gap-3 uppercase">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              PROJECT_HUB
            </h1>
            <p className="font-mono text-[10px] text-zinc-500 tracking-[0.2em] uppercase mt-2">
              Create Account
            </p>
          </div>

          <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-md p-8 relative overflow-hidden shadow-2xl">
            {/* Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl pointer-events-none" />
            
            <h2 className="font-sans text-xl font-bold text-zinc-100 mb-1">
              Get started
            </h2>
            <p className="font-mono text-xs text-zinc-400 mb-8">
              Sign up with your university account to continue
            </p>

            <button
              onClick={handleMicrosoftSignIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-sm border-none bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] mb-8"
            >
              <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="#000000" fillOpacity="0.7"/>
                <rect x="11" y="1" width="9" height="9" fill="#000000" fillOpacity="0.7"/>
                <rect x="1" y="11" width="9" height="9" fill="#000000" fillOpacity="0.7"/>
                <rect x="11" y="11" width="9" height="9" fill="#000000" fillOpacity="0.7"/>
              </svg>
              Continue with Microsoft
            </button>

            <p className="font-mono text-[11px] text-zinc-500 text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-500 hover:text-emerald-400 hover:underline transition-all">
                Sign in
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