'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
interface SearchBarProps {
initialValue?: string
}
export function SearchBar({ initialValue = '' }: SearchBarProps) {
const [query, setQuery] = useState(initialValue)
const [loading, setLoading] = useState(false)
const router = useRouter()
const handleSearch = useCallback(
async (value: string) => {
if (!value.trim()) {
router.push('/dashboard')
return
}
setLoading(true)
router.push(`/dashboard?q=${encodeURIComponent(value)}`)
setLoading(false)
},
[router]
)
return (
<div className="relative group">
<div
className="absolute -inset-1 rounded-md blur opacity-20 transition duration-500 group-focus-within:opacity-60"
style={{ background: 'linear-gradient(to right, rgba(16,185,129,0.3), rgba(208,188,255,0.3))' }}
/>
<div
className="relative flex items-center rounded-md px-6 py-4"
style={{
background: 'rgba(22,27,43,0.8)',
backdropFilter: 'blur(16px)',
border: '1px solid rgba(39,39,42,0.2)',
}}
>
<span className="material-symbols-outlined mr-4" style={{ color: '#71717a' }}>
{loading ? 'hourglass_empty' : 'search'}
</span>
<input
className="bg-transparent border-none focus:ring-0 w-full"
placeholder="Search projects by skill or description..."
value={query}
onChange={e => setQuery(e.target.value)}
onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
style={{ color: '#f4f4f5', outline: 'none', fontFamily: 'Inter', fontSize: '14px' }}
/>
<div
className="flex items-center gap-2 px-3 py-1 rounded-full"
style={{
background: 'rgba(208,188,255,0.08)',
border: '1px solid rgba(208,188,255,0.15)',
}}
>
<span className="material-symbols-outlined" style={{ color: '#d0bcff', fontSize: '15px' }}>bolt</span>
<span style={{ fontFamily: 'DM Mono', fontSize: '9px', color: '#d0bcff', textTransform: 'uppercase', fontWeight: 700 }}>
AI
</span>
</div>
</div>
</div>
)
}
