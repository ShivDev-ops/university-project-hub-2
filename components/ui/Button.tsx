'use client'
import { ButtonHTMLAttributes, ReactNode } from 'react'
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
variant?: Variant
size?: Size
loading?: boolean
children: ReactNode
}
const variantStyles: Record<Variant, string> = {
primary: 'bg-[#adc6ff] text-[#002e6a] hover:bg-[#c0d4ff]',
secondary: 'bg-[#25293a] text-[#dee1f7] hover:bg-[#2f3447] border border-[#2a2f42]',
ghost: 'bg-transparent text-[#adc6ff] hover:bg-[#adc6ff]/10',
danger: 'bg-[#fb7185]/10 text-[#fb7185] hover:bg-[#fb7185]/20 border border-[#fb7185]/30',
}
const sizeStyles: Record<Size, string> = {
sm: 'px-3 py-1.5 text-xs',
md: 'px-5 py-2.5 text-sm',
lg: 'px-7 py-3 text-base',
}
export function Button({
variant = 'primary',
size = 'md',
loading = false,
disabled,
children,
className = '',
...props
}: ButtonProps) {
return (
<button
disabled={disabled || loading}
className={[
'rounded-lg font-bold transition-all duration-200',
'disabled:opacity-50 disabled:cursor-not-allowed',
'font-[DM_Mono]',
variantStyles[variant],
sizeStyles[size],
className,
].join(' ')}
{...props}
>
{loading ? (
<span className="flex items-center gap-2">
<svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
<circle className="opacity-25" cx="12" cy="12" r="10"
stroke="currentColor" strokeWidth="4" />
<path className="opacity-75" fill="currentColor"
d="M4 12a8 8 0 018-8v8H4z" />
</svg>
Loading...
</span>
) : children}
</button>
)
}