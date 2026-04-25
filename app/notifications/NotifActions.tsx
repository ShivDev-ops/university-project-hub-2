'use client'
// app/notifications/NotifActions.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// ── Mark all read ──────────────────────────────────────────────────────────────

function MarkAllRead() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleMarkAll() {
    setLoading(true)
    await fetch('/api/notifications/mark-read', { method: 'POST' })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleMarkAll}
      disabled={loading}
      style={{
        padding: '8px 16px', background: 'transparent',
        border: '1px solid rgba(66,71,84,0.3)', color: 'rgba(194,198,214,0.6)',
        fontFamily: 'DM Mono', fontSize: '10px', textTransform: 'uppercase',
        letterSpacing: '0.1em', cursor: 'pointer',
      }}
      className="hover:bg-[#25293a] transition-all"
    >
      {loading ? 'Marking...' : 'Mark All Read'}
    </button>
  )
}

// ── Accept / Reject ────────────────────────────────────────────────────────────

interface AcceptRejectProps {
  applicationId: string
  notifId: string
  applicantName: string
  applicantScore: number
}

function AcceptReject({ applicationId, notifId, applicantName, applicantScore }: AcceptRejectProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'accepted' | 'rejected' | 'error'>('idle')
  const [confirm, setConfirm] = useState<'accept' | 'reject' | null>(null)
  const router = useRouter()

  async function handleAction(action: 'accepted' | 'rejected') {
    setStatus('loading')
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      })

      if (!res.ok) {
        const data = await res.json()
        console.error('Action error:', data.error)
        setStatus('error')
        return
      }

      // Mark notification as read
      await fetch(`/api/notifications/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notifId }),
      })

      setStatus(action === 'accepted' ? 'accepted' : 'rejected')
      setConfirm(null)
      router.refresh()
    } catch {
      setStatus('error')
    }
  }

  // Already decided
  if (status === 'accepted') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '8px 12px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
        <span className="material-symbols-outlined" style={{ color: '#34d399', fontSize: '16px' }}>check_circle</span>
        <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#34d399' }}>
          {applicantName} accepted — welcome to the team!
        </span>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '8px 12px', background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.15)' }}>
        <span className="material-symbols-outlined" style={{ color: '#fb7185', fontSize: '16px' }}>cancel</span>
        <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#fb7185' }}>
          Application rejected.
        </span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#fb7185', marginTop: '8px' }}>
        Something went wrong. Try again.
      </p>
    )
  }

  return (
    <div style={{ marginTop: '14px' }}>
      {/* Applicant score chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.5)' }}>Applicant score:</span>
        <span style={{
          padding: '2px 8px', borderRadius: '999px', fontFamily: 'DM Mono', fontSize: '10px', fontWeight: 700,
          background: applicantScore >= 600 ? 'rgba(52,211,153,0.1)' : applicantScore >= 400 ? 'rgba(251,191,36,0.1)' : 'rgba(251,113,133,0.1)',
          color: applicantScore >= 600 ? '#34d399' : applicantScore >= 400 ? '#fbbf24' : '#fb7185',
        }}>
          {applicantScore}
        </span>
      </div>

      {confirm ? (
        /* Confirmation step */
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#fbbf24' }}>
            {confirm === 'accept' ? `Accept ${applicantName}?` : `Reject ${applicantName}?`}
          </span>
          <button
            onClick={() => handleAction(confirm === 'accept' ? 'accepted' : 'rejected')}
            disabled={status === 'loading'}
            style={{
              padding: '5px 14px', fontFamily: 'DM Mono', fontSize: '10px', fontWeight: 700, cursor: 'pointer', border: 'none',
              background: confirm === 'accept' ? 'rgba(52,211,153,0.2)' : 'rgba(251,113,133,0.2)',
              color: confirm === 'accept' ? '#34d399' : '#fb7185',
            }}
          >
            {status === 'loading' ? '...' : 'Confirm'}
          </button>
          <button
            onClick={() => setConfirm(null)}
            style={{ padding: '5px 14px', fontFamily: 'DM Mono', fontSize: '10px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(66,71,84,0.3)', color: '#8c909f' }}
          >
            Cancel
          </button>
        </div>
      ) : (
        /* Default buttons */
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setConfirm('accept')}
            style={{
              padding: '7px 18px', fontFamily: 'DM Mono', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
              background: 'rgba(52,211,153,0.1)', color: '#34d399',
              border: '1px solid rgba(52,211,153,0.25)', textTransform: 'uppercase', letterSpacing: '0.05em',
              transition: 'all 0.15s',
            }}
            className="hover:bg-[#34d399]/20 transition-all"
          >
            ✓ Accept
          </button>
          <button
            onClick={() => setConfirm('reject')}
            style={{
              padding: '7px 18px', fontFamily: 'DM Mono', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
              background: 'rgba(251,113,133,0.08)', color: '#fb7185',
              border: '1px solid rgba(251,113,133,0.2)', textTransform: 'uppercase', letterSpacing: '0.05em',
              transition: 'all 0.15s',
            }}
            className="hover:bg-[#fb7185]/15 transition-all"
          >
            ✕ Reject
          </button>
        </div>
      )}
    </div>
  )
}

// ── Exported wrapper ───────────────────────────────────────────────────────────

interface NotifActionsProps {
  mode: 'mark-all' | 'accept-reject'
  applicationId?: string
  notifId?: string
  applicantName?: string
  applicantScore?: number
}

export function NotifActions({ mode, applicationId, notifId, applicantName, applicantScore }: NotifActionsProps) {
  if (mode === 'mark-all') return <MarkAllRead />
  if (mode === 'accept-reject' && applicationId && notifId) {
    return (
      <AcceptReject
        applicationId={applicationId}
        notifId={notifId}
        applicantName={applicantName || 'Applicant'}
        applicantScore={applicantScore || 500}
      />
    )
  }
  return null
}