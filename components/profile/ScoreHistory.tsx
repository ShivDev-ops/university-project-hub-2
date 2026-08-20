interface ScoreEntry {
date: string
action: string
change: number
total: number
}
interface ScoreHistoryProps {
entries: ScoreEntry[]
}
export function ScoreHistory({ entries }: ScoreHistoryProps) {
if (entries.length === 0) {
return <p style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#71717a' }}>No score history yet.</p>
}
return (
<div className="overflow-hidden rounded-md" style={{ border: '1px solid rgba(39,39,42,0.2)' }}>
<table className="w-full text-sm">
<thead>
<tr style={{ background: 'rgba(14,19,34,0.6)' }}>
{['Date', 'Action', 'Change', 'Total'].map(h => (
<th key={h} className="px-4 py-3 text-left"
style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#10b981' }}>
{h}
</th>
))}
</tr>
</thead>
<tbody>
{entries.map((e, i) => (
<tr key={i} style={{ background: i % 2 === 0 ? 'rgba(24,24,27,0.4)' : 'rgba(22,27,43,0.4)' }}>
<td className="px-4 py-3" style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'rgba(194,198,214,0.6)' }}>
{new Date(e.date).toLocaleDateString()}
</td>
<td className="px-4 py-3" style={{ fontSize: '12px', color: '#f4f4f5' }}>{e.action}</td>
<td className="px-4 py-3" style={{ fontFamily: 'DM Mono', fontSize: '12px', fontWeight: 700,
color: e.change >= 0 ? '#34d399' : '#fb7185' }}>
{e.change >= 0 ? '+' : ''}{e.change}
</td>
<td className="px-4 py-3" style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#f4f4f5' }}>
{e.total}
</td>
</tr>
))}
</tbody>
</table>
</div>
)
}
