'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type LeaveProjectControlProps = {
  projectId: string
  projectTitle: string
}

export function LeaveProjectControl({ projectId, projectTitle }: LeaveProjectControlProps) {
  const [confirmText, setConfirmText] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const canLeave = useMemo(() => {
    return confirmText.trim() === projectTitle && reason.trim().length >= 5
  }, [confirmText, projectTitle, reason])

  async function handleLeave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canLeave || loading) return

    const confirmed = window.confirm(
      `Are you sure you want to leave "${projectTitle}"? You will lose vault access immediately.`
    )
    if (!confirmed) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${projectId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmProjectName: confirmText.trim(),
          reason: reason.trim(),
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(payload?.error || 'Unable to leave project right now.')
        setLoading(false)
        return
      }

      router.refresh()
    } catch {
      setError('Network error while leaving project. Please try again.')
      setLoading(false)
    }
  }

  return (
    <section className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(251,191,36,0.28)' }}>
      <h3 style={{ fontFamily: 'Syne', fontSize: '15px', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '10px' }}>
        Leave Team
      </h3>
      <p style={{ fontSize: '12px', color: 'rgba(194,198,214,0.75)', lineHeight: 1.6, marginBottom: '12px' }}>
        This removes you from the team and closes vault access. Type the project name and provide a reason.
      </p>

      <div style={{ marginBottom: '10px', fontFamily: 'DM Mono', fontSize: '10px', color: '#c2c6d6' }}>
        Type: <span style={{ color: '#dee1f7' }}>{projectTitle}</span>
      </div>

      <form onSubmit={handleLeave} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Enter project title"
          style={{
            width: '100%',
            padding: '9px 10px',
            background: 'rgba(14,19,34,0.7)',
            border: '1px solid rgba(66,71,84,0.4)',
            color: '#dee1f7',
            fontFamily: 'DM Mono',
            fontSize: '11px',
            outline: 'none',
          }}
        />

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value.slice(0, 500))}
          placeholder="Reason for leaving (minimum 5 characters)"
          rows={4}
          style={{
            width: '100%',
            padding: '9px 10px',
            background: 'rgba(14,19,34,0.7)',
            border: '1px solid rgba(66,71,84,0.4)',
            color: '#dee1f7',
            fontFamily: 'DM Mono',
            fontSize: '11px',
            outline: 'none',
            resize: 'vertical',
            lineHeight: 1.6,
          }}
        />

        <div style={{ textAlign: 'right', fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.5)' }}>
          {reason.length}/500
        </div>

        <button
          type="submit"
          disabled={!canLeave || loading}
          style={{
            width: '100%',
            padding: '9px 10px',
            border: '1px solid rgba(251,191,36,0.35)',
            background: canLeave ? 'rgba(251,191,36,0.18)' : 'rgba(66,71,84,0.2)',
            color: canLeave ? '#fbbf24' : '#8c909f',
            fontFamily: 'DM Mono',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            cursor: canLeave && !loading ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? 'Leaving...' : 'Leave Project'}
        </button>
      </form>

      {error && (
        <p style={{ marginTop: '10px', fontFamily: 'DM Mono', fontSize: '10px', color: '#fb7185' }}>
          {error}
        </p>
      )}
    </section>
  )
}
