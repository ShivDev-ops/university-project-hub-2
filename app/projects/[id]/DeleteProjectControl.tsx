'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type DeleteProjectControlProps = {
  projectId: string
  projectTitle: string
}

export function DeleteProjectControl({ projectId, projectTitle }: DeleteProjectControlProps) {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const canDelete = useMemo(() => confirmText.trim() === projectTitle, [confirmText, projectTitle])

  async function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canDelete || loading) return

    const confirmed = window.confirm(
      `Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`
    )
    if (!confirmed) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmProjectName: confirmText.trim() }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(payload?.error || 'Unable to delete project right now.')
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Network error while deleting project. Please try again.')
      setLoading(false)
    }
  }

  return (
    <section className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(251,113,133,0.28)' }}>
      <h3 style={{ fontFamily: 'Syne', fontSize: '15px', fontWeight: 700, color: '#fb7185', textTransform: 'uppercase', marginBottom: '10px' }}>
        Danger Zone
      </h3>
      <p style={{ fontSize: '12px', color: 'rgba(194,198,214,0.75)', lineHeight: 1.6, marginBottom: '12px' }}>
        This will remove this project from active listings. To confirm, type the exact project name.
      </p>

      <div style={{ marginBottom: '10px', fontFamily: 'DM Mono', fontSize: '10px', color: '#c2c6d6' }}>
        Type: <span style={{ color: '#dee1f7' }}>{projectTitle}</span>
      </div>

      <form onSubmit={handleDelete} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

        <button
          type="submit"
          disabled={!canDelete || loading}
          style={{
            width: '100%',
            padding: '9px 10px',
            border: '1px solid rgba(251,113,133,0.35)',
            background: canDelete ? 'rgba(251,113,133,0.18)' : 'rgba(66,71,84,0.2)',
            color: canDelete ? '#fb7185' : '#8c909f',
            fontFamily: 'DM Mono',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            cursor: canDelete && !loading ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? 'Deleting...' : 'Delete Project'}
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
