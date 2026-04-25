'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardSidebar({ profile, session }: { profile: any, session: any }) {
  const pathname = usePathname()
  const profileHref = session?.user?.id ? `/profile/${session.user.id}` : '/profile/edit'

  return (
    <aside className="fixed left-0 top-[60px] h-[calc(100vh-60px)] w-64 flex flex-col py-4 z-40"
      style={{background:'rgba(9,14,28,0.8)', backdropFilter:'blur(24px)', borderRight:'1px solid rgba(66,71,84,0.15)'}}>

      {/* User info */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{background:'#25293a', border:'1px solid rgba(66,71,84,0.3)'}}>
          <span className="material-symbols-outlined" style={{color:'#6bd8cb'}}>school</span>
        </div>
        <div>
          <div style={{fontFamily:'DM Mono', fontSize:'12px', color:'#6bd8cb', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em'}}>
            {profile?.full_name || session?.user?.name || 'Scholar'}
          </div>
          <div style={{fontFamily:'DM Mono', fontSize:'10px', color:'rgba(194,198,214,0.7)', textTransform:'uppercase'}}>
            Score: {profile?.score ?? 500}
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div className="px-4 space-y-1 flex-1">
        <div style={{fontFamily:'DM Mono', fontSize:'10px', fontWeight:700, color:'rgba(194,198,214,0.4)', padding:'8px', textTransform:'uppercase', letterSpacing:'0.2em'}}>
          Overview
        </div>
        <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${pathname === '/dashboard' ? '' : 'hover:bg-[#25293a]'}`}
          style={pathname === '/dashboard' ? {background:'rgba(77,142,255,0.1)', color:'#adc6ff', borderRight:'4px solid #adc6ff', boxShadow:'4px 0 15px -5px rgba(77,142,255,0.4)'} : {color:'rgba(194,198,214,0.7)'}}>
          <span className="material-symbols-outlined" style={{fontSize:'18px'}}>grid_view</span>
          <span style={{fontFamily:'DM Mono', fontSize:'12px'}}>Dashboard</span>
        </Link>
        <Link href="/projects/create" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${pathname === '/projects/create' ? '' : 'hover:bg-[#25293a]'}`}
          style={pathname === '/projects/create' ? {background:'rgba(77,142,255,0.1)', color:'#adc6ff', borderRight:'4px solid #adc6ff', boxShadow:'4px 0 15px -5px rgba(77,142,255,0.4)'} : {color:'rgba(194,198,214,0.7)'}}>
          <span className="material-symbols-outlined" style={{fontSize:'18px'}}>rocket_launch</span>
          <span style={{fontFamily:'DM Mono', fontSize:'12px'}}>Post Project</span>
        </Link>
        <Link href={profileHref} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${pathname.startsWith('/profile/') ? '' : 'hover:bg-[#25293a]'}`}
          style={pathname.startsWith('/profile/') ? {background:'rgba(77,142,255,0.1)', color:'#adc6ff', borderRight:'4px solid #adc6ff', boxShadow:'4px 0 15px -5px rgba(77,142,255,0.4)'} : {color:'rgba(194,198,214,0.7)'}}>
          <span className="material-symbols-outlined" style={{fontSize:'18px'}}>manage_accounts</span>
          <span style={{fontFamily:'DM Mono', fontSize:'12px'}}>My Profile</span>
        </Link>
        <Link href="/chat" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${pathname === '/chat' ? '' : 'hover:bg-[#25293a]'}`}
          style={pathname === '/chat' ? {background:'rgba(77,142,255,0.1)', color:'#adc6ff', borderRight:'4px solid #adc6ff', boxShadow:'4px 0 15px -5px rgba(77,142,255,0.4)'} : {color:'rgba(194,198,214,0.7)'}}>
          <span className="material-symbols-outlined" style={{fontSize:'18px'}}>chat</span>
          <span style={{fontFamily:'DM Mono', fontSize:'12px'}}>Messages</span>
        </Link>
        
        <div style={{fontFamily:'DM Mono', fontSize:'10px', fontWeight:700, color:'rgba(194,198,214,0.4)', padding:'16px 8px 8px', textTransform:'uppercase', letterSpacing:'0.2em'}}>
          Workspace
        </div>
        <Link href="/notifications" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${pathname === '/notifications' ? '' : 'hover:bg-[#25293a]'}`}
          style={pathname === '/notifications' ? {background:'rgba(77,142,255,0.1)', color:'#adc6ff', borderRight:'4px solid #adc6ff', boxShadow:'4px 0 15px -5px rgba(77,142,255,0.4)'} : {color:'rgba(194,198,214,0.7)'}}>
          <span className="material-symbols-outlined" style={{fontSize:'18px'}}>notifications</span>
          <span style={{fontFamily:'DM Mono', fontSize:'12px'}}>Notifications</span>
        </Link>
      </div>

      {/* Score widget */}
      <div className="px-4 mt-auto mb-4">
        <div className="p-4 rounded-xl glass-card relative overflow-hidden"
          style={{border:'1px solid rgba(66,71,84,0.15)'}}>
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-10 h-10">
              <svg className="w-full h-full" style={{transform:'rotate(-90deg)'}}>
                <circle cx="20" cy="20" r="16" fill="transparent" stroke="#25293a" strokeWidth="3" />
                <circle cx="20" cy="20" r="16" fill="transparent" stroke="#6bd8cb" strokeWidth="3"
                  strokeDasharray="100"
                  strokeDashoffset={100 - ((profile?.score ?? 500) / 1000) * 100} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center"
                style={{fontFamily:'DM Mono', fontSize:'10px', fontWeight:700}}>
                {profile?.score ?? 500}
              </div>
            </div>
            <div>
              <div style={{fontFamily:'DM Mono', fontSize:'10px', color:'rgba(194,198,214,0.7)'}}>ACCOUNTABILITY</div>
              <div style={{fontSize:'12px', fontWeight:700, color:'#6bd8cb'}}>
                {(profile?.score ?? 500) >= 700 ? 'Vanguard Elite' :
                  (profile?.score ?? 500) >= 500 ? 'Active Scholar' : 'Probation'}
              </div>
            </div>
          </div>
          <div className="h-1 w-full rounded-full overflow-hidden" style={{background:'#25293a'}}>
            <div className="h-full rounded-full" style={{background:'#6bd8cb', width:`${((profile?.score ?? 500) / 1000) * 100}%`}} />
          </div>
        </div>
      </div>
    </aside>
  )
}
