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
background: verified ? 'rgba(52,211,153,0.08)' : '#25293a',
border: verified ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(66,71,84,0.3)',
fontSize: '11px',
fontFamily: 'DM Mono',
color: verified ? '#34d399' : '#c2c6d6',
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