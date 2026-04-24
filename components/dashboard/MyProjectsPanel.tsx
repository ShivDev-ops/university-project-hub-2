import Link from 'next/link'
interface ProjectMini {
id: string
title: string
filled_slots: number
slots: number
}
export function MyProjectsPanel({ projects }: { projects: ProjectMini[] }) {
return (
<div className="p-4 rounded-xl"
style={{ background: 'rgba(26,31,47,0.6)', border: '1px solid rgba(66,71,84,0.15)' }}>
{projects.length === 0 ? (
<p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#8c909f' }}>No active projects yet.</p>
) : (
<div className="space-y-2">
{projects.slice(0, 2).map(p => (
<Link key={p.id} href={`/projects/${p.id}`}>
<div className="p-3 rounded-lg hover:bg-[#25293a]"
style={{ border: '1px solid rgba(66,71,84,0.2)' }}>
<div style={{ fontSize: '12px', fontWeight: 600, color: '#dee1f7' }}>{p.title}</div>
<div style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#8c909f' }}>
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