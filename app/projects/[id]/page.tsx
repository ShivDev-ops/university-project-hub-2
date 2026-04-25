// app/projects/[id]/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ApplySection } from './ApplySection'
import DashboardNavbar from '@/components/DashboardNavbar'
import DashboardSidebar from '@/components/DashboardSidebar'

// ─── Types ────────────────────────────────────────────────────────────────────

type Owner = {
  user_id: string
  full_name: string
  avatar_url: string | null
  score: number
  department: string | null
  year: number | null
}

type Project = {
  id: string
  title: string
  description: string
  full_description: string | null
  required_skills: string[]
  tech_stack: string[]
  slots: number
  filled_slots: number
  status: string
  visibility: string
  github_repo: string | null
  file_urls: string[]
  timeline: string | null
  owner_id: string
  created_at: string
  owner: Owner | null
}

type Application = {
  id: string
  status: string
  message: string | null
  created_at: string
} | null

type UserProfile = {
  id: string
  user_id: string
  full_name: string
  avatar_url: string | null
  score: number
} | null

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function getProject(id: string): Promise<Project | null> {
  // Fetch project first
  const { data: project, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !project) return null

  // Manual join — owner_id = profiles.user_id (confirmed from DB)
  const { data: owner } = await supabaseAdmin
    .from('profiles')
    .select('user_id, full_name, avatar_url, score, department, year')
    .eq('user_id', project.owner_id)
    .single()

  return { ...project, owner: owner ?? null }
}

async function getUserContext(
  sessionUserId: string,
  projectId: string,
  projectOwnerId: string
): Promise<{
  profile: UserProfile
  isOwner: boolean
  application: Application
  isTeamMember: boolean
}> {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, user_id, full_name, avatar_url, score')
    .eq('user_id', sessionUserId)
    .single()

  if (!profile) {
    return { profile: null, isOwner: false, application: null, isTeamMember: false }
  }

  // owner_id = profiles.user_id ✅ confirmed
  const isOwner = projectOwnerId === profile.user_id

  // applicant_id = profiles.user_id ✅ (consistent with route.ts)
  const { data: application } = await supabaseAdmin
    .from('applications')
    .select('id, status, message, created_at')
    .eq('project_id', projectId)
    .eq('applicant_id', profile.user_id)
    .maybeSingle()

  const isTeamMember = isOwner || application?.status === 'accepted'

  return { profile, isOwner, application: application ?? null, isTeamMember }
}

// ─── Score helpers ────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 600) return '#34d399'
  if (score >= 400) return '#fbbf24'
  return '#fb7185'
}

function scoreTier(score: number) {
  if (score >= 700) return 'Vanguard Elite'
  if (score >= 500) return 'Active Scholar'
  return 'Probation'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  const project = await getProject(id)
  if (!project) notFound()

  const { profile, isOwner, application, isTeamMember } = session?.user?.id
    ? await getUserContext(session.user.id, id, project.owner_id)
    : { profile: null, isOwner: false, application: null, isTeamMember: false }

  const spotsLeft = project.slots - project.filled_slots
  const fillPct = project.slots > 0
    ? Math.round((project.filled_slots / project.slots) * 100)
    : 0
  const createdDate = new Date(project.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  let unreadCount = 0
  if (session?.user?.id) {
    const { data: viewerProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id')
      .eq('user_id', session.user.id)
      .single()

    const { count } = await supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .in('user_id', viewerProfile ? [viewerProfile.user_id, viewerProfile.id] : [session.user.id])
      .eq('read', false)
    unreadCount = count ?? 0
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; }
        body { font-family: 'Manrope', sans-serif; background-color: #0e1322; color: #dee1f7; margin: 0; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-panel { background: rgba(26,31,47,0.7); backdrop-filter: blur(16px); }
        .ghost-border { border: 1px solid rgba(66,71,84,0.15); }
        .dot-grid { background-image: radial-gradient(circle, rgba(77,142,255,0.05) 1px, transparent 1px); background-size: 24px 24px; }
        .vault-blur { filter: blur(4px); user-select: none; pointer-events: none; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        .skill-pill { padding: 4px 12px; border-radius: 999px; background: rgba(107,216,203,0.08); color: #6bd8cb; border: 1px solid rgba(107,216,203,0.2); font-size: 11px; font-family: 'DM Mono', monospace; text-transform: uppercase; letter-spacing: 0.05em; }
        .tag-pill { padding: 4px 12px; border-radius: 999px; background: rgba(173,198,255,0.08); color: #adc6ff; border: 1px solid rgba(173,198,255,0.2); font-size: 11px; font-family: 'DM Mono', monospace; }
        .notif-badge { position: absolute; top: 2px; right: 2px; min-width: 16px; height: 16px; border-radius: 999px; background: #fb7185; color: #fff; font-size: 9px; font-family: 'DM Mono', monospace; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
        .hover-nav:hover { color: #adc6ff; }
        .hover-sidebar:hover { background: rgba(37,41,58,0.8); }
      `}</style>

      <div className="bg-[#0e1322] min-h-screen dot-grid overflow-x-hidden">

        {/* ── Navbar ── */}
        <DashboardNavbar profile={profile} />

        {/* ── Sidebar ── */}
        <DashboardSidebar profile={profile} session={session} />

        {/* ── Main ── */}
        <main style={{ marginLeft: '256px', paddingTop: '60px', minHeight: '100vh' }}>
          <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', fontFamily: 'DM Mono', fontSize: '11px', color: 'rgba(194,198,214,0.5)' }}>
              <Link href="/dashboard" style={{ color: '#adc6ff' }}>Dashboard</Link>
              <span>›</span>
              <span>Projects</span>
              <span>›</span>
              <span style={{ color: '#dee1f7' }}>{project.title}</span>
            </div>

            {/* Header */}
            <header style={{ marginBottom: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{
                  padding: '3px 10px', fontSize: '10px', fontFamily: 'DM Mono',
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                  background: spotsLeft > 0 ? 'rgba(173,198,255,0.1)' : 'rgba(66,71,84,0.3)',
                  color: spotsLeft > 0 ? '#adc6ff' : '#8c909f',
                  border: spotsLeft > 0 ? '1px solid rgba(173,198,255,0.25)' : '1px solid rgba(66,71,84,0.3)',
                }}>
                  {project.status === 'open' && spotsLeft > 0
                    ? '● Open'
                    : project.status === 'completed'
                    ? '✓ Completed'
                    : '○ Closed'}
                </span>
                <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.4)' }}>
                  EST. {createdDate}
                </span>
                {isOwner && (
                  <span style={{
                    padding: '3px 10px', fontSize: '10px', fontFamily: 'DM Mono',
                    fontWeight: 700, background: 'rgba(107,216,203,0.1)',
                    color: '#6bd8cb', border: '1px solid rgba(107,216,203,0.25)',
                  }}>
                    YOUR PROJECT
                  </span>
                )}
              </div>

              <h1 style={{
                fontFamily: 'Syne', fontSize: 'clamp(36px,5vw,64px)', fontWeight: 800,
                letterSpacing: '-0.04em', lineHeight: 1, color: '#dee1f7',
                marginBottom: '16px', textTransform: 'uppercase',
              }}>
                {project.title.split(' ').map((word: string, i: number) => (
                  i === 1
                    ? <span key={i} style={{ color: '#adc6ff', fontStyle: 'italic' }}>{word} </span>
                    : <span key={i}>{word} </span>
                ))}
              </h1>

              <p style={{ fontSize: '17px', color: '#c2c6d6', maxWidth: '680px', lineHeight: 1.7 }}>
                {project.description}
              </p>

              <div style={{ height: '3px', width: '120px', background: 'linear-gradient(to right, #adc6ff, #6bd8cb, transparent)', marginTop: '24px' }} />
            </header>

            {/* Two-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>

              {/* ── Left Column ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Project Overview */}
                <section className="glass-panel ghost-border" style={{ padding: '32px' }}>
                  <h3 style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: '#dee1f7' }}>
                    <span style={{ width: '4px', height: '24px', background: '#adc6ff', display: 'inline-block' }} />
                    Project Overview
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                    <div>
                      <h4 style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#adc6ff', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>
                        Core Mission
                      </h4>
                      <p style={{ color: '#c2c6d6', fontSize: '14px', lineHeight: 1.7 }}>
                        {project.full_description || project.description}
                      </p>
                    </div>
                    <div>
                      <h4 style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#adc6ff', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>
                        Status
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <span style={{
                          padding: '4px 12px', fontSize: '11px', fontFamily: 'DM Mono', fontWeight: 700,
                          background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
                          border: '1px solid rgba(59,130,246,0.3)',
                          display: 'flex', alignItems: 'center', gap: '8px',
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} className="animate-pulse" />
                          {project.status === 'open' ? 'Active Recruitment' : project.status.toUpperCase()}
                        </span>
                      </div>
                      {project.timeline && (
                        <>
                          <h4 style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#adc6ff', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>
                            Timeline
                          </h4>
                          <p style={{ color: '#c2c6d6', fontSize: '13px', fontFamily: 'DM Mono' }}>{project.timeline}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Required Skills */}
                  {project.required_skills?.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#adc6ff', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>
                        Required Skills
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {project.required_skills.map((skill: string) => (
                          <span key={skill} className="skill-pill">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tech Stack */}
                  {project.tech_stack?.length > 0 && (
                    <div>
                      <h4 style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#adc6ff', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>
                        Technical Stack
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {project.tech_stack.map((tech: string) => (
                          <span key={tech} className="tag-pill">{tech}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* ── Vault Section ── */}
                <section className="glass-panel" style={{ padding: '32px', border: '1px dashed rgba(208,188,255,0.2)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#dee1f7' }}>
                      <span className="material-symbols-outlined" style={{ color: '#d0bcff' }}>encrypted</span>
                      The Vault
                    </h3>
                    <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#d0bcff', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                      {isTeamMember ? 'ACCESS GRANTED' : 'Team Members Only'}
                    </span>
                  </div>

                  {isTeamMember ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {project.github_repo ? (
                        <a href={project.github_repo} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(14,19,34,0.6)', border: '1px solid rgba(208,188,255,0.2)', textDecoration: 'none', transition: 'border-color 0.2s' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span className="material-symbols-outlined" style={{ color: '#d0bcff' }}>code</span>
                            <div>
                              <div style={{ fontFamily: 'DM Mono', fontSize: '13px', color: '#dee1f7' }}>GitHub Repository</div>
                              <div style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.5)', textTransform: 'uppercase', marginTop: '2px' }}>
                                {project.github_repo.replace('https://github.com/', '')}
                              </div>
                            </div>
                          </div>
                          <span className="material-symbols-outlined" style={{ color: '#d0bcff', fontSize: '18px' }}>open_in_new</span>
                        </a>
                      ) : null}

                      {project.file_urls?.map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(14,19,34,0.6)', border: '1px solid rgba(208,188,255,0.15)', textDecoration: 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span className="material-symbols-outlined" style={{ color: 'rgba(208,188,255,0.5)' }}>description</span>
                            <span style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#c2c6d6' }}>Attachment {i + 1}</span>
                          </div>
                          <span className="material-symbols-outlined" style={{ color: '#d0bcff', fontSize: '18px' }}>download</span>
                        </a>
                      ))}

                      {!project.github_repo && (!project.file_urls || project.file_urls.length === 0) && (
                        <p style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#8c909f' }}>
                          No vault assets added yet.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <div className="vault-blur" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[1, 2].map(i => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(14,19,34,0.6)', border: '1px solid rgba(208,188,255,0.15)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <span className="material-symbols-outlined" style={{ color: 'rgba(208,188,255,0.4)' }}>
                                {i === 1 ? 'terminal' : 'neurology'}
                              </span>
                              <div>
                                <div style={{ fontFamily: 'DM Mono', fontSize: '13px', color: '#c2c6d6' }}>project-file-{i}.zip</div>
                                <div style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.4)' }}>github.com/private/repository/src</div>
                              </div>
                            </div>
                            <span className="material-symbols-outlined" style={{ color: '#d0bcff' }}>lock</span>
                          </div>
                        ))}
                      </div>
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(14,19,34,0.7)', backdropFilter: 'blur(4px)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
                      }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(208,188,255,0.1)', border: '1px solid rgba(208,188,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ color: '#d0bcff', fontSize: '28px' }}>lock</span>
                        </div>
                        <p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#d0bcff', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                          Join the team to unlock
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {/* ── Right Column ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '80px' }}>

                {/* Apply / Status Card */}
                <ApplySection
                  projectId={id}
                  projectTitle={project.title}
                  isOwner={isOwner}
                  isLoggedIn={!!session}
                  application={application}
                  spotsLeft={spotsLeft}
                  projectStatus={project.status}
                  slots={project.slots}
                  filledSlots={project.filled_slots}
                />

                {/* Project Lead */}
                <section className="glass-panel ghost-border" style={{ padding: '24px' }}>
                  <h3 style={{ fontFamily: 'Syne', fontSize: '16px', fontWeight: 700, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#dee1f7' }}>
                    Project Lead
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '12px', padding: '2px', background: 'linear-gradient(135deg, #adc6ff, #d0bcff)', overflow: 'hidden' }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '10px', overflow: 'hidden', background: '#25293a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {project.owner?.avatar_url ? (
                            <img src={project.owner.avatar_url} alt={project.owner.full_name ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span className="material-symbols-outlined" style={{ color: '#adc6ff', fontSize: '24px' }}>person</span>
                          )}
                        </div>
                      </div>
                      <div style={{
                        position: 'absolute', bottom: '-4px', right: '-4px',
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: `${scoreColor(project.owner?.score ?? 0)}15`,
                        border: `1px solid ${scoreColor(project.owner?.score ?? 0)}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontFamily: 'DM Mono', fontSize: '8px', fontWeight: 700, color: scoreColor(project.owner?.score ?? 0) }}>
                          {project.owner?.score ?? 0}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#dee1f7' }}>
                        {project.owner?.full_name ?? 'Unknown'}
                      </div>
                      <div style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.5)', marginTop: '2px' }}>
                        {project.owner?.department ?? 'University'} · {scoreTier(project.owner?.score ?? 0)}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: 'rgba(14,19,34,0.5)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.5)' }}>
                        ACCOUNTABILITY SCORE
                      </span>
                      <span style={{ fontFamily: 'DM Mono', fontSize: '12px', fontWeight: 700, color: scoreColor(project.owner?.score ?? 0) }}>
                        {project.owner?.score ?? 0}
                      </span>
                    </div>
                    <div style={{ height: '2px', background: 'rgba(66,71,84,0.4)', marginTop: '8px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        background: scoreColor(project.owner?.score ?? 0),
                        width: `${Math.min(((project.owner?.score ?? 0) / 1000) * 100, 100)}%`,
                      }} />
                    </div>
                  </div>

                  {session && (
                    <Link href={`/profile/${project.owner_id}`}>
                      <button style={{
                        width: '100%', padding: '8px', borderRadius: '8px', cursor: 'pointer',
                        border: '1px solid rgba(66,71,84,0.2)', background: 'transparent',
                        fontFamily: 'DM Mono', fontSize: '11px', color: '#c2c6d6',
                        transition: 'background 0.2s',
                      }}>
                        View Full Profile
                      </button>
                    </Link>
                  )}
                </section>

                {/* Slots Stats */}
                <section className="glass-panel ghost-border" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.5)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                      Team Slots
                    </span>
                    <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: spotsLeft > 0 ? '#34d399' : '#fb7185' }}>
                      {spotsLeft} / {project.slots} open
                    </span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(66,71,84,0.3)', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{
                      height: '100%',
                      background: spotsLeft > 0 ? '#adc6ff' : '#fb7185',
                      width: `${fillPct}%`,
                      boxShadow: `0 0 8px ${spotsLeft > 0 ? 'rgba(173,198,255,0.5)' : 'rgba(251,113,133,0.5)'}`,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.4)' }}>
                      {project.filled_slots} joined
                    </span>
                    <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.4)' }}>
                      {fillPct}% filled
                    </span>
                  </div>
                </section>

              </div>
            </div>
          </div>
        </main>

        <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', height: '1px', background: 'linear-gradient(to right, transparent, rgba(173,198,255,0.2), transparent)', zIndex: 50 }} />
      </div>
    </>
  )
}