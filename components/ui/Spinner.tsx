interface SpinnerProps {
size?: 'sm' | 'md' | 'lg'
color?: string
}
const sizes = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-10 h-10' }
export function Spinner({ size = 'md', color = '#adc6ff' }: SpinnerProps) {
return (
<svg
className={`${sizes[size]} animate-spin`}
fill="none"
viewBox="0 0 24 24"
>
<circle
className="opacity-20"
cx="12" cy="12" r="10"
stroke={color}
strokeWidth="3"
/>
<path
fill={color}
className="opacity-80"
d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
/>
</svg>
)
}