'use client'
import { ReactNode, useEffect } from 'react'
interface ModalProps {
isOpen: boolean
onClose: () => void
title: string
children: ReactNode
}
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
useEffect(() => {
if (isOpen) document.body.style.overflow = 'hidden'
else document.body.style.overflow = ''
return () => { document.body.style.overflow = '' }
}, [isOpen])
if (!isOpen) return null
return (
<div
className="fixed inset-0 z-50 flex items-center justify-center px-4"
style={{ background: 'rgba(14,19,34,0.85)', backdropFilter: 'blur(8px)' }}
onClick={e => { if (e.target === e.currentTarget) onClose() }}
>
<div
className="w-full max-w-md rounded-md p-6"
style={{ background: '#1a1f2f', border: '1px solid rgba(39,39,42,0.3)' }}
>
<div className="flex items-center justify-between mb-6">
<h2 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: 700, color: '#f4f4f5' }}>
{title}
</h2>
<button
onClick={onClose}
className="p-1.5 rounded-sm hover:bg-[#18181b] transition-all"
>
<span className="material-symbols-outlined" style={{ color: '#71717a', fontSize: '20px' }}>
close
</span>
</button>
</div>
{children}
</div>
</div>
)
}