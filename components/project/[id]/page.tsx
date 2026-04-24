import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import { ApplyButton } from '@/components/project/ApplyButton'
import { AppStatusBanner } from '@/components/project/AppStatusBanner'

type Project = {
  id: string
  title: string
  description: string
  required_skills: string[]
  slots: number
  filled_slots: number
  status: string
  visibility: string
  github_repo: string | null
  created_at: string
  owner_id: string
  owner: {
    id: string
    full_name: string
    avatar_url: string | null
    score: number
    department: string | null
  } | null
}

type Application = {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
  applicant_id: string
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  // Fetch project with owner
  const { data: project } = await supabaseAdmin
    .from('projects')
    .select(`
      id, title, description, required_skills,
      slots, filled_slots, status, visibility,
      github_repo, created_at, owner_id,
      owner:profiles!projects_owner_id_fkey (
        id, full_name, avatar_url, score, department
      )
    `)
    .eq('id', params.id)
    .single() as { data: Project | null }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0e1322] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg">Project not found</p>
          <Link href="/dashboard" className="text-[#adc6ff] text-sm mt-4 inline-block">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Get current user's profile
  let userProfile = null
  let application: Application | null = null
  let isTeamMember = false
  let activeProjectCount = 0

  if (session?.user?.id) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, score')
      .eq('user_id', session.user.id)
      .single()

    userProfile = profile

    if (profile) {
      // Check if user already applied
      const { data: app } = await supabaseAdmin
        .from('applications')
        .select('id, status, applicant_id')
        .eq('project_id', project.id)
        .eq('applicant_id', profile.id)
        .single()

      application = app

      // Check if user is accepted team member
      isTeamMember = app?.status === 'accepted'

      // Count active projects user is in
      const { count } = await supabaseAdmin
        .from('applications')
        .select('id', { count: 'exact' })
        .eq('applicant_id', profile.id)
        .eq('status', 'accepted')

      activeProjectCount = count || 0
    }
  }

  const isOwner = userProfile?.id === project.owner_id
  const spotsLeft = project.slots - project.filled_slots
  const score = project.owner?.score || 0
  const scoreColor = score >= 600 ? '#34d399' : score >= 400 ? '#fbbf24' : '#fb7185'

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&family=DM+Mono&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style>{`
        body { font-family: 'Manrope', sans-serif; background-color: #0e1322; color: #dee1f7; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-card { backdrop-filter: blur(16px); background: rgba(26, 31, 47, 0.6); }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(77,142,255,0.05) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      <div className="bg-[#0e1322] min-h-screen dot-grid">

        {/* Navbar */}
        <header className="fixed top-0 w-full h-[60px] backdrop-blur-xl border-b flex justify-between items-center px-6 z-50"
          style={{background:'rgba(14,19,34,0.6)', borderColor:'rgba(66,71,84,0.15)'}}>
          <Link href="/dashboard"
            className="flex items-center gap-2 hover:text-[#adc6ff] transition-colors"
            style={{color:'#c2c6d6', fontFamily:'DM Mono', fontSize:'13px'}}>
            <span className="material-symbols-outlined" style={{fontSize:'18px'}}>arrow_back</span>
            Back to Feed
          </Link>
          <div style={{fontFamily:'Syne', fontSize:'20px', fontWeight:900, letterSpacing:'-0.05em', color:'#adc6ff'}}>
            PROJECT_HUB
          </div>
          <div className="w-24" /> {/* spacer */}
        </header>

        <main className="pt-[80px] pb-16 px-4 max-w-5xl mx-auto">

          {/* ── HOOK LAYER — visible to everyone ── */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span style={{
                padding:'3px 10px', borderRadius:'4px', fontSize:'10px',
                fontFamily:'DM Mono', fontWeight:700, textTransform:'uppercase',
                background: project.status === 'open' ? 'rgba(173,198,255,0.1)' : 'rgba(66,71,84,0.2)',
                color: project.status === 'open' ? '#adc6ff' : '#8c909f'
              }}>
                {project.status}
              </span>
              <span style={{fontFamily:'DM Mono', fontSize:'11px', color:'rgba(194,198,214,0.5)'}}>
                Posted {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>

            <h1 style={{fontFamily:'Syne', fontSize:'36px', fontWeight:800, lineHeight:1.1, marginBottom:'16px'}}>
              {project.title}
            </h1>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.required_skills?.map(skill => (
                <span key={skill} style={{
                  padding:'4px 12px', borderRadius:'6px',
                  background:'#25293a', fontSize:'12px',
                  fontFamily:'DM Mono', color:'#c2c6d6'
                }}>
                  {skill}
                </span>
              ))}
            </div>

            {/* Vacancy counter */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2" style={{fontFamily:'DM Mono', fontSize:'12px'}}>
                <span className="material-symbols-outlined" style={{fontSize:'16px', color:'#6bd8cb'}}>group</span>
                <span style={{color:'#6bd8cb', fontWeight:700}}>{spotsLeft}</span>
                <span style={{color:'rgba(194,198,214,0.6)'}}>of {project.slots} slots open</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left column — main content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Application status banner — if already applied */}
              {application && (
                <AppStatusBanner status={application.status} />
              )}

              {/* ── VEIL LAYER — logged in users ── */}
              {session ? (
                <div className="rounded-2xl p-6 glass-card"
                  style={{border:'1px solid rgba(66,71,84,0.15)'}}>
                  <h2 style={{fontFamily:'Syne', fontSize:'18px', fontWeight:700, marginBottom:'16px'}}>
                    About This Project
                  </h2>
                  <p style={{color:'#c2c6d6', fontSize:'15px', lineHeight:1.8, whiteSpace:'pre-wrap'}}>
                    {project.description}
                  </p>
                </div>
              ) : (
                // Blurred veil for non-logged-in users
                <div className="rounded-2xl p-6 relative overflow-hidden"
                  style={{border:'1px solid rgba(66,71,84,0.15)', background:'rgba(26,31,47,0.4)'}}>
                  <div className="blur-sm select-none pointer-events-none">
                    <p style={{color:'#c2c6d6', fontSize:'15px', lineHeight:1.8}}>
                      {project.description}
                    </p>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{background:'rgba(14,19,34,0.7)', backdropFilter:'blur(4px)'}}>
                    <span className="material-symbols-outlined" style={{fontSize:'32px', color:'#adc6ff', marginBottom:'12px'}}>lock</span>
                    <p style={{fontFamily:'DM Mono', fontSize:'13px', color:'#adc6ff', marginBottom:'16px'}}>
                      Sign in to view full details
                    </p>
                    <Link href="/login">
                      <button className="px-6 py-2 rounded-lg text-sm font-bold"
                        style={{background:'#adc6ff', color:'#002e6a', fontFamily:'DM Mono'}}>
                        Sign In
                      </button>
                    </Link>
                  </div>
                </div>
              )}

              {/* ── VAULT LAYER — team members only ── */}
              {session && (
                <div className="rounded-2xl p-6"
                  style={{border:'1px solid rgba(66,71,84,0.15)', background:'rgba(26,31,47,0.4)'}}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined"
                      style={{fontSize:'20px', color: isTeamMember || isOwner ? '#6bd8cb' : '#424754'}}>
                      {isTeamMember || isOwner ? 'lock_open' : 'lock'}
                    </span>
                    <h2 style={{fontFamily:'Syne', fontSize:'18px', fontWeight:700}}>
                      Team Vault
                    </h2>
                    {(isTeamMember || isOwner) && (
                      <span style={{
                        padding:'2px 8px', borderRadius:'4px', fontSize:'10px',
                        fontFamily:'DM Mono', background:'rgba(107,216,203,0.1)', color:'#6bd8cb'
                      }}>
                        UNLOCKED
                      </span>
                    )}
                  </div>

                  {isTeamMember || isOwner ? (
                    <div className="space-y-4">
                      {project.github_repo && (
                        <a href={project.github_repo} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#25293a] transition-all"
                          style={{border:'1px solid rgba(66,71,84,0.2)'}}>
                          <span className="material-symbols-outlined" style={{color:'#adc6ff'}}>code</span>
                          <div>
                            <div style={{fontFamily:'DM Mono', fontSize:'12px', color:'#adc6ff'}}>GitHub Repository</div>
                            <div style={{fontSize:'11px', color:'rgba(194,198,214,0.5)'}}>{project.github_repo}</div>
                          </div>
                          <span className="material-symbols-outlined ml-auto" style={{fontSize:'16px', color:'#8c909f'}}>open_in_new</span>
                        </a>
                      )}
                      <Link href={`/chat`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#25293a] transition-all"
                        style={{border:'1px solid rgba(66,71,84,0.2)'}}>
                        <span className="material-symbols-outlined" style={{color:'#6bd8cb'}}>chat</span>
                        <div style={{fontFamily:'DM Mono', fontSize:'12px', color:'#6bd8cb'}}>Team Chat</div>
                        <span className="material-symbols-outlined ml-auto" style={{fontSize:'16px', color:'#8c909f'}}>arrow_forward</span>
                      </Link>
                    </div>
                  ) : (
                    <p style={{fontFamily:'DM Mono', fontSize:'12px', color:'rgba(194,198,214,0.5)'}}>
                      GitHub repo, private files and team chat unlock after your application is accepted.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right column — sidebar */}
            <div className="space-y-4">

              {/* Apply button — only show if logged in, not owner, not applied */}
              {session && !isOwner && !application && (
                <ApplyButton
                  projectId={project.id}
                  disabled={activeProjectCount >= 2 || project.status !== 'open' || spotsLeft === 0}
                  disabledReason={
                    activeProjectCount >= 2 ? 'You are in 2 active projects' :
                    spotsLeft === 0 ? 'No slots available' :
                    project.status !== 'open' ? 'Project is closed' : undefined
                  }
                />
              )}

              {/* Creator card */}
              <div className="rounded-2xl p-5 glass-card"
                style={{border:'1px solid rgba(66,71,84,0.15)'}}>
                <h3 style={{fontFamily:'DM Mono', fontSize:'10px', fontWeight:700,
                  color:'rgba(194,198,214,0.4)', textTransform:'uppercase',
                  letterSpacing:'0.2em', marginBottom:'12px'}}>
                  Posted By
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center"
                    style={{background:'#25293a', border:'1px solid rgba(66,71,84,0.3)'}}>
                    {project.owner?.avatar_url ? (
                      <img src={project.owner.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined" style={{fontSize:'20px', color:'#adc6ff'}}>person</span>
                    )}
                  </div>
                  <div>
                    <div style={{fontWeight:600, fontSize:'14px'}}>{project.owner?.full_name}</div>
                    <div style={{fontFamily:'DM Mono', fontSize:'10px', color:'rgba(194,198,214,0.5)'}}>
                      {project.owner?.department || 'University'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl"
                  style={{background:'rgba(14,19,34,0.5)'}}>
                  <span style={{fontFamily:'DM Mono', fontSize:'11px', color:'rgba(194,198,214,0.5)'}}>
                    Accountability Score
                  </span>
                  <span style={{
                    fontFamily:'DM Mono', fontSize:'12px', fontWeight:700,
                    padding:'2px 10px', borderRadius:'999px',
                    background:`${scoreColor}20`, color: scoreColor
                  }}>
                    {score}
                  </span>
                </div>
                {session && (
                  <Link href={`/profile/${project.owner_id}`}>
                    <button className="w-full mt-3 py-2 rounded-lg text-xs transition-all hover:bg-[#25293a]"
                      style={{border:'1px solid rgba(66,71,84,0.2)', fontFamily:'DM Mono', color:'#c2c6d6'}}>
                      View Full Profile
                    </button>
                  </Link>
                )}
              </div>

              {/* Project stats */}
              <div className="rounded-2xl p-5 glass-card"
                style={{border:'1px solid rgba(66,71,84,0.15)'}}>
                <h3 style={{fontFamily:'DM Mono', fontSize:'10px', fontWeight:700,
                  color:'rgba(194,198,214,0.4)', textTransform:'uppercase',
                  letterSpacing:'0.2em', marginBottom:'12px'}}>
                  Project Info
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span style={{fontFamily:'DM Mono', fontSize:'11px', color:'rgba(194,198,214,0.5)'}}>Slots</span>
                    <span style={{fontFamily:'DM Mono', fontSize:'11px', color:'#dee1f7'}}>{spotsLeft} / {project.slots} open</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{fontFamily:'DM Mono', fontSize:'11px', color:'rgba(194,198,214,0.5)'}}>Status</span>
                    <span style={{fontFamily:'DM Mono', fontSize:'11px', color:'#adc6ff', textTransform:'capitalize'}}>{project.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{fontFamily:'DM Mono', fontSize:'11px', color:'rgba(194,198,214,0.5)'}}>Posted</span>
                    <span style={{fontFamily:'DM Mono', fontSize:'11px', color:'#dee1f7'}}>
                      {new Date(project.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  )
}