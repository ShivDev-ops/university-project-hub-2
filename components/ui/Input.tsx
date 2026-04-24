'use client'
import { InputHTMLAttributes, forwardRef } from 'react'
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
label?: string
error?: string
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
({ label, error, className = '', ...props }, ref) => {
return (
<div className="flex flex-col gap-1.5">
{label && (
<label
className="text-[10px] font-bold uppercase tracking-widest"
style={{ fontFamily: 'DM Mono', color: 'rgba(194,198,214,0.5)' }}
>
{label}
</label>
)}
<input
ref={ref}
className={[
'w-full rounded-xl px-4 py-3 text-sm outline-none transition-all',
'bg-[rgba(14,19,34,0.6)] text-[#dee1f7]',
'border border-[rgba(66,71,84,0.3)]',
'focus:border-[#adc6ff] focus:ring-1 focus:ring-[#adc6ff]/30',
'placeholder:text-[#8c909f]',
error ? 'border-[#fb7185]' : '',
className,
].join(' ')}
{...props}
/>
{error && (
<p className="text-xs text-[#fb7185]" style={{ fontFamily: 'DM Mono' }}>
{error}
</p>
)}
</div>
)
}
)
Input.displayName = 'Input'