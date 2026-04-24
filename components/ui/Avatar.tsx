interface AvatarProps {
src?: string | null
name: string
size?: 'sm' | 'md' | 'lg'
showScore?: boolean
score?: number
}
const sizes = {
sm: { box: 'w-7 h-7', text: '12px', icon: '14px' },
md: { box: 'w-10 h-10', text: '14px', icon: '18px' },
lg: { box: 'w-16 h-16', text: '20px', icon: '28px' },
}
function scoreColor(score: number) {
if (score >= 600) return '#34d399'
if (score >= 400) return '#fbbf24'
return '#fb7185'
}
export function Avatar({ src, name, size = 'md', showScore, score = 500 }: AvatarProps) {
const s = sizes[size]
const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
return (
<div className="relative inline-block">
<div
className={`${s.box} rounded-xl overflow-hidden flex items-center justify-center`}
style={{ background: '#25293a', border: '1px solid rgba(66,71,84,0.3)' }}
>
{src ? (
<img src={src} alt={name} className="w-full h-full object-cover" />
) : (
<span style={{ fontSize: s.text, color: '#adc6ff', fontWeight: 700 }}>
{initials}
</span>
)}
</div>
{showScore && score !== undefined && (
<span
className="absolute -bottom-1 -right-1 text-[8px] font-bold px-1 rounded-full"
style={{
background: `${scoreColor(score)}20`,
color: scoreColor(score),
fontFamily: 'DM Mono',
border: `1px solid ${scoreColor(score)}40`,
}}
>
{score}
</span>
)}
</div>
)
}