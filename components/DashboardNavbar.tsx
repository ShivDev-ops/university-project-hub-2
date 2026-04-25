'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardNavbar({ profile }: { profile: any }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const profileHref = profile?.user_id ? `/profile/${profile.user_id}` : '/profile/edit'

  return (
    <>
      <header className="fixed top-0 w-full h-[60px] backdrop-blur-xl border-b flex justify-between items-center px-4 md:px-6 z-50"
        style={{background:'rgba(14,19,34,0.6)', borderColor:'rgba(66,71,84,0.15)', boxShadow:'0 0 20px rgba(77,142,255,0.1)'}}>
      <div className="flex items-center gap-4 md:gap-8">
        <Link href="/dashboard">
          <div style={{fontFamily:'Syne', fontSize:'20px', fontWeight:900, letterSpacing:'-0.05em', color:'#adc6ff', cursor:'pointer'}}>
            PROJECT_HUB
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" style={{fontSize:'14px', fontWeight:500, color:'#adc6ff', borderBottom:'2px solid #adc6ff', paddingBottom:'4px'}}>Discover</Link>
          <a href="#" style={{fontSize:'14px', fontWeight:500, color:'#c2c6d6'}} className="hover:text-[#adc6ff] transition-colors">Labs</a>
          <a href="#" style={{fontSize:'14px', fontWeight:500, color:'#c2c6d6'}} className="hover:text-[#adc6ff] transition-colors">Teams</a>
          <a href="#" style={{fontSize:'14px', fontWeight:500, color:'#c2c6d6'}} className="hover:text-[#adc6ff] transition-colors">Archive</a>
        </nav>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <Link href="/notifications" className="hidden md:block">
          <button className="p-2 rounded-lg transition-all hover:bg-[#4d8eff]/20">
            <span className="material-symbols-outlined" style={{color:'#c2c6d6'}}>notifications</span>
          </button>
        </Link>
        <button className="hidden md:block p-2 rounded-lg transition-all hover:bg-[#4d8eff]/20">
          <span className="material-symbols-outlined" style={{color:'#c2c6d6'}}>terminal</span>
        </button>
        <Link href={profileHref}>
          <div className="w-8 h-8 rounded-full border-2 overflow-hidden" style={{borderColor:'#adc6ff'}}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{background:'#25293a'}}>
                <span className="material-symbols-outlined" style={{fontSize:'16px', color:'#adc6ff'}}>person</span>
              </div>
            )}
          </div>
        </Link>
        <button
          className="md:hidden p-2 rounded-lg transition-all hover:bg-[#4d8eff]/20"
          onClick={() => setMobileOpen(open => !open)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined" style={{color:'#c2c6d6'}}>{mobileOpen ? 'close' : 'menu'}</span>
        </button>
      </div>
    </header>

    {mobileOpen && (
      <div className="md:hidden fixed top-[60px] left-0 right-0 z-40 px-4 py-3"
        style={{ background:'rgba(14,19,34,0.96)', borderBottom:'1px solid rgba(66,71,84,0.2)' }}>
        <div className="rounded-xl p-3"
          style={{ background:'rgba(26,31,47,0.8)', border:'1px solid rgba(66,71,84,0.2)' }}>
          {[
            { href: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
            { href: '/projects/create', label: 'Post Project', icon: 'rocket_launch' },
            { href: profileHref, label: 'My Profile', icon: 'manage_accounts' },
            { href: '/notifications', label: 'Notifications', icon: 'notifications' },
          ].map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
              style={pathname === item.href ? { background:'rgba(77,142,255,0.12)', color:'#adc6ff' } : { color:'rgba(194,198,214,0.85)' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'18px' }}>{item.icon}</span>
              <span style={{ fontFamily:'DM Mono', fontSize:'12px' }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    )}
    </>
  )
}
