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
'w-full rounded-md px-4 py-3 text-sm outline-none transition-all',
'bg-[rgba(14,19,34,0.6)] text-[#f4f4f5]',
'border border-[rgba(39,39,42,0.3)]',
'focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/30',
'placeholder:text-[#71717a]',
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