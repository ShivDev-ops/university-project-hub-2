// app/projects/[id]/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ApplySection } from './ApplySection'
import { DeleteProjectControl } from './DeleteProjectControl'
import { LeaveProjectControl } from './LeaveProjectControl'
import DashboardNavbar from '@/components/DashboardNavbar'
import DashboardSidebar from '@/components/DashboardSidebar'
import { MarkdownView } from '@/components/MarkdownView'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
  vault_files?: string[]
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

type ProfileCandidate = Exclude<UserProfile, null>

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function getProject(id: string): Promise<Project | null> {
  const { data: project, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !project) return null

  const { data: owner } = await supabaseAdmin
    .from('profiles')
    .select('user_id, full_name, avatar_url, score, department, year')
    .eq('user_id', project.owner_id)
    .single()

  return { ...project, owner: owner ?? null }
}

async function resolveProfileCandidates(
  sessionUserId: string,
  sessionUserEmail: string | null | undefined
): Promise<ProfileCandidate[]> {
  const dedupe = new Map<string, ProfileCandidate>()

  const { data: byIdRows } = await supabaseAdmin
    .from('profiles')
    .select('id, user_id, full_name, avatar_url, score')
    .or(`user_id.eq.${sessionUserId},id.eq.${sessionUserId}`)
    .limit(10)

  for (const row of byIdRows ?? []) {
    dedupe.set(`${row.id}:${row.user_id}`, row)
  }

  if (sessionUserEmail) {
    const { data: byEmailRows } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id, full_name, avatar_url, score')
      .eq('email', sessionUserEmail)
      .limit(10)

    for (const row of byEmailRows ?? []) {
      dedupe.set(`${row.id}:${row.user_id}`, row)
    }
  }

  const candidates = Array.from(dedupe.values())
  candidates.sort((a, b) => {
    const aMatch = a.user_id === sessionUserId || a.id === sessionUserId ? 1 : 0
    const bMatch = b.user_id === sessionUserId || b.id === sessionUserId ? 1 : 0
    return bMatch - aMatch
  })

  return candidates
}

async function getUserContext(
  sessionUserId: string,
  sessionUserEmail: string | null | undefined,
  projectId: string,
  projectOwnerId: string
): Promise<{
  profile: UserProfile
  isOwner: boolean
  application: Application
  isTeamMember: boolean
}> {
  const profileCandidates = await resolveProfileCandidates(sessionUserId, sessionUserEmail)
  const profile = profileCandidates[0] ?? null

  if (!profile) {
    return { profile: null, isOwner: false, application: null, isTeamMember: false }
  }

  const identitySet = new Set<string>()
  for (const candidate of profileCandidates) {
    if (candidate.id) identitySet.add(candidate.id)
    if (candidate.user_id) identitySet.add(candidate.user_id)
  }

  const identityCandidates = Array.from(identitySet)
  const isOwner = identityCandidates.includes(projectOwnerId)

  let applicationRows: Array<{ id: string; status: string; message: string | null; created_at: string }> = []
  if (identityCandidates.length > 0) {
    const { data } = await supabaseAdmin
      .from('applications')
      .select('id, status, message, created_at')
      .eq('project_id', projectId)
      .in('applicant_id', identityCandidates)
      .order('created_at', { ascending: false })
    applicationRows = data ?? []
  }

  const applications = applicationRows
  const acceptedApplication = applications.find((row) => isAcceptedStatus(row.status)) ?? null
  let application = acceptedApplication ?? applications[0] ?? null

  let hasAcceptedNotification = false
  if (!isOwner && !acceptedApplication && identityCandidates.length > 0) {
    const { data: acceptedNotif } = await supabaseAdmin
      .from('notifications')
      .select('id, created_at')
      .in('user_id', identityCandidates)
      .eq('type', 'accepted')
      .contains('metadata', { project_id: projectId })
      .order('created_at', { ascending: false })
      .limit(1)

    if ((acceptedNotif?.length ?? 0) > 0) {
      hasAcceptedNotification = true
      if (!application) {
        application = {
          id: acceptedNotif![0].id,
          status: 'accepted',
          message: null,
          created_at: acceptedNotif![0].created_at,
        }
      }
    }
  }

  const isTeamMember = isOwner || !!acceptedApplication || hasAcceptedNotification

  return { profile, isOwner, application: application ?? null, isTeamMember }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function isAcceptedStatus(status: string | null | undefined) {
  const normalized = String(status || '').trim().toLowerCase()
  return normalized === 'accepted' || normalized === 'approved' || normalized === 'active'
}

function isImageAsset(url: string) {
  const clean = url.split('?')[0].toLowerCase()
  return clean.endsWith('.png') || clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.gif') || clean.endsWith('.webp') || clean.endsWith('.svg')
}

function normalizeAssetList(value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed)
        return Array.isArray(parsed)
          ? parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          : []
      } catch { return [] }
    }
    return trimmed.includes(',')
      ? trimmed.split(',').map(s => s.trim()).filter(Boolean)
      : [trimmed]
  }
  return []
}

function isPdfAsset(url: string) {
  return url.split('?')[0].toLowerCase().endsWith('.pdf')
}

function displayFileName(url: string, index: number) {
  try {
    const name = decodeURIComponent(url.split('/').pop() || '')
    return name || `Attachment ${index + 1}`
  } catch {
    return `Attachment ${index + 1}`
  }
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
    ? await getUserContext(session.user.id, session.user.email, id, project.owner_id)
    : { profile: null, isOwner: false, application: null, isTeamMember: false }

  const spotsLeft = project.slots - project.filled_slots
  const fillPct = project.slots > 0
    ? Math.round((project.filled_slots / project.slots) * 100)
    : 0
  const createdDate = new Date(project.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
  const vaultAssets = Array.from(
    new Set([
      ...normalizeAssetList(project.file_urls),
      ...normalizeAssetList(project.vault_files),
    ])
  )

  let unreadCount = 0
  if (session?.user?.id) {
    const viewerCandidates = await resolveProfileCandidates(session.user.id, session.user.email)
    const viewerIds = Array.from(
      new Set(
        viewerCandidates.flatMap((c) => [c.user_id, c.id]).filter(Boolean)
      )
    )
    if (viewerIds.length > 0) {
      const { count } = await supabaseAdmin
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .in('user_id', viewerIds)
        .eq('read', false)
      unreadCount = count ?? 0
    }
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: 'Manrope', sans-serif; background-color: #0e1322; color: #dee1f7; margin: 0; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-panel { background: rgba(26,31,47,0.7); backdrop-filter: blur(16px); }
        .ghost-border { border: 1px solid rgba(66,71,84,0.15); }
        .dot-grid { background-image: radial-gradient(circle, rgba(77,142,255,0.05) 1px, transparent 1px); background-size: 24px 24px; }
        .vault-blur { filter: blur(4px); user-select: none; pointer-events: none; }
        .skill-pill { padding: 4px 12px; border-radius: 999px; background: rgba(107,216,203,0.08); color: #6bd8cb; border: 1px solid rgba(107,216,203,0.2); font-size: 11px; font-family: 'DM Mono', monospace; text-transform: uppercase; letter-spacing: 0.05em; }
        .tag-pill { padding: 4px 12px; border-radius: 999px; background: rgba(173,198,255,0.08); color: #adc6ff; border: 1px solid rgba(173,198,255,0.2); font-size: 11px; font-family: 'DM Mono', monospace; }

        /* ── Layout ── */
        .page-wrapper {
          min-height: 100vh;
        }

        /* Desktop: push main content past the sidebar */
        .main-content {
          margin-left: 256px;
          padding-top: 60px;
          min-height: 100vh;
          transition: margin-left 0.3s ease;
        }

        .inner-content {
          padding: 40px 40px;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Two-column layout for desktop */
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
          align-items: start;
        }

        /* Right column sticky on desktop */
        .right-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: sticky;
          top: 80px;
        }

        /* Project title */
        .project-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 5vw, 64px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          color: #dee1f7;
          margin-bottom: 16px;
          text-transform: uppercase;
          word-break: break-word;
        }

        /* Breadcrumb */
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 32px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: rgba(194,198,214,0.5);
          flex-wrap: wrap;
        }

        /* Status badges row */
        .status-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        /* Tag pills row */
        .tag-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* Skills row */
        .skills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        /* Vault file row */
        .vault-file-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: rgba(14,19,34,0.6);
          border: 1px solid rgba(208,188,255,0.15);
          gap: 12px;
          flex-wrap: wrap;
        }

        .vault-file-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }

        .vault-file-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        /* ── Tablet (≤ 1024px) ── */
        @media (max-width: 1024px) {
          .main-content {
            margin-left: 256px;
          }
          .detail-grid {
            grid-template-columns: 1fr 340px;
            gap: 24px;
          }
          .inner-content {
            padding: 32px 24px;
          }
        }

        /* ── Mobile / small tablet (≤ 768px) ── */
        @media (max-width: 768px) {
          /* Sidebar is hidden/collapsed on mobile — handled by DashboardSidebar component */
          .main-content {
            margin-left: 0;
            padding-top: 60px; /* just navbar height */
          }

          .inner-content {
            padding: 24px 16px;
          }

          /* Stack columns vertically */
          .detail-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          /* Right column loses sticky on mobile */
          .right-col {
            position: static;
            top: auto;
          }

          /* Reorder: show apply card above details on mobile */
          .right-col {
            order: -1;
          }

          .breadcrumb {
            margin-bottom: 20px;
          }
        }

        /* ── Small mobile (≤ 480px) ── */
        @media (max-width: 480px) {
          .inner-content {
            padding: 16px 12px;
          }

          .skill-pill, .tag-pill {
            font-size: 10px;
            padding: 3px 10px;
          }

          .vault-file-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .vault-file-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>

      <div className="bg-[#0e1322] page-wrapper dot-grid overflow-x-hidden">

        {/* ── Navbar ── */}
        <DashboardNavbar profile={profile} />

        {/* ── Sidebar ── */}
        <DashboardSidebar profile={profile} session={session} />

        {/* ── Main ── */}
        <main className="main-content">
          <div className="inner-content">

            {/* Breadcrumb */}
            <nav className="breadcrumb">
              <Link href="/dashboard" style={{ color: '#adc6ff' }}>Dashboard</Link>
              <span>›</span>
              <span>Projects</span>
              <span>›</span>
              <span style={{ color: '#dee1f7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                {project.title}
              </span>
            </nav>

            {/* Header */}
            <header style={{ marginBottom: '40px' }}>
              <div className="status-row">
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

              <h1 className="project-title">
                {project.title.split(' ').map((word: string, i: number) => (
                  i === 1
                    ? <span key={i} style={{ color: '#adc6ff', fontStyle: 'italic' }}>{word} </span>
                    : <span key={i}>{word} </span>
                ))}
              </h1>

              <p style={{ fontSize: 'clamp(14px, 2vw, 17px)', color: '#c2c6d6', maxWidth: '680px', lineHeight: 1.7 }}>
                {project.description}
              </p>

              <div style={{ height: '3px', width: '120px', background: 'linear-gradient(to right, #adc6ff, #6bd8cb, transparent)', marginTop: '24px' }} />
            </header>

            {/* Two-column grid */}
            <div className="detail-grid">

              {/* ── Left Column ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Full Details */}
                <section className="glass-panel ghost-border" style={{ padding: 'clamp(16px, 3vw, 28px)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'Syne', fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#dee1f7', margin: 0 }}>
                      <span className="material-symbols-outlined" style={{ color: '#adc6ff' }}>description</span>
                      Full Details
                    </h3>
                    <div className="tag-row">
                      <span className="tag-pill">{spotsLeft} spot{spotsLeft === 1 ? '' : 's'} left</span>
                      <span className="tag-pill">{project.visibility}</span>
                      <span className="tag-pill">{project.status}</span>
                    </div>
                  </div>

                  {project.timeline && (
                    <p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#8c909f', marginBottom: '14px' }}>
                      Timeline: {project.timeline}
                    </p>
                  )}

                  <MarkdownView content={project.full_description || project.description} />

                  {project.required_skills?.length > 0 && (
                    <div style={{ marginTop: '18px' }}>
                      <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#adc6ff', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '10px' }}>
                        Required Skills
                      </p>
                      <div className="skills-row">
                        {project.required_skills.map((skill: string) => (
                          <span key={skill} className="skill-pill">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* ── Vault Section ── */}
                <section className="glass-panel" style={{ padding: 'clamp(16px, 3vw, 32px)', border: '1px dashed rgba(208,188,255,0.2)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'Syne', fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#dee1f7', margin: 0 }}>
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
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(14,19,34,0.6)', border: '1px solid rgba(208,188,255,0.2)', textDecoration: 'none', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
                            <span className="material-symbols-outlined" style={{ color: '#d0bcff', flexShrink: 0 }}>code</span>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontFamily: 'DM Mono', fontSize: '13px', color: '#dee1f7' }}>GitHub Repository</div>
                              <div style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.5)', textTransform: 'uppercase', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                                {project.github_repo.replace('https://github.com/', '')}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                            <span style={{
                              fontFamily: 'DM Mono', fontSize: '10px', color: '#d0bcff',
                              border: '1px solid rgba(208,188,255,0.3)', padding: '4px 10px',
                              textTransform: 'uppercase', letterSpacing: '0.08em',
                            }}>
                              Open Repo
                            </span>
                            <span className="material-symbols-outlined" style={{ color: '#d0bcff', fontSize: '18px' }}>open_in_new</span>
                          </div>
                        </a>
                      ) : null}

                      {vaultAssets.map((url: string, i: number) => {
                        const isImage = isImageAsset(url)
                        const isPdf = isPdfAsset(url)
                        return (
                          <div key={url + i} className="vault-file-row">
                            <div className="vault-file-info">
                              {isImage ? (
                                <img
                                  src={url}
                                  alt={displayFileName(url, i)}
                                  style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(208,188,255,0.25)', flexShrink: 0 }}
                                />
                              ) : (
                                <span className="material-symbols-outlined" style={{ color: 'rgba(208,188,255,0.5)', flexShrink: 0 }}>
                                  {isPdf ? 'picture_as_pdf' : 'description'}
                                </span>
                              )}
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#c2c6d6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {displayFileName(url, i)}
                                </div>
                                <div style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.5)', textTransform: 'uppercase', marginTop: '2px' }}>
                                  {isImage ? 'Image' : isPdf ? 'PDF Document' : 'File Attachment'}
                                </div>
                              </div>
                            </div>
                            <div className="vault-file-actions">
                              <a href={url} target="_blank" rel="noopener noreferrer"
                                style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#d0bcff', border: '1px solid rgba(208,188,255,0.3)', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>
                                {isImage ? 'View' : isPdf ? 'View PDF' : 'Open'}
                              </a>
                              <a href={url} target="_blank" rel="noopener noreferrer" download
                                style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.8)', border: '1px solid rgba(66,71,84,0.4)', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>
                                Download
                              </a>
                            </div>
                          </div>
                        )
                      })}

                      {!project.github_repo && vaultAssets.length === 0 && (
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
                        <p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#d0bcff', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
                          Join the team to unlock
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {/* ── Right Column ── */}
              <div className="right-col">

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
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
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#dee1f7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
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

                {isOwner && (
                  <DeleteProjectControl projectId={project.id} projectTitle={project.title} />
                )}

                {!isOwner && application?.status === 'accepted' && (
                  <LeaveProjectControl projectId={project.id} projectTitle={project.title} />
                )}

              </div>
            </div>
          </div>
        </main>

        <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', height: '1px', background: 'linear-gradient(to right, transparent, rgba(173,198,255,0.2), transparent)', zIndex: 50 }} />
      </div>
    </>
  )
}