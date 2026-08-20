interface SkillTagProps {
skill: string
verified?: boolean
}
export function SkillTag({ skill, verified = false }: SkillTagProps) {
return (
<span
className="inline-flex items-center gap-1"
style={{
padding: '4px 10px',
borderRadius: '6px',
background: verified ? 'rgba(52,211,153,0.08)' : '#18181b',
border: verified ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(39,39,42,0.3)',
fontSize: '11px',
fontFamily: 'DM Mono',
color: verified ? '#34d399' : '#d4d4d8',
}}
>
{skill}
{verified && (
<span
className="material-symbols-outlined"
style={{ fontSize: '12px', color: '#34d399' }}
>
verified
</span>
)}
</span>
)
}