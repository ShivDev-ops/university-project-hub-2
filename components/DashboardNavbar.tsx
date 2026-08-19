'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardNavbar({ profile }: { profile: any }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [userProjects, setUserProjects] = useState<any[]>([])
  const pathname = usePathname()
  const profileHref = profile?.user_id ? `/profile/${profile.user_id}` : '/profile/edit'

  // Robust project ID detection: /projects/[id]/...
  const pathParts = pathname.split('/')
  const projectsIndex = pathParts.indexOf('projects')
  const projectId = projectsIndex !== -1 && pathParts[projectsIndex + 1] ? pathParts[projectsIndex + 1] : null
  const isActualProject = projectId && projectId !== 'create'
  const currentLabHref = isActualProject ? `/projects/${projectId}/lab` : null

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        // Notifications
        const notifRes = await fetch('/api/notifications/unread-count', { cache: 'no-store' })
        if (notifRes.ok) {
          const data = await notifRes.json()
          if (active) setUnreadCount(typeof data?.unreadCount === 'number' ? data.unreadCount : 0)
        }

        // Projects
        const projRes = await fetch('/api/projects?my=true', { cache: 'no-store' })
        if (projRes.ok) {
          const data = await projRes.json()
          if (active) setUserProjects(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.error('Failed to load navbar data:', err)
      }
    }

    void loadData()
    return () => { active = false }
  }, [profile?.user_id])

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
{projectId ? (
  <Link href={`/projects/${projectId}/lab`} style={{fontSize:'14px', fontWeight:500, color:'#c2c6d6'}} className="hover:text-[#adc6ff] transition-colors">Labs</Link>
) : (
  <div className="relative group">
    <button style={{fontSize:'14px', fontWeight:500, color:'#c2c6d6'}} className="hover:text-[#adc6ff] transition-colors flex items-center gap-1">
      Labs
      <span className="material-symbols-outlined" style={{fontSize:'16px'}}>expand_more</span>
    </button>
    {userProjects.length > 0 && (
      <div className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-zinc-700/50 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
        style={{background:'rgba(14,19,34,0.96)'}}>
        <div className="p-2 border-b border-zinc-700/30">
          <span style={{fontFamily:'DM Mono', fontSize:'9px', fontWeight:700, color:'rgba(16,185,129,0.5)', textTransform:'uppercase', letterSpacing:'0.15em', padding:'4px 8px'}}>Select Project Lab</span>
        </div>
        <div className="p-1 max-h-60 overflow-y-auto">
          {userProjects.map((proj: any) => (
            <Link key={proj.id} href={`/projects/${proj.id}/lab`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
              style={{color:'rgba(194,198,214,0.85)'}}>
              <span className="material-symbols-outlined" style={{fontSize:'16px', color:'#10b981'}}>terminal</span>
              <span style={{fontFamily:'DM Mono', fontSize:'12px'}} className="truncate">{proj.title}</span>
            </Link>
          ))}
        </div>
      </div>
    )}
  </div>
)}
          <a href="#" style={{fontSize:'14px', fontWeight:500, color:'#c2c6d6'}} className="hover:text-[#adc6ff] transition-colors">Teams</a>
          <a href="#" style={{fontSize:'14px', fontWeight:500, color:'#c2c6d6'}} className="hover:text-[#adc6ff] transition-colors">Archive</a>
          <Link href="/portfolio" style={{fontSize:'14px', fontWeight:500, color:'#c2c6d6'}} className="hover:text-[#adc6ff] transition-colors flex items-center gap-1">
            Portfolio
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <Link href="/notifications" className="hidden md:block">
          <button className="relative p-2 rounded-lg transition-all hover:bg-[#4d8eff]/20" aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}>
            <span className="material-symbols-outlined" style={{color:'#c2c6d6'}}>notifications</span>
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  minWidth: 16,
                  height: 16,
                  borderRadius: '999px',
                  background: '#fb7185',
                  color: '#fff',
                  fontSize: '9px',
                  fontFamily: 'DM Mono',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  lineHeight: 1,
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
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
            { href: '/chat', label: 'Chat', icon: 'chat' },
            { href: '/notifications', label: 'Notifications', icon: 'notifications' },
          ].map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
              style={pathname === item.href ? { background:'rgba(77,142,255,0.12)', color:'#adc6ff' } : { color:'rgba(194,198,214,0.85)' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'18px' }}>{item.icon}</span>
              <span style={{ fontFamily:'DM Mono', fontSize:'12px' }}>{item.label}</span>
            </Link>
          ))}

          {userProjects.length > 0 && (
            <div className="mt-4 pt-3 border-t border-emerald-500/10">
              <div style={{fontFamily:'DM Mono', fontSize:'10px', fontWeight:700, color:'rgba(16, 185, 129, 0.4)', padding:'0 12px 8px', textTransform:'uppercase', letterSpacing:'0.2em'}}>
                Mission Control
              </div>
              <div className="space-y-1">
                {userProjects.map(proj => {
                  const href = `/projects/${proj.id}/lab`
                  const active = pathname === href
                  return (
                    <Link key={proj.id} href={href} onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
                      style={active 
                        ? { background:'rgba(16, 185, 129, 0.12)', color:'#10b981' } 
                        : { color:'rgba(16, 185, 129, 0.8)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>terminal</span>
                      <span style={{ fontFamily:'DM Mono', fontSize:'11px' }}>{proj.title}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  )
}
