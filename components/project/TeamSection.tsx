interface Member {
id: string
full_name: string
avatar_url: string | null
score: number
department: string | null
}
interface TeamSectionProps {
members: Member[]
isTeamMember: boolean
totalCount: number
}
export function TeamSection({ members, isTeamMember, totalCount }: TeamSectionProps) {
if (!isTeamMember) {
return (
<div className="rounded-md p-6"
style={{ background: 'rgba(24,24,27,0.4)', border: '1px solid rgba(39,39,42,0.15)' }}>
<p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#71717a' }}>
{totalCount} member(s) -- join to see team
</p>
</div>
)
}
return (
<div className="rounded-md p-5"
style={{ background: 'rgba(24,24,27,0.4)', border: '1px solid rgba(39,39,42,0.15)' }}>
<div className="space-y-3">
{members.map(member => (
<div key={member.id} className="flex items-center gap-3">
<div style={{ fontSize: '13px', fontWeight: 600, color: '#f4f4f5' }}>
{member.full_name}
</div>
<div style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.5)' }}>
{member.department ?? 'University'}
</div>
</div>
))}
</div>
</div>
)
}
