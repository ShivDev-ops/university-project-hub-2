// File: app/dashboard/page.tsx

export const revalidate = 0

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'

type ProjectWithOwner = {
  id: string
  title: string
  description: string
  required_skills: string[]
  slots: number
  filled_slots: number
  status: string
  created_at: string
  owner_id: string
  owner: {
    full_name: string
    avatar_url: string | null
    score: number
  } | null
}


export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

 // Replace your current query in app/dashboard/page.tsx
const { data: projects } = await supabaseAdmin
  .from('projects')
  .select(`
    id, title, description, required_skills,
    slots, filled_slots, status, created_at, owner_id,
    owner:profiles!projects_owner_id_fkey (
      full_name, avatar_url, score
    )
  `)
  .eq('status', 'open')
  .order('created_at', { ascending: false }) as { data: ProjectWithOwner[] | null }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name, score, skills, avatar_url')
    .eq('user_id', session.user.id)
    .single()

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&family=DM+Mono&family=Inter:wght@400;500;600&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style>{`
        body { font-family: 'Manrope', sans-serif; background-color: #0e1322; color: #dee1f7; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-card { backdrop-filter: blur(16px); background: rgba(26, 31, 47, 0.6); }
        .neon-glow-primary { box-shadow: 0 0 20px rgba(77, 142, 255, 0.15); }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(77, 142, 255, 0.05), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite linear;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(77, 142, 255, 0.05) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .card-hover {
          transition: all 0.3s;
        }
        .card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 40px -10px rgba(77, 142, 255, 0.2);
        }
      `}</style>

      <div className="bg-[#0e1322] min-h-screen selection:bg-[#4d8eff]/30">

        {/* Top Nav */}
        <header className="fixed top-0 w-full h-[60px] backdrop-blur-xl border-b flex justify-between items-center px-6 z-50"
          style={{background:'rgba(14,19,34,0.6)', borderColor:'rgba(66,71,84,0.15)', boxShadow:'0 0 20px rgba(77,142,255,0.1)'}}>
          <div className="flex items-center gap-8">
            <div style={{fontFamily:'Syne', fontSize:'20px', fontWeight:900, letterSpacing:'-0.05em', color:'#adc6ff'}}>
              PROJECT_HUB
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" style={{fontSize:'14px', fontWeight:500, color:'#adc6ff', borderBottom:'2px solid #adc6ff', paddingBottom:'4px'}}>Discover</a>
              <a href="#" style={{fontSize:'14px', fontWeight:500, color:'#c2c6d6'}} className="hover:text-[#adc6ff] transition-colors">Labs</a>
              <a href="#" style={{fontSize:'14px', fontWeight:500, color:'#c2c6d6'}} className="hover:text-[#adc6ff] transition-colors">Teams</a>
              <a href="#" style={{fontSize:'14px', fontWeight:500, color:'#c2c6d6'}} className="hover:text-[#adc6ff] transition-colors">Archive</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/notifications">
              <button className="p-2 rounded-lg transition-all hover:bg-[#4d8eff]/20">
                <span className="material-symbols-outlined" style={{color:'#c2c6d6'}}>notifications</span>
              </button>
            </Link>
            <button className="p-2 rounded-lg transition-all hover:bg-[#4d8eff]/20">
              <span className="material-symbols-outlined" style={{color:'#c2c6d6'}}>terminal</span>
            </button>
            <Link href="/profile/edit">
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
          </div>
        </header>

        <div className="flex pt-[60px] min-h-screen dot-grid">

          {/* Sidebar */}
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
                  {profile?.full_name || session.user.name || 'Scholar'}
                </div>
                <div style={{fontFamily:'DM Mono', fontSize:'10px', color:'rgba(194,198,214,0.7)', textTransform:'uppercase'}}>
                  Score: {profile?.score || 500}
                </div>
              </div>
            </div>

            {/* Nav links */}
            <div className="px-4 space-y-1 flex-1">
              <div style={{fontFamily:'DM Mono', fontSize:'10px', fontWeight:700, color:'rgba(194,198,214,0.4)', padding:'8px', textTransform:'uppercase', letterSpacing:'0.2em'}}>
                Overview
              </div>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                style={{background:'rgba(77,142,255,0.1)', color:'#adc6ff', borderRight:'4px solid #adc6ff', boxShadow:'4px 0 15px -5px rgba(77,142,255,0.4)'}}>
                <span className="material-symbols-outlined" style={{fontSize:'18px'}}>grid_view</span>
                <span style={{fontFamily:'DM Mono', fontSize:'12px'}}>Dashboard</span>
              </a>
              <Link href="/projects/create" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#25293a] transition-all"
                style={{color:'rgba(194,198,214,0.7)'}}>
                <span className="material-symbols-outlined" style={{fontSize:'18px'}}>rocket_launch</span>
                <span style={{fontFamily:'DM Mono', fontSize:'12px'}}>Post Project</span>
              </Link>
              <Link href="/profile/edit" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#25293a] transition-all"
                style={{color:'rgba(194,198,214,0.7)'}}>
                <span className="material-symbols-outlined" style={{fontSize:'18px'}}>manage_accounts</span>
                <span style={{fontFamily:'DM Mono', fontSize:'12px'}}>My Profile</span>
              </Link>
              <Link href="/chat" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#25293a] transition-all"
                style={{color:'rgba(194,198,214,0.7)'}}>
                <span className="material-symbols-outlined" style={{fontSize:'18px'}}>chat</span>
                <span style={{fontFamily:'DM Mono', fontSize:'12px'}}>Messages</span>
              </Link>
              <div style={{fontFamily:'DM Mono', fontSize:'10px', fontWeight:700, color:'rgba(194,198,214,0.4)', padding:'16px 8px 8px', textTransform:'uppercase', letterSpacing:'0.2em'}}>
                Workspace
              </div>
              <Link href="/notifications" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#25293a] transition-all"
                style={{color:'rgba(194,198,214,0.7)'}}>
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
                        strokeDashoffset={100 - ((profile?.score || 500) / 1000) * 100} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{fontFamily:'DM Mono', fontSize:'10px', fontWeight:700}}>
                      {profile?.score || 500}
                    </div>
                  </div>
                  <div>
                    <div style={{fontFamily:'DM Mono', fontSize:'10px', color:'rgba(194,198,214,0.7)'}}>ACCOUNTABILITY</div>
                    <div style={{fontSize:'12px', fontWeight:700, color:'#6bd8cb'}}>
                      {(profile?.score || 500) >= 700 ? 'Vanguard Elite' :
                       (profile?.score || 500) >= 500 ? 'Active Scholar' : 'Probation'}
                    </div>
                  </div>
                </div>
                <div className="h-1 w-full rounded-full overflow-hidden" style={{background:'#25293a'}}>
                  <div className="h-full rounded-full" style={{background:'#6bd8cb', width:`${((profile?.score || 500) / 1000) * 100}%`}} />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="ml-64 w-full p-8">

            {/* Search Bar */}
            <div className="mb-8 max-w-5xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl blur opacity-25 transition duration-500 group-focus-within:opacity-75"
                  style={{background:'linear-gradient(to right, rgba(173,198,255,0.2), rgba(208,188,255,0.2))'}} />
                <div className="relative flex items-center rounded-xl px-6 py-4"
                  style={{background:'rgba(22,27,43,0.8)', backdropFilter:'blur(16px)', border:'1px solid rgba(66,71,84,0.2)'}}>
                  <span className="material-symbols-outlined mr-4" style={{color:'#8c909f'}}>search</span>
                  <input
                    className="bg-transparent border-none focus:ring-0 w-full font-medium"
                    placeholder="Search projects by skill or description... (AI search coming in Phase 4)"
                    style={{color:'#dee1f7', outline:'none'}}
                    disabled
                  />
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full"
                    style={{background:'rgba(208,188,255,0.1)', border:'1px solid rgba(208,188,255,0.2)'}}>
                    <span className="material-symbols-outlined text-sm" style={{color:'#d0bcff', fontSize:'16px'}}>bolt</span>
                    <span style={{fontFamily:'DM Mono', fontSize:'10px', fontWeight:700, color:'#d0bcff', textTransform:'uppercase'}}>
                      Powered by AI
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter + Post Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8 max-w-5xl mx-auto">
              <div className="flex flex-wrap items-center gap-3">
                <button className="px-4 py-2 rounded-full glass-card flex items-center gap-2 hover:border-[#adc6ff]/50 transition-all"
                  style={{border:'1px solid rgba(66,71,84,0.2)', fontSize:'12px', fontFamily:'DM Mono'}}>
                  All Departments <span className="material-symbols-outlined" style={{fontSize:'16px'}}>expand_more</span>
                </button>
                <button className="px-4 py-2 rounded-full glass-card flex items-center gap-2 hover:border-[#adc6ff]/50 transition-all"
                  style={{border:'1px solid rgba(66,71,84,0.2)', fontSize:'12px', fontFamily:'DM Mono'}}>
                  All Years <span className="material-symbols-outlined" style={{fontSize:'16px'}}>expand_more</span>
                </button>
                <div className="h-4 w-px mx-2" style={{background:'rgba(66,71,84,0.3)'}} />
                <span style={{fontFamily:'DM Mono', fontSize:'10px', color:'rgba(194,198,214,0.6)', textTransform:'uppercase', letterSpacing:'0.1em'}}>
                  {projects?.length || 0} open projects
                </span>
              </div>
              <Link href="/projects/create">
                <button className="px-5 py-2 rounded-lg font-medium text-sm transition-all hover:scale-105 neon-glow-primary"
                  style={{background:'#adc6ff', color:'#002e6a', fontFamily:'DM Mono'}}>
                  + Post Project
                </button>
              </Link>
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {projects && projects.length > 0 ? (
                projects.map((project) => {
                  const spotsLeft = project.slots - project.filled_slots
                  return (
                    <div key={project.id} className="card-hover relative rounded-2xl overflow-hidden"
                      style={{background:'rgba(26,31,47,0.4)', backdropFilter:'blur(16px)', border:'1px solid rgba(66,71,84,0.15)'}}>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-wrap gap-2">
                            <span style={{padding:'2px 8px', borderRadius:'4px', background:'rgba(173,198,255,0.1)', color:'#adc6ff', fontSize:'10px', fontWeight:700, fontFamily:'DM Mono', textTransform:'uppercase'}}>
                              {spotsLeft > 0 ? 'Open' : 'Full'}
                            </span>
                            <span style={{fontSize:'10px', color:'rgba(194,198,214,0.6)', fontFamily:'DM Mono'}}>
                              {new Date(project.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1" style={{fontSize:'10px', color:'rgba(194,198,214,0.6)', fontFamily:'DM Mono'}}>
                            <span className="material-symbols-outlined" style={{fontSize:'14px'}}>group</span>
                            {spotsLeft} left
                          </div>
                        </div>

                        <h3 style={{fontFamily:'Syne', fontSize:'20px', fontWeight:700, marginBottom:'8px', lineHeight:1.2}}>
                          {project.title}
                        </h3>
                        <p style={{color:'#c2c6d6', fontSize:'14px', marginBottom:'16px', lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {project.required_skills?.slice(0, 3).map((skill: string) => (
                            <span key={skill} style={{padding:'4px 8px', borderRadius:'6px', background:'#25293a', fontSize:'10px', fontFamily:'DM Mono', color:'#c2c6d6'}}>
                              {skill}
                            </span>
                          ))}
                          {project.required_skills?.length > 3 && (
                            <span style={{padding:'4px 8px', borderRadius:'6px', background:'#25293a', fontSize:'10px', fontFamily:'DM Mono', color:'#c2c6d6'}}>
                              +{project.required_skills.length - 3} more
                            </span>
                          )}
                        </div>

                        
<div className="pt-4 flex items-center justify-between" 
  style={{borderTop:'1px solid rgba(66,71,84,0.1)'}}>
  
  {/* Owner info — LEFT side */}
  <div className="flex items-center gap-2">
    <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center"
      style={{background:'#25293a', border:'1px solid rgba(66,71,84,0.3)'}}>
      {(project.owner as any)?.avatar_url ? (
        <img src={(project.owner as any).avatar_url} className="w-full h-full object-cover" />
      ) : (
        <span className="material-symbols-outlined" style={{fontSize:'14px', color:'#adc6ff'}}>person</span>
      )}
    </div>
    <span style={{fontFamily:'DM Mono', fontSize:'10px', color:'rgba(194,198,214,0.7)'}}>
      {(project.owner as any)?.full_name || 'Unknown'}
    </span>
    {/* ScoreBadge */}
    {(() => {
      const score = (project.owner as any)?.score || 0
      const color = score >= 600 ? '#34d399' : score >= 400 ? '#fbbf24' : '#fb7185'
      return (
        <span style={{
          fontFamily:'DM Mono', fontSize:'9px', fontWeight:700,
          padding:'1px 6px', borderRadius:'999px',
          background:`${color}20`, color
        }}>
          {score}
        </span>
      )
    })()}
  </div>

  {/* View button — RIGHT side */}
  <Link href={`/projects/${project.id}`}>
    <button className="flex items-center gap-1 text-xs font-bold hover:gap-2 transition-all"
      style={{color:'#adc6ff', fontFamily:'DM Mono'}}>
      View <span className="material-symbols-outlined" style={{fontSize:'16px'}}>arrow_forward</span>
    </button>
  </Link>
</div>

                      </div>
                    </div>
                  )
                })
              ) : (
                // Empty state
                <div className="col-span-3 text-center py-20">
                  <span className="material-symbols-outlined" style={{fontSize:'48px', color:'#424754'}}>
                    rocket_launch
                  </span>
                  <p style={{fontFamily:'Syne', fontSize:'20px', fontWeight:700, color:'#c2c6d6', marginTop:'16px'}}>
                    No projects yet
                  </p>
                  <p style={{fontFamily:'DM Mono', fontSize:'12px', color:'#8c909f', marginTop:'8px'}}>
                    Be the first to post a project
                  </p>
                  <Link href="/projects/create">
                    <button className="mt-6 px-6 py-3 rounded-lg font-medium neon-glow-primary"
                      style={{background:'#adc6ff', color:'#002e6a', fontFamily:'DM Mono'}}>
                      + Post Project
                    </button>
                  </Link>
                </div>
              )}

              {/* Skeleton loading cards — shown when no projects */}
              {/* {(!projects || projects.length === 0) && [1,2,3].map(i => (
                <div key={i} className="relative rounded-2xl overflow-hidden h-[340px]"
                  style={{background:'rgba(22,27,43,0.4)', border:'1px solid rgba(66,71,84,0.1)'}}>
                  <div className="shimmer absolute inset-0" />
                  <div className="p-6 space-y-4">
                    <div className="flex gap-2">
                      <div className="w-12 h-4 rounded" style={{background:'#1a1f2f'}} />
                      <div className="w-16 h-4 rounded" style={{background:'#1a1f2f'}} />
                    </div>
                    <div className="w-3/4 h-8 rounded" style={{background:'#1a1f2f'}} />
                    <div className="space-y-2">
                      <div className="w-full h-4 rounded" style={{background:'#1a1f2f'}} />
                      <div className="w-5/6 h-4 rounded" style={{background:'#1a1f2f'}} />
                    </div>
                  </div>
                </div>
              ))} */}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}