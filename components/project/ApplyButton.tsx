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
        className="w-full py-3 rounded-xl font-bold text-sm transition-all"
        style={{
          fontFamily: 'DM Mono',
          background: disabled ? 'rgba(66,71,84,0.3)' : '#adc6ff',
          color: disabled ? '#8c909f' : '#002e6a',
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