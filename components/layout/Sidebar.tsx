'use client'

import { useEffect, useState } from 'react'
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
  { href: '/notifications', icon: 'notifications', label: 'Notifications' },
]

export function Sidebar({ userName = 'Scholar', score = 500 }: SidebarProps) {
  const pathname = usePathname()
  const [userProjects, setUserProjects] = useState<any[]>([])
  
  // Robust project ID detection: /projects/[id]/...
  const pathParts = pathname.split('/')
  const projectsIndex = pathParts.indexOf('projects')
  const projectId = projectsIndex !== -1 && pathParts[projectsIndex + 1] ? pathParts[projectsIndex + 1] : null
  
  // Ensure we don't treat 'create' as a project ID
  const isActualProject = projectId && projectId !== 'create'
  const currentLabHref = isActualProject ? `/projects/${projectId}/lab` : null

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch('/api/projects?my=true', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setUserProjects(data || [])
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadProjects()
  }, [])

  const profileHref = '/profile/edit'

  return (
    <aside
      className="fixed left-0 top-[60px] h-[calc(100vh-60px)] w-64 flex flex-col py-4 z-40"
      style={{
        background: 'rgba(9,14,28,0.8)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(39,39,42,0.15)',
      }}
    >
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-md flex items-center justify-center"
          style={{ background: '#18181b', border: '1px solid rgba(39,39,42,0.3)' }}>
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
            <Link key={item.href} href={item.label === 'My Profile' ? profileHref : item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all"
              style={{
                background: active || (item.label === 'My Profile' && pathname.startsWith('/profile/')) ? 'rgba(16,185,129,0.1)' : 'transparent',
                color: active ? '#10b981' : 'rgba(194,198,214,0.7)',
              }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {item.icon}
              </span>
              <span style={{ fontFamily: 'DM Mono', fontSize: '12px' }}>{item.label}</span>
            </Link>
          )
        })}

        {/* Dynamic Mission Control section */}
        {userProjects.length > 0 && (
          <div className="mt-8 pt-4 border-t border-emerald-500/10">
            <div style={{ fontFamily: 'DM Mono', fontSize: '10px', fontWeight: 700, color: 'rgba(16, 185, 129, 0.4)', padding: '8px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              Mission Control
            </div>
            <div className="space-y-1">
              {userProjects.map(proj => {
                const href = `/projects/${proj.id}/lab`
                const active = pathname === href
                return (
                  <Link key={proj.id} href={href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-all ${active ? '' : 'hover:bg-emerald-500/5'}`}
                    style={active 
                      ? { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRight: '4px solid #10b981' } 
                      : { color: 'rgba(16, 185, 129, 0.6)' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>terminal</span>
                    <span style={{ fontFamily: 'DM Mono', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {proj.title}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
