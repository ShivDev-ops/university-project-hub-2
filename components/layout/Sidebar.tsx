'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
interface SidebarProps {
userName?: string
score?: number
}
const navItems = [
{ href: '/dashboard', icon: 'grid_view', label: 'Dashboard' },
{ href: '/projects/create', icon: 'rocket_launch', label: 'Post Project' },
{ href: '/profile/edit', icon: 'manage_accounts', label: 'My Profile' },
{ href: '/chat', icon: 'chat', label: 'Messages' },
]
const workspaceItems = [
{ href: '/notifications', icon: 'notifications', label: 'Notifications' },
]
export function Sidebar({ userName = 'Scholar', score = 500 }: SidebarProps) {
const pathname = usePathname()
const tierLabel =
score >= 700 ? 'Vanguard Elite' :
score >= 500 ? 'Active Scholar' : 'Probation'
const progressPct = Math.min((score / 1000) * 100, 100)
return (
<aside
className="fixed left-0 top-[60px] h-[calc(100vh-60px)] w-64 flex flex-col py-4 z-40"
style={{
background: 'rgba(9,14,28,0.8)',
backdropFilter: 'blur(24px)',
borderRight: '1px solid rgba(66,71,84,0.15)',
}}
>
<div className="px-6 mb-8 flex items-center gap-3">
<div className="w-10 h-10 rounded-xl flex items-center justify-center"
style={{ background: '#25293a', border: '1px solid rgba(66,71,84,0.3)' }}>
<span className="material-symbols-outlined" style={{ color: '#6bd8cb' }}>school</span>
</div>
<div>
<div style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#6bd8cb',
fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
{userName}
</div>
<div style={{ fontFamily: 'DM Mono', fontSize: '10px',
color: 'rgba(194,198,214,0.6)', textTransform: 'uppercase' }}>
Score: {score}
</div>
</div>
</div>
<div className="px-4 space-y-1 flex-1">
{navItems.map(item => {
const active = pathname === item.href
return (
<Link key={item.href} href={item.href}
className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
style={{
background: active ? 'rgba(77,142,255,0.1)' : 'transparent',
color: active ? '#adc6ff' : 'rgba(194,198,214,0.7)',
}}>
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
{item.icon}
</span>
<span style={{ fontFamily: 'DM Mono', fontSize: '12px' }}>{item.label}</span>
</Link>
)
})}
</div>
</aside>
)
}
