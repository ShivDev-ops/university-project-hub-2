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

  const mobileLabHref = currentLabHref ?? (userProjects[0] ? `/projects/${userProjects[0].id}/lab` : null)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-[60px] flex items-center px-[18px] z-50 pointer-events-none">
      <div className="w-full max-w-[1180px] min-h-[47px] mx-auto px-4 md:px-5 py-[5px] flex justify-between items-center rounded-[15px] border border-slate-300/10 bg-[#141b2b]/55 shadow-[0_10px_30px_rgba(0,0,0,0.10)] backdrop-blur-xl pointer-events-auto">
      <div className="flex items-center gap-4 md:gap-6">
        <Link href="/dashboard">
          <div className="font-mono tracking-[0.02em] uppercase font-bold text-[#6bd8cb] cursor-pointer flex items-center gap-2 text-sm">
            PROJECT_HUB
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-0.5">
          <Link href="/dashboard" className="px-2.5 py-2 rounded-[9px] text-[11px] font-mono tracking-widest uppercase font-bold text-zinc-200 bg-emerald-400/10">Discover</Link>
{projectId ? (
  <Link href={`/projects/${projectId}/lab`} className="px-2.5 py-2 rounded-[9px] text-[11px] font-mono tracking-widest uppercase text-zinc-400 hover:text-zinc-200 hover:bg-emerald-400/10 transition-colors">Labs</Link>
) : (
  <div className="relative group">
    <button className="px-2.5 py-2 rounded-[9px] text-[11px] font-mono tracking-widest uppercase text-zinc-400 hover:text-zinc-200 hover:bg-emerald-400/10 transition-colors flex items-center gap-1">
      Labs
      <span className="material-symbols-outlined" style={{fontSize:'16px'}}>expand_more</span>
    </button>
    {userProjects.length > 0 && (
      <div className="absolute top-full left-0 mt-2 w-64 rounded-[12px] border border-slate-300/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 bg-[#141b2b]/75 backdrop-blur-xl">
        <div className="p-2 border-b border-slate-300/10">
          <span className="font-mono text-[9px] font-bold text-emerald-500/50 uppercase tracking-[0.15em] px-2 py-1">Select Project Lab</span>
        </div>
        <div className="p-1 max-h-60 overflow-y-auto">
          {userProjects.map((proj: any) => (
            <Link key={proj.id} href={`/projects/${proj.id}/lab`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[9px] hover:bg-emerald-400/10 transition-colors text-zinc-300">
              <span className="material-symbols-outlined text-emerald-500 text-[16px]">terminal</span>
              <span className="font-mono text-[11px] truncate">{proj.title}</span>
            </Link>
          ))}
        </div>
      </div>
    )}
  </div>
)}
          <a href="#" className="px-2.5 py-2 rounded-[9px] text-[11px] font-mono tracking-widest uppercase text-zinc-400 hover:text-zinc-200 hover:bg-emerald-400/10 transition-colors">Teams</a>
          <a href="#" className="px-2.5 py-2 rounded-[9px] text-[11px] font-mono tracking-widest uppercase text-zinc-400 hover:text-zinc-200 hover:bg-emerald-400/10 transition-colors">Archive</a>
          <Link href="/portfolio" className="px-2.5 py-2 rounded-[9px] text-[11px] font-mono tracking-widest uppercase text-zinc-400 hover:text-zinc-200 hover:bg-emerald-400/10 transition-colors flex items-center gap-1">
            Portfolio
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <Link href="/notifications" className="hidden md:block">
          <button className="relative p-2 rounded-sm transition-all hover:bg-[#10b981]/20" aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}>
            <span className="material-symbols-outlined" style={{color:'#d4d4d8'}}>notifications</span>
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
        <button className="hidden md:block p-2 rounded-sm transition-all hover:bg-[#10b981]/20">
          <span className="material-symbols-outlined" style={{color:'#d4d4d8'}}>terminal</span>
        </button>
        <Link href={profileHref}>
          <div className="w-8 h-8 rounded-full border-2 overflow-hidden" style={{borderColor:'#10b981'}}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{background:'#18181b'}}>
                <span className="material-symbols-outlined" style={{fontSize:'16px', color:'#10b981'}}>person</span>
              </div>
            )}
          </div>
        </Link>
        <button
          className="md:hidden p-2 rounded-sm transition-all hover:bg-[#10b981]/20"
          onClick={() => setMobileOpen(open => !open)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined" style={{color:'#d4d4d8'}}>{mobileOpen ? 'close' : 'menu'}</span>
        </button>
      </div>
      </div>
    </header>

    {mobileOpen && (
      <div className="md:hidden fixed top-[60px] left-0 right-0 z-40 px-4 py-3"
        style={{ background:'rgba(14,19,34,0.96)', borderBottom:'1px solid rgba(39,39,42,0.2)' }}>
        <div className="rounded-md p-3"
          style={{ background:'rgba(24,24,27,0.8)', border:'1px solid rgba(39,39,42,0.2)' }}>
          {[
            { href: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
            ...(mobileLabHref ? [{ href: mobileLabHref, label: 'Labs', icon: 'terminal' }] : []),
            { href: '/projects/create', label: 'Post Project', icon: 'rocket_launch' },
            { href: profileHref, label: 'My Profile', icon: 'manage_accounts' },
            { href: '/chat', label: 'Chat', icon: 'chat' },
            { href: '/notifications', label: 'Notifications', icon: 'notifications' },
          ].map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-sm"
              style={pathname === item.href ? { background:'rgba(16,185,129,0.12)', color:'#10b981' } : { color:'rgba(194,198,214,0.85)' }}>
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
                      className="flex items-center gap-3 px-3 py-2 rounded-sm transition-all"
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
