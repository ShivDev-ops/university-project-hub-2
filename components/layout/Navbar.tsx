import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
export async function Navbar() {
const session = await getServerSession(authOptions)
let profile = null
if (session?.user?.id) {
const { data } = await supabaseAdmin
.from('profiles')
.select('full_name, avatar_url, score')
.eq('user_id', session.user.id)
.single()
profile = data
}
return (
<header
className="fixed top-0 w-full h-[60px] flex items-center justify-between px-6 z-50"
style={{
background: 'rgba(14,19,34,0.6)',
backdropFilter: 'blur(20px)',
borderBottom: '1px solid rgba(66,71,84,0.15)',
boxShadow: '0 0 20px rgba(77,142,255,0.08)',
}}
>
<div className="flex items-center gap-8">
<Link href="/dashboard"
style={{ fontFamily: 'Syne', fontSize: '18px', fontWeight: 900,
letterSpacing: '-0.05em', color: '#adc6ff' }}>
PROJECT_HUB
</Link>
<nav className="hidden md:flex items-center gap-6">
{['Discover','Labs','Teams','Archive'].map(item => (
<Link key={item} href="#"
style={{ fontSize: '13px', fontWeight: 500, color: '#c2c6d6', fontFamily: 'DM Mono' }}
className="hover:text-[#adc6ff] transition-colors">
{item}
</Link>
))}
</nav>
</div>
<div className="flex items-center gap-3">
<Link href="/notifications">
<button className="p-2 rounded-lg hover:bg-[#adc6ff]/10 transition-all">
<span className="material-symbols-outlined" style={{ color: '#c2c6d6', fontSize: '22px' }}>
notifications
</span>
</button>
</Link>
<Link href="/profile/edit">
<div className="w-8 h-8 rounded-full border-2 overflow-hidden"
style={{ borderColor: '#adc6ff' }}>
{profile?.avatar_url ? (
<img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
) : (
<div className="w-full h-full flex items-center justify-center"
style={{ background: '#25293a' }}>
<span className="material-symbols-outlined"
style={{ fontSize: '16px', color: '#adc6ff' }}>person</span>
</div>
)}
</div>
</Link>
</div>
</header>
)
}