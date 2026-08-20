import Link from 'next/link'
interface ProjectMini {
id: string
title: string
filled_slots: number
slots: number
}
export function MyProjectsPanel({ projects }: { projects: ProjectMini[] }) {
return (
<div className="p-4 rounded-md"
style={{ background: 'rgba(24,24,27,0.6)', border: '1px solid rgba(39,39,42,0.15)' }}>
{projects.length === 0 ? (
<p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#71717a' }}>No active projects yet.</p>
) : (
<div className="space-y-2">
{projects.slice(0, 2).map(p => (
<Link key={p.id} href={`/projects/${p.id}`}>
<div className="p-3 rounded-sm hover:bg-[#18181b]"
style={{ border: '1px solid rgba(39,39,42,0.2)' }}>
<div style={{ fontSize: '12px', fontWeight: 600, color: '#f4f4f5' }}>{p.title}</div>
<div style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#71717a' }}>
{p.slots - p.filled_slots} slots open
</div>
</div>
</Link>
))}
</div>
)}
</div>
)
}