'use client'
import { useState } from 'react'
import { ApplyModal } from './ApplyModal'

export function ApplyButton({ projectId, disabled, disabledReason }: {
  projectId: string
  disabled: boolean
  disabledReason?: string
}) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => !disabled && setModalOpen(true)}
        disabled={disabled}
        className="w-full py-3 rounded-md font-bold text-sm transition-all"
        style={{
          fontFamily: 'DM Mono',
          background: disabled ? 'rgba(39,39,42,0.3)' : '#10b981',
          color: disabled ? '#71717a' : '#000000',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {disabled && disabledReason ? disabledReason : 'Apply to This Project'}
      </button>

      {modalOpen && (
        <ApplyModal
          projectId={projectId}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}