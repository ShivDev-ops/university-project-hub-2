// File: app/profile/[userId]/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'


import DashboardNavbar from '@/components/DashboardNavbar'
import DashboardSidebar from '@/components/DashboardSidebar'

// ─── Types ────────────────────────────────────────────────────────────────────

type Profile = {
  id: string
  user_id: string
  full_name: string
  email: string
  avatar_url: string | null
  department: string | null
  year: number | null
  bio: string | null
  skills: string[]
  github_url: string | null
  portfolio_url: string | null
  score: number
  created_at: string
}

type Project = {
  id: string
  title: string
  description: string
  required_skills: string[]
  status: string
  created_at: string
  slots: number
  filled_slots: number
  role?: 'owner' | 'member'
}

// ─── Score helpers ─────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 600) return '#34d399'
  if (score >= 400) return '#fbbf24'
  return '#fb7185'
}

function scoreLabel(score: number) {
  if (score >= 700) return 'Vanguard Elite'
  if (score >= 500) return 'Active Scholar'
  if (score >= 400) return 'Good Standing'
  return 'Probation'
}

function scoreDashOffset(score: number) {
  // Circle r=45 → circumference ≈ 283
  const pct = Math.min(score / 1000, 1)
  return 283 - pct * 283
}

function normalizeExternalUrl(url: string | null | undefined) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProfilePage(props: {
  params: Promise<{ userid: string }>
}) {
  const params = await props.params;
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  // Fetch the viewed profile
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select(
      'id, user_id, full_name, email, avatar_url, department, year, bio, skills, github_url, portfolio_url, score, created_at'
    )
    .or(`user_id.eq.${params.userid},id.eq.${params.userid}`)
    .maybeSingle()

  if (error || !profile) notFound()

  const isOwnProfile = profile.user_id === session.user.id

  // Fetch viewer's own profile (for navbar/sidebar and logic)
  const { data: viewerProfile } = await supabaseAdmin
    .from('profiles')
    .select('id, user_id, full_name, avatar_url, score')
    .eq('user_id', session.user.id)
    .single()

  // Fetch projects owned by the viewed profile (supports both legacy/current owner_id mapping)
  const { data: ownedProjects } = await supabaseAdmin
    .from('projects')
    .select('id, title, description, required_skills, status, created_at, slots, filled_slots')
    .or(`owner_id.eq.${profile.user_id},owner_id.eq.${profile.id}`)
    .order('created_at', { ascending: false })

  // Fetch projects where viewed profile is an accepted team member
  const { data: membershipApps } = await supabaseAdmin
    .from('applications')
    .select('project_id')
    .or(`applicant_id.eq.${profile.user_id},applicant_id.eq.${profile.id}`)
    .eq('status', 'accepted')

  const memberProjectIds = Array.from(new Set((membershipApps ?? []).map((a: { project_id: string }) => a.project_id)))

  const { data: memberProjects } = memberProjectIds.length > 0
    ? await supabaseAdmin
        .from('projects')
        .select('id, title, description, required_skills, status, created_at, slots, filled_slots')
        .in('id', memberProjectIds)
        .order('created_at', { ascending: false })
    : { data: [] as Project[] }

  const allProjectsMap = new Map<string, Project>()

  for (const project of ownedProjects ?? []) {
    allProjectsMap.set(project.id, { ...project, role: 'owner' })
  }

  for (const project of memberProjects ?? []) {
    if (!allProjectsMap.has(project.id)) {
      allProjectsMap.set(project.id, { ...project, role: 'member' })
    }
  }

  const allProjects = Array.from(allProjectsMap.values())

  const activeProjects = allProjects
    .filter(project => project.status === 'open' || project.status === 'in_progress')
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))

  const completedProjects = allProjects
    .filter(project => project.status === 'completed')
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))

  // Check if viewer is a teammate on any shared project (for endorse button)
  const { data: sharedApps } = await supabaseAdmin
    .from('applications')
    .select('project_id')
    .or(`applicant_id.eq.${viewerProfile?.user_id ?? ''},applicant_id.eq.${viewerProfile?.id ?? ''}`)
    .eq('status', 'accepted')

  const sharedProjectIds = new Set((sharedApps ?? []).map((a: any) => a.project_id))
  const isTeammate =
    !isOwnProfile &&
    (activeProjects ?? []).some((p: Project) => sharedProjectIds.has(p.id))

  const color = scoreColor(profile.score)
  const dashOffset = scoreDashOffset(profile.score)
  const githubUrl = normalizeExternalUrl(profile.github_url)
  const portfolioUrl = normalizeExternalUrl(profile.portfolio_url)
  const linkedinUrl = portfolioUrl && portfolioUrl.toLowerCase().includes('linkedin.com') ? portfolioUrl : null

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <style>{`
        body { font-family: 'Manrope', sans-serif; background: #0e1322; color: #dee1f7; margin: 0; }
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }
        .glass-panel { background: rgba(26,31,47,0.7); backdrop-filter: blur(16px); }
        .ghost-border { border: 1px solid rgba(66,71,84,0.15); }
        .neon-primary { box-shadow: 0 0 40px -10px rgba(173,198,255,0.15); }
        .neon-secondary { box-shadow: 0 0 40px -10px rgba(107,216,203,0.15); }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(77,142,255,0.05) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .card-hover { transition: all 0.3s; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 40px -10px rgba(77,142,255,0.2); }
        .avatar-glow { box-shadow: 0 0 0 2px rgba(173,198,255,0.3), 0 0 40px -10px rgba(173,198,255,0.2); }
        .skill-chip { transition: all 0.15s; }
        .skill-chip:hover { border-color: rgba(107,216,203,0.4); color: #6bd8cb; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4d8eff; border-radius: 10px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        @keyframes ping { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
        .animate-ping { animation: ping 2s ease-in-out infinite; }
      `}</style>

      <div className="bg-[#0e1322] min-h-screen dot-grid overflow-x-hidden">

        {/* ── Top Nav ── */}
        <DashboardNavbar profile={viewerProfile} />

        <div className="flex pt-[60px] min-h-screen">

          {/* ── Sidebar ── */}
          <DashboardSidebar profile={viewerProfile} session={session} />

          {/* ── Main Content ── */}
          <main className="md:ml-64 w-full p-6 lg:p-10 overflow-y-auto custom-scrollbar">
            <div className="hidden md:flex items-center justify-between mb-8 px-1">
              <div style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.5)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                Node ID: {profile.user_id.slice(0, 8).toUpperCase()}
              </div>
              {isOwnProfile && (
                <div style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#6bd8cb', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                  Your Profile
                </div>
              )}
            </div>

            {/* ── Hero Section ── */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-center">

              {/* Left: Avatar + Name */}
              <div className="lg:col-span-8 flex flex-col md:flex-row items-center md:items-end gap-8">

                {/* Avatar */}
                <div className="relative group flex-shrink-0">
                  <div className="absolute -inset-1 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"
                    style={{ background: 'linear-gradient(135deg, #adc6ff, #d0bcff)' }} />
                  <div className="relative w-44 h-44 rounded-full overflow-hidden avatar-glow"
                    style={{ border: '2px solid rgba(66,71,84,0.4)' }}>
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ background: '#25293a' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#adc6ff' }}>person</span>
                      </div>
                    )}
                  </div>
                  {/* Verified badge */}
                  <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full border-4 flex items-center justify-center"
                    style={{ background: '#6bd8cb', borderColor: '#0e1322' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#003732', fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                </div>

                {/* Name + meta */}
                <div className="text-center md:text-left">
                  <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(40px,6vw,72px)', letterSpacing: '-0.04em', lineHeight: 1, textTransform: 'uppercase', marginBottom: '16px' }}>
                    {profile.full_name.split(' ')[0]}<br />
                    <span style={{ color: '#adc6ff' }}>{profile.full_name.split(' ').slice(1).join(' ')}</span>
                  </h1>

                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <span className="flex items-center gap-2 px-3 py-1"
                      style={{ background: '#25293a', border: '1px solid rgba(66,71,84,0.3)', fontFamily: 'DM Mono', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c2c6d6' }}>
                      <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#6bd8cb' }} />
                      {profile.department ?? 'Researcher'}
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1"
                      style={{ background: '#25293a', border: '1px solid rgba(66,71,84,0.3)', fontFamily: 'DM Mono', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c2c6d6' }}>
                      Node ID: {profile.user_id.slice(0, 6).toUpperCase()}
                    </span>
                    {profile.year && (
                      <span className="flex items-center gap-2 px-3 py-1"
                        style={{ background: '#25293a', border: '1px solid rgba(66,71,84,0.3)', fontFamily: 'DM Mono', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c2c6d6' }}>
                        Year {profile.year}
                      </span>
                    )}
                    {profile.email && (
                      <a href={`mailto:${profile.email}`}
                        className="flex items-center gap-2 px-3 py-1 hover:border-[#adc6ff]/40 transition-all"
                        style={{ background: '#25293a', border: '1px solid rgba(66,71,84,0.3)', fontFamily: 'DM Mono', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#adc6ff' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>mail</span>
                        {profile.email}
                      </a>
                    )}
                    {githubUrl && (
                      <a href={githubUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1 hover:border-[#6bd8cb]/40 transition-all"
                        style={{ background: '#25293a', border: '1px solid rgba(66,71,84,0.3)', fontFamily: 'DM Mono', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6bd8cb' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>code</span>
                        GitHub
                      </a>
                    )}
                    {linkedinUrl ? (
                      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1 hover:border-[#d0bcff]/40 transition-all"
                        style={{ background: '#25293a', border: '1px solid rgba(66,71,84,0.3)', fontFamily: 'DM Mono', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#d0bcff' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>hub</span>
                        LinkedIn
                      </a>
                    ) : portfolioUrl ? (
                      <a href={portfolioUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1 hover:border-[#adc6ff]/40 transition-all"
                        style={{ background: '#25293a', border: '1px solid rgba(66,71,84,0.3)', fontFamily: 'DM Mono', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#adc6ff' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
                        Portfolio
                      </a>
                    ) : null}
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <p className="mt-4 max-w-lg" style={{ fontSize: '14px', color: '#c2c6d6', lineHeight: 1.7, textAlign: 'left' }}>
                      {profile.bio}
                    </p>
                  )}

                  {/* Edit / Endorse buttons */}
                  <div className="flex gap-3 mt-5 justify-center md:justify-start">
                    {isOwnProfile && (
                      <Link href="/profile/edit">
                        <button className="flex items-center gap-2 px-5 py-2.5 transition-all hover:bg-[#adc6ff] hover:text-[#002e6a]"
                          style={{ background: 'rgba(173,198,255,0.1)', border: '1px solid rgba(173,198,255,0.25)', color: '#adc6ff', fontFamily: 'DM Mono', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                          Edit Profile
                        </button>
                      </Link>
                    )}
                    {isTeammate && (
                      <button className="flex items-center gap-2 px-5 py-2.5 transition-all"
                        style={{ background: 'rgba(208,188,255,0.08)', border: '1px solid rgba(208,188,255,0.2)', color: '#d0bcff', fontFamily: 'DM Mono', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>thumb_up</span>
                        Endorse
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Score ring */}
              <div className="lg:col-span-4 flex justify-center">
                <div className="relative w-52 h-52 flex items-center justify-center glass-panel rounded-full neon-secondary ghost-border">
                  <svg className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50%" cy="50%" r="45%" fill="none" stroke="rgba(47,52,69,0.8)" strokeWidth="6" />
                    <circle
                      cx="50%" cy="50%" r="45%" fill="none"
                      stroke={color}
                      strokeWidth="6"
                      strokeDasharray="283"
                      strokeDashoffset={dashOffset}
                      strokeLinecap="square"
                      style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                  </svg>
                  <div className="text-center z-10">
                    <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color, textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: '4px' }}>
                      Score
                    </span>
                    <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '52px', color: '#dee1f7', lineHeight: 1 }}>
                      {profile.score}
                    </span>
                    <span style={{ display: 'block', fontFamily: 'DM Mono', fontSize: '9px', color: 'rgba(194,198,214,0.6)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {scoreLabel(profile.score)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Data Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Skills terminal */}
              <div id="skills" className="lg:col-span-4 glass-panel ghost-border p-8 neon-secondary"
                style={{ borderLeft: '2px solid #d0bcff' }}>
                <h3 className="flex items-center gap-3 mb-6"
                  style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#d0bcff' }}>
                  <span className="material-symbols-outlined">terminal</span>
                  Tech_Stack
                </h3>

                {profile.skills && profile.skills.length > 0 ? (
                  <div className="space-y-6">
                    {/* GitHub verified skills */}
                    {profile.github_url && (
                      <div>
                        <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#6bd8cb', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '10px' }}>
                          Github_Verified
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.slice(0, 4).map((skill: string) => (
                            <span key={skill} className="skill-chip px-3 py-1"
                              style={{ background: 'rgba(107,216,203,0.05)', border: '1px solid rgba(107,216,203,0.2)', color: '#6bd8cb', fontFamily: 'DM Mono', fontSize: '10px' }}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All skills */}
                    <div className="pt-4" style={{ borderTop: '1px solid rgba(66,71,84,0.15)' }}>
                      <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.5)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '10px' }}>
                        All Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill: string) => (
                          <span key={skill} className="skill-chip px-3 py-1"
                            style={{ background: '#25293a', border: '1px solid rgba(66,71,84,0.3)', color: '#c2c6d6', fontFamily: 'DM Mono', fontSize: '10px' }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Top skill proficiency bar */}
                    <div className="pt-4" style={{ borderTop: '1px solid rgba(66,71,84,0.15)' }}>
                      <div className="flex justify-between items-center mb-2">
                        <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#dee1f7', textTransform: 'uppercase' }}>
                          {profile.skills[0]}
                        </span>
                        <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#d0bcff' }}>Primary</span>
                      </div>
                      <div className="h-1 overflow-hidden" style={{ background: 'rgba(47,52,69,0.8)' }}>
                        <div className="h-full" style={{ background: '#d0bcff', width: '85%' }} />
                      </div>
                    </div>

                    {isOwnProfile && (
                      <Link href="/profile/edit">
                        <button className="w-full py-2 transition-all hover:bg-[#25293a]"
                          style={{ border: '1px solid rgba(66,71,84,0.3)', fontFamily: 'DM Mono', fontSize: '9px', color: '#c2c6d6', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                          Manage_Skills
                        </button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#424754', marginBottom: '10px' }}>code_off</span>
                    <p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#8c909f' }}>No skills added yet</p>
                    {isOwnProfile && (
                      <Link href="/profile/edit">
                        <button className="mt-4 px-4 py-2 text-xs"
                          style={{ background: 'rgba(173,198,255,0.1)', border: '1px solid rgba(173,198,255,0.2)', color: '#adc6ff', fontFamily: 'DM Mono' }}>
                          Add Skills
                        </button>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Score history / stats panel */}
              <div className="lg:col-span-8 glass-panel ghost-border p-8 neon-primary">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                      Activity_Nodes
                    </h3>
                    <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#8c909f', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '4px' }}>
                      Project Participation History
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {/* Stats summary chips */}
                    <div className="px-3 py-2 text-center" style={{ background: '#25293a', border: '1px solid rgba(66,71,84,0.3)' }}>
                      <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '20px', color: '#adc6ff' }}>
                        {(activeProjects?.length ?? 0) + (completedProjects?.length ?? 0)}
                      </div>
                      <div style={{ fontFamily: 'DM Mono', fontSize: '9px', color: '#8c909f', textTransform: 'uppercase' }}>Total</div>
                    </div>
                    <div className="px-3 py-2 text-center" style={{ background: '#25293a', border: '1px solid rgba(66,71,84,0.3)' }}>
                      <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '20px', color: '#6bd8cb' }}>
                        {completedProjects?.length ?? 0}
                      </div>
                      <div style={{ fontFamily: 'DM Mono', fontSize: '9px', color: '#8c909f', textTransform: 'uppercase' }}>Done</div>
                    </div>
                    <div className="px-3 py-2 text-center" style={{ background: '#25293a', border: '1px solid rgba(66,71,84,0.3)' }}>
                      <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '20px', color, }}>
                        {profile.score}
                      </div>
                      <div style={{ fontFamily: 'DM Mono', fontSize: '9px', color: '#8c909f', textTransform: 'uppercase' }}>Score</div>
                    </div>
                  </div>
                </div>

                {/* Mini activity chart (decorative) */}
                <div className="h-40 w-full relative" style={{ borderLeft: '1px solid rgba(66,71,84,0.2)', borderBottom: '1px solid rgba(66,71,84,0.2)' }}>
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 160">
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#adc6ff" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#adc6ff" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,140 Q100,120 200,80 T400,90 T600,40 T800,60" fill="none" stroke="#adc6ff" strokeWidth="2" />
                    <path d="M0,140 Q100,120 200,80 T400,90 T600,40 T800,60 L800,160 L0,160 Z" fill="url(#lineGrad)" />
                    <circle cx="200" cy="80" r="3" fill="#adc6ff" className="animate-pulse" />
                    <circle cx="600" cy="40" r="3" fill="#adc6ff" className="animate-pulse" />
                  </svg>
                  <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 pb-1"
                    style={{ fontFamily: 'DM Mono', fontSize: '9px', color: '#8c909f', textTransform: 'uppercase' }}>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => <span key={m}>{m}</span>)}
                  </div>
                </div>

                {/* Member since */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#8c909f' }}>calendar_today</span>
                  <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#8c909f', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* ── Active Projects ── */}
              <div id="active" className="lg:col-span-12 mt-4">
                <div className="flex items-end gap-4 mb-8">
                  <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(28px,4vw,40px)', textTransform: 'uppercase', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    Active<br />
                    <span style={{ color: '#6bd8cb' }}>Projects</span>
                  </h2>
                  <div className="flex-grow mb-2" style={{ borderBottom: '1px solid rgba(66,71,84,0.2)' }} />
                  <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#8c909f', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>
                    Current_Projects
                  </span>
                </div>

                {activeProjects && activeProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeProjects.map((project: Project) => {
                      const spotsLeft = project.slots - project.filled_slots
                      const statusColor = project.status === 'open' ? '#6bd8cb' : '#adc6ff'
                      const borderColor = project.status === 'open' ? '#6bd8cb' : '#adc6ff'
                      return (
                        <Link key={project.id} href={`/projects/${project.id}`}>
                          <div className="glass-panel ghost-border p-6 relative card-hover cursor-pointer"
                            style={{ borderLeft: `2px solid ${borderColor}` }}>
                            <div className="flex justify-between items-start mb-4">
                              <span className="px-2 py-0.5"
                                style={{ background: `${statusColor}15`, border: `1px solid ${statusColor}30`, color: statusColor, fontFamily: 'DM Mono', fontSize: '9px', textTransform: 'uppercase' }}>
                                Status: {project.status === 'open' ? 'Active' : 'In Progress'}
                              </span>
                              <span style={{ fontFamily: 'DM Mono', fontSize: '9px', color: '#8c909f', textTransform: 'uppercase' }}>
                                {spotsLeft} slots left
                              </span>
                            </div>
                            <h4 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '18px', textTransform: 'uppercase', marginBottom: '4px', lineHeight: 1.2 }}>
                              {project.title}
                            </h4>
                            <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#adc6ff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
                              Role: {project.role === 'member' ? 'Team Member' : 'Owner'}
                            </p>
                            <p style={{ fontSize: '12px', color: '#c2c6d6', marginBottom: '20px', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {project.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-4">
                              {project.required_skills?.slice(0, 3).map((s: string) => (
                                <span key={s} style={{ padding: '2px 6px', background: '#25293a', fontFamily: 'DM Mono', fontSize: '9px', color: '#8c909f' }}>
                                  {s}
                                </span>
                              ))}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="material-symbols-outlined" style={{ color: statusColor, fontSize: '18px' }}>trending_up</span>
                              <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#adc6ff' }}>View →</span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 glass-panel ghost-border">
                    <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#424754', marginBottom: '12px' }}>rocket_launch</span>
                    <p style={{ fontFamily: 'Syne', fontSize: '18px', fontWeight: 700, color: '#c2c6d6' }}>No active projects</p>
                    <p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#8c909f', marginTop: '6px' }}>
                      {isOwnProfile ? 'Post your first project to get started' : 'No active projects at the moment'}
                    </p>
                    {isOwnProfile && (
                      <Link href="/projects/create">
                        <button className="mt-5 px-5 py-2.5 neon-primary"
                          style={{ background: '#adc6ff', color: '#002e6a', fontFamily: 'DM Mono', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                          + Post Project
                        </button>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* ── Completed Projects ── */}
              <div id="completed" className="lg:col-span-12 mt-4">
                <div className="flex items-end gap-4 mb-8">
                  <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(28px,4vw,40px)', textTransform: 'uppercase', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    Completed<br />
                    <span style={{ color: '#4d8eff' }}>Archivals</span>
                  </h2>
                  <div className="flex-grow mb-2" style={{ borderBottom: '1px solid rgba(66,71,84,0.2)' }} />
                  <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#adc6ff', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>
                    {completedProjects?.length ?? 0} Archivals
                  </span>
                </div>

                {completedProjects && completedProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-12">
                    {completedProjects.map((project: Project, index: number) => (
                      <Link key={project.id} href={`/projects/${project.id}`}>
                        <div
                          className={`glass-panel ghost-border group card-hover overflow-hidden relative cursor-pointer ${index === completedProjects.length - 1 && completedProjects.length % 4 === 1 ? 'md:col-span-2' : ''}`}
                        >
                          {/* Top color bar */}
                          <div style={{ height: '3px', background: 'linear-gradient(to right, #adc6ff, #6bd8cb, transparent)' }} />

                          <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <span className="px-2 py-0.5"
                                style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', fontFamily: 'DM Mono', fontSize: '9px', textTransform: 'uppercase' }}>
                                #Completed
                              </span>
                              <span style={{ fontFamily: 'DM Mono', fontSize: '9px', color: '#8c909f' }}>
                                {new Date(project.created_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' }).replace('/', '.')}
                              </span>
                            </div>

                            <h4 className="group-hover:text-[#adc6ff] transition-colors"
                              style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '18px', textTransform: 'uppercase', marginBottom: '4px', lineHeight: 1.2 }}>
                              {project.title}
                            </h4>
                            <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#6bd8cb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
                              Role: {project.role === 'member' ? 'Team Member' : 'Owner'}
                            </p>
                            <p style={{ fontSize: '12px', color: '#c2c6d6', marginBottom: '14px', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {project.description}
                            </p>

                            {/* Skill chips */}
                            {project.required_skills?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {project.required_skills.slice(0, 3).map((s: string) => (
                                  <span key={s} style={{ padding: '2px 6px', background: '#25293a', fontFamily: 'DM Mono', fontSize: '9px', color: '#8c909f' }}>
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 glass-panel ghost-border mb-12">
                    <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#424754', marginBottom: '12px' }}>inventory_2</span>
                    <p style={{ fontFamily: 'Syne', fontSize: '18px', fontWeight: 700, color: '#c2c6d6' }}>No completed projects yet</p>
                    <p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#8c909f', marginTop: '6px' }}>
                      Completed projects will appear here as a portfolio
                    </p>
                  </div>
                )}
              </div>

            </div>
          </main>
        </div>

        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#0e1322]/90 backdrop-blur-xl border-t border-[#adc6ff]/10 z-50 flex justify-around items-center h-20 px-4">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined">grid_view</span>
            <span className="text-[9px] font-['DM_Mono'] uppercase">Nodes</span>
          </Link>
          <Link href={`/profile/${profile.user_id}`} className="flex flex-col items-center gap-1 text-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            <span className="text-[9px] font-['DM_Mono'] uppercase">Profile</span>
          </Link>
          <Link href="/projects/create" className="relative -top-6">
            <div className="bg-primary-container text-on-primary-container w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined">add</span>
            </div>
          </Link>
          <Link href="#active" className="flex flex-col items-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-[9px] font-['DM_Mono'] uppercase">Stats</span>
          </Link>
          <Link href="/notifications" className="flex flex-col items-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined">notifications</span>
            <span className="text-[9px] font-['DM_Mono'] uppercase">Alerts</span>
          </Link>
        </nav>

        {/* Background particles */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ opacity: 0.25 }}>
          <div className="animate-ping" style={{ position: 'absolute', top: '25%', left: '25%', width: '2px', height: '2px', background: '#adc6ff', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '75%', right: '33%', width: '3px', height: '3px', background: '#6bd8cb', borderRadius: '50%', animation: 'ping 3s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '25%', left: '60%', width: '2px', height: '2px', background: '#d0bcff', borderRadius: '50%' }} />
        </div>
      </div>
    </>
  )
}