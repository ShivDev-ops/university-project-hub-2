import Link from 'next/link'
import { ScoreBadge } from '@/components/ScoreBadge'
interface ProfileCardProps {
profile: {
id: string
full_name: string
avatar_url: string | null
score: number
department: string | null
year: number | null
}
}
export function ProfileCard({ profile }: ProfileCardProps) {
return (
<div className="rounded-md p-5"
style={{ background: 'rgba(24,24,27,0.6)', border: '1px solid rgba(39,39,42,0.15)' }}>
<div className="flex items-center gap-3 mb-4">
<div>
<div style={{ fontWeight: 700, fontSize: '15px', color: '#f4f4f5' }}>
{profile.full_name}
</div>
<div style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'rgba(194,198,214,0.5)' }}>
{profile.department} {profile.year ? `Year ${profile.year}` : ''}
</div>
</div>
</div>
<ScoreBadge score={profile.score} />
<Link href={`/profile/${profile.id}`}>
<button className="w-full py-2 rounded-sm mt-4"
style={{ border: '1px solid rgba(39,39,42,0.2)', color: '#d4d4d8' }}>
View Full Profile
</button>
</Link>
</div>
)
}