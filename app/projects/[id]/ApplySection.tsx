'use client'
// app/projects/[id]/ApplySection.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  projectId: string
  projectTitle: string
  isOwner: boolean
  isLoggedIn: boolean
  application: { id: string; status: string; message: string | null } | null
  spotsLeft: number
  projectStatus: string
  slots: number
  filledSlots: number
}

export function ApplySection({
  projectId, projectTitle, isOwner, isLoggedIn,
  application, spotsLeft, projectStatus,
}: Props) {
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleApply() {
    setLoading(true)
    setError('')
    setWarning('')
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, message }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to apply'); return }
      setSuccess(true)
      if (data.warning) setWarning(data.warning)
      setShowModal(false)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Owner view ──
  if (isOwner) {
    return (
      <section style={{
        background: 'rgba(26,31,47,0.7)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(107,216,203,0.2)', padding: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span className="material-symbols-outlined" style={{ color: '#6bd8cb', fontSize: '20px' }}>manage_accounts</span>
          <span style={{ fontFamily: 'DM Mono', fontSize: '10px', fontWeight: 700, color: '#6bd8cb', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Owner Controls
          </span>
        </div>
        <p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'rgba(194,198,214,0.6)', marginBottom: '16px' }}>
          You created this project. Review applicants from the notifications panel.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a href={`/projects/${projectId}/applications`}
            style={{ display: 'block', padding: '10px 16px', background: 'rgba(107,216,203,0.1)', border: '1px solid rgba(107,216,203,0.2)', color: '#6bd8cb', fontFamily: 'DM Mono', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none', textAlign: 'center' }}
            className="hover:bg-[#6bd8cb]/20 transition-all">
            View Applicants
          </a>
          <a href={`/projects/${projectId}/edit`}
            style={{ display: 'block', padding: '10px 16px', background: 'transparent', border: '1px solid rgba(66,71,84,0.3)', color: 'rgba(194,198,214,0.6)', fontFamily: 'DM Mono', fontSize: '11px', textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center' }}
            className="hover:bg-[#25293a] transition-all">
            Edit Project
          </a>
        </div>
      </section>
    )
  }

  // ── Already applied ──
  if (application) {
    const statusConfig = {
      pending:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)',  icon: 'schedule',     text: 'Application Pending', sub: 'The project owner will review your application soon.' },
      accepted: { color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)',  icon: 'check_circle', text: 'Application Accepted!', sub: 'You are now part of this team. Check the vault above.' },
      rejected: { color: '#fb7185', bg: 'rgba(251,113,133,0.08)', border: 'rgba(251,113,133,0.2)', icon: 'cancel',       text: 'Application Rejected', sub: 'This application was not accepted for this project.' },
      left:     { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)',  icon: 'logout',       text: 'You Left This Project', sub: 'You are no longer part of this team.' },
    }
    const cfg = statusConfig[application.status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <section style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span className="material-symbols-outlined" style={{ color: cfg.color, fontSize: '22px', flexShrink: 0 }}>{cfg.icon}</span>
          <div>
            <div style={{ fontFamily: 'DM Mono', fontSize: '12px', fontWeight: 700, color: cfg.color, marginBottom: '4px' }}>{cfg.text}</div>
            <div style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'rgba(194,198,214,0.6)', lineHeight: 1.5 }}>{cfg.sub}</div>
          </div>
        </div>
      </section>
    )
  }

  // ── Not logged in ──
  if (!isLoggedIn) {
    return (
      <section style={{ background: 'rgba(26,31,47,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(66,71,84,0.15)', padding: '24px' }}>
        <p style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#8c909f', marginBottom: '16px' }}>Sign in to apply to this project.</p>
        <a href="/api/auth/signin" style={{ display: 'block', padding: '12px', background: '#adc6ff', color: '#002e6a', fontFamily: 'DM Mono', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center' }}>
          Sign In to Apply
        </a>
      </section>
    )
  }

  // ── Project closed or full ──
  if (projectStatus !== 'open' || spotsLeft === 0) {
    return (
      <section style={{ background: 'rgba(26,31,47,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(66,71,84,0.15)', padding: '24px' }}>
        <button disabled style={{ width: '100%', padding: '14px', background: 'rgba(66,71,84,0.3)', color: '#8c909f', fontFamily: 'DM Mono', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', border: 'none', cursor: 'not-allowed' }}>
          {spotsLeft === 0 ? 'No Slots Available' : 'Project Closed'}
        </button>
      </section>
    )
  }

  // ── Can apply ──
  return (
    <>
      <section style={{ background: 'rgba(26,31,47,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(173,198,255,0.15)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
        {/* Glow effect */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(173,198,255,0.08)', filter: 'blur(40px)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} className="animate-pulse" />
          <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Accepting Applications</span>
        </div>
        <h3 style={{ fontFamily: 'Syne', fontSize: '18px', fontWeight: 700, color: '#dee1f7', marginBottom: '8px' }}>
          Join This Project
        </h3>
        <p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'rgba(194,198,214,0.5)', marginBottom: '20px', lineHeight: 1.6 }}>
          {spotsLeft} slot{spotsLeft !== 1 ? 's' : ''} remaining. Send an application to the project owner.
        </p>

        {success && (
          <div style={{ padding: '12px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', marginBottom: '16px', fontFamily: 'DM Mono', fontSize: '11px', color: '#34d399' }}>
            ✓ Application sent! The owner will be notified.
          </div>
        )}

        {warning && (
          <div style={{ padding: '12px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', marginBottom: '16px', fontFamily: 'DM Mono', fontSize: '11px', color: '#fbbf24' }}>
            {warning}
          </div>
        )}

        <button
          onClick={() => setShowModal(true)}
          style={{
            width: '100%', padding: '14px',
            background: '#adc6ff', color: '#002e6a',
            fontFamily: 'DM Mono', fontSize: '12px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 0 24px rgba(173,198,255,0.25)',
            transition: 'all 0.2s',
          }}
          className="hover:bg-[#c0d4ff] transition-all"
        >
          Apply to This Project →
        </button>
      </section>

      {/* ── Apply Modal ── */}
      {showModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(14,19,34,0.88)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
          }}
        >
          <div style={{
            width: '100%', maxWidth: '480px', background: '#1a1f2f',
            border: '1px solid rgba(66,71,84,0.3)', padding: '32px',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontFamily: 'Syne', fontSize: '22px', fontWeight: 700, color: '#dee1f7', marginBottom: '4px' }}>
                  Apply to Project
                </h2>
                <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {projectTitle}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <span className="material-symbols-outlined" style={{ color: '#8c909f', fontSize: '20px' }}>close</span>
              </button>
            </div>

            {/* Message */}
            <label style={{ display: 'block', fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(173,198,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              Intro Message <span style={{ color: 'rgba(140,144,159,0.5)' }}>(optional, max 300 chars)</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value.slice(0, 300))}
              rows={4}
              placeholder="Why are you a great fit for this project?"
              style={{
                width: '100%', background: 'rgba(14,19,34,0.6)',
                border: '1px solid rgba(66,71,84,0.3)', color: '#dee1f7',
                fontFamily: 'DM Mono', fontSize: '13px', padding: '12px 14px',
                resize: 'none', outline: 'none', lineHeight: 1.6,
                boxSizing: 'border-box',
              }}
            />
            <div style={{ textAlign: 'right', fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.4)', marginBottom: '20px' }}>
              {message.length}/300
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', marginBottom: '16px', fontFamily: 'DM Mono', fontSize: '11px', color: '#fb7185' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(66,71,84,0.3)', color: '#c2c6d6', fontFamily: 'DM Mono', fontSize: '11px', cursor: 'pointer' }}
                className="hover:bg-[#25293a] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={loading}
                style={{
                  flex: 2, padding: '12px',
                  background: loading ? 'rgba(173,198,255,0.4)' : '#adc6ff',
                  color: '#002e6a', fontFamily: 'DM Mono', fontSize: '12px', fontWeight: 700,
                  border: 'none', cursor: loading ? 'wait' : 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}
              >
                {loading ? 'Sending...' : 'Send Application →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}