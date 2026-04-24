'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ApplyModal({ projectId, onClose }: {
  projectId: string
  onClose: () => void
}) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleApply() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, message }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong')
        return
      }
      onClose()
      router.refresh()
    } catch {
      setError('Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{background:'rgba(14,19,34,0.85)', backdropFilter:'blur(8px)'}}>
      <div className="w-full max-w-md rounded-2xl p-6"
        style={{background:'#1a1f2f', border:'1px solid rgba(66,71,84,0.3)'}}>

        <div className="flex items-center justify-between mb-6">
          <h2 style={{fontFamily:'Syne', fontSize:'20px', fontWeight:700}}>Apply to Project</h2>
          <button onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#25293a] transition-all">
            <span className="material-symbols-outlined" style={{color:'#8c909f'}}>close</span>
          </button>
        </div>

        <div className="mb-4">
          <label style={{fontFamily:'DM Mono', fontSize:'11px', color:'rgba(194,198,214,0.5)',
            textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:'8px'}}>
            Intro Message (optional)
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={300}
            rows={4}
            placeholder="Tell the project owner why you'd be a great fit..."
            className="w-full rounded-xl p-3 resize-none focus:outline-none focus:ring-1 focus:ring-[#adc6ff]"
            style={{
              background:'rgba(14,19,34,0.6)',
              border:'1px solid rgba(66,71,84,0.3)',
              color:'#dee1f7', fontSize:'14px',
              fontFamily:'Manrope'
            }}
          />
          <div className="text-right mt-1" style={{fontFamily:'DM Mono', fontSize:'10px', color:'rgba(194,198,214,0.4)'}}>
            {message.length}/300
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm" style={{color:'#fb7185', fontFamily:'DM Mono'}}>{error}</p>
        )}

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm transition-all hover:bg-[#25293a]"
            style={{border:'1px solid rgba(66,71,84,0.3)', fontFamily:'DM Mono', color:'#c2c6d6'}}>
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{background: loading ? 'rgba(173,198,255,0.5)' : '#adc6ff',
              color:'#002e6a', fontFamily:'DM Mono', cursor: loading ? 'wait' : 'pointer'}}>
            {loading ? 'Sending...' : 'Send Application'}
          </button>
        </div>
      </div>
    </div>
  )
}