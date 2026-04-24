'use client'
import { useEffect } from 'react'
type ToastType = 'success' | 'error' | 'info'
interface ToastProps {
type: ToastType
message: string
onClose: () => void
duration?: number
}
const config: Record<ToastType, { color: string; icon: string; bg: string }> = {
success: { color: '#34d399', icon: 'check_circle', bg: 'rgba(52,211,153,0.08)' },
error: { color: '#fb7185', icon: 'cancel', bg: 'rgba(251,113,133,0.08)' },
info: { color: '#adc6ff', icon: 'info', bg: 'rgba(173,198,255,0.08)' },
}
export function Toast({ type, message, onClose, duration = 3500 }: ToastProps) {
useEffect(() => {
const t = setTimeout(onClose, duration)
return () => clearTimeout(t)
}, [duration, onClose])
const c = config[type]
return (
<div
className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl"
style={{
background: c.bg,
border: `1px solid ${c.color}30`,
backdropFilter: 'blur(16px)',
minWidth: '260px',
}}
>
<span className="material-symbols-outlined" style={{ color: c.color, fontSize: '20px' }}>
{c.icon}
</span>
<p style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#dee1f7', flex: 1 }}>
{message}
</p>
<button onClick={onClose}>
<span className="material-symbols-outlined" style={{ color: '#8c909f', fontSize: '16px' }}>
close
</span>
</button>
</div>
)
}