'use client'
import { useState, useEffect } from 'react'
import { SkillTag } from './SkillTag'
interface SkillSelectorProps {
selected: string[]
onChange: (skills: string[]) => void
placeholder?: string
}
export function SkillSelector({ selected, onChange, placeholder }: SkillSelectorProps) {
const [query, setQuery] = useState('')
const [suggestions, setSuggestions] = useState<string[]>([])
useEffect(() => {
if (query.length < 1) { setSuggestions([]); return }
async function fetchSkills() {
const res = await fetch(`/api/skills?q=${encodeURIComponent(query)}`)
const data = await res.json()
setSuggestions(data.skills || [])
}
const t = setTimeout(fetchSkills, 300)
return () => clearTimeout(t)
}, [query])
function addSkill(skill: string) {
if (!selected.includes(skill)) onChange([...selected, skill])
setQuery('')
setSuggestions([])
}
function removeSkill(skill: string) {
onChange(selected.filter(s => s !== skill))
}
return (
<div className="space-y-3">
<div className="relative">
<input
value={query}
onChange={e => setQuery(e.target.value)}
onKeyDown={e => {
if (e.key === 'Enter' && query.trim()) {
e.preventDefault()
addSkill(query.trim())
}
}}
placeholder={placeholder || 'Search or add a skill...'}
className="w-full rounded-xl px-4 py-3 text-sm outline-none"
style={{
background: 'rgba(14,19,34,0.6)',
border: '1px solid rgba(66,71,84,0.3)',
color: '#dee1f7',
fontFamily: 'Manrope',
}}
/>
{suggestions.length > 0 && (
<div
className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10"
style={{ background: '#1a1f2f', border: '1px solid rgba(66,71,84,0.3)' }}
>
{suggestions.map(s => (
<button
key={s}
onClick={() => addSkill(s)}
className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#25293a] transition-colors"
style={{ fontFamily: 'DM Mono', color: '#dee1f7' }}
>
{s}
</button>
))}
</div>
)}
</div>
{selected.length > 0 && (
<div className="flex flex-wrap gap-2">
{selected.map(skill => (
<button key={skill} onClick={() => removeSkill(skill)}
className="group flex items-center gap-1">
<SkillTag skill={skill} />
<span className="text-[#fb7185] opacity-0 group-hover:opacity-100
text-xs transition-opacity">x</span>
</button>
))}
</div>
)}
</div>
)
}