'use client'

// File: app/profile/edit/page.tsx

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardNavbar from '@/components/DashboardNavbar'
import DashboardSidebar from '@/components/DashboardSidebar'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  id: string
  full_name: string
  department: string | null
  year: number | null
  bio: string | null
  skills: string[]
  github_url: string | null
  portfolio_url: string | null
  avatar_url: string | null
  score: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  'Computer Science',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biotechnology',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Data Science',
  'Artificial Intelligence',
]

const YEARS = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
]

function scoreColor(score: number) {
  if (score >= 600) return '#34d399'
  if (score >= 400) return '#fbbf24'
  return '#fb7185'
}

function scoreDashOffset(score: number) {
  return 283 - Math.min(score / 1000, 1) * 283
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Form state ──
  const [fullName, setFullName]         = useState('')
  const [department, setDepartment]     = useState('')
  const [year, setYear]                 = useState<number | ''>('')
  const [bio, setBio]                   = useState('')
  const [skills, setSkills]             = useState<string[]>([])
  const [githubUrl, setGithubUrl]       = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [avatarUrl, setAvatarUrl]       = useState<string | null>(null)
  const [score, setScore]               = useState(500)
  const [isPublic, setIsPublic]         = useState(true)
  const [notifications, setNotifications] = useState(true)

  // ── Skill input ──
  const [skillQuery, setSkillQuery]         = useState('')
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([])

  // ── UI state ──
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [error, setError]             = useState('')
  const [saved, setSaved]             = useState(false)
  const [unsaved, setUnsaved]         = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // ── Redirect if not authed ──
  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
  }, [status, router])

  // ── Fetch profile ──
  useEffect(() => {
    if (status !== 'authenticated') return
    async function fetchProfile() {
      try {
        const res = await fetch('/api/user/profile')
        if (!res.ok) throw new Error('Failed to fetch profile')
        const data = await res.json()
        const p: Profile = data.profile
        setFullName(p.full_name ?? '')
        setDepartment(p.department ?? '')
        setYear(p.year ?? '')
        setBio(p.bio ?? '')
        setSkills(p.skills ?? [])
        setGithubUrl(p.github_url ?? '')
        setPortfolioUrl(p.portfolio_url ?? '')
        setAvatarUrl(p.avatar_url ?? null)
        setScore(p.score ?? 500)
      } catch (e) {
        setError('Could not load your profile.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [status])

  // ── Mark unsaved on any change ──
  useEffect(() => {
    if (!loading) setUnsaved(true)
  }, [fullName, department, year, bio, skills, githubUrl, portfolioUrl, avatarUrl])

  // ── Skill autocomplete ──
  useEffect(() => {
    if (skillQuery.length < 1) { setSkillSuggestions([]); return }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/skills?q=${encodeURIComponent(skillQuery)}`)
      if (res.ok) {
        const data = await res.json()
        setSkillSuggestions((data.skills || []).filter((s: string) => !skills.includes(s)))
      }
    }, 300)
    return () => clearTimeout(t)
  }, [skillQuery, skills])

  function addSkill(skill: string) {
    if (!skills.includes(skill)) setSkills(prev => [...prev, skill])
    setSkillQuery('')
    setSkillSuggestions([])
  }

  function removeSkill(skill: string) {
    setSkills(prev => prev.filter(s => s !== skill))
  }

  // ── Avatar upload ──
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('files', file)
      formData.append('bucket', 'avatars')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      
      if (res.ok && data.urls?.[0]) {
        setAvatarUrl(data.urls[0])
      } else {
        setError(data.error || 'Failed to upload avatar. Please try again.')
        setAvatarPreview(null)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(`Avatar upload error: ${message}`)
      setAvatarPreview(null)
    } finally {
      setUploading(false)
    }
  }

  // ── Save ──
  async function handleSave() {
    if (saving) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name:     fullName.trim(),
          department:    department || null,
          year:          year || null,
          bio:           bio.trim() || null,
          skills,
          github_url:    githubUrl.trim() || null,
          portfolio_url: portfolioUrl.trim() || null,
          avatar_url:    avatarUrl,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to save')
        return
      }
      setSaved(true)
      setUnsaved(false)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Loading skeleton ──
  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0e1322' }}>
        <div style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#8c909f', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          Loading profile...
        </div>
      </div>
    )
  }

  const color = scoreColor(score)
  const dashOffset = scoreDashOffset(score)
  const displayAvatar = avatarPreview || avatarUrl

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style>{`
        body { font-family:'Manrope',sans-serif; background:#0e1322; color:#dee1f7; margin:0; }
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }
        .neon-primary { box-shadow:0 0 15px rgba(173,198,255,0.2),0 0 30px rgba(173,198,255,0.1); }
        .neon-secondary { box-shadow:0 0 15px rgba(107,216,203,0.2),0 0 30px rgba(107,216,203,0.1); }
        .neon-tertiary { box-shadow:0 0 15px rgba(208,188,255,0.2),0 0 30px rgba(208,188,255,0.1); }
        .custom-scrollbar::-webkit-scrollbar { width:4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background:#4d8eff; border-radius:10px; }
        .dotted-bg {
          background-image: radial-gradient(circle,rgba(77,142,255,0.08) 1px,transparent 1px);
          background-size: 24px 24px;
        }
        .input-underline {
          width:100%; background:rgba(22,27,43,0.6);
          border:none; border-bottom:2px solid rgba(66,71,84,0.4);
          color:#dee1f7; outline:none; padding:12px 16px;
          transition:border-color 0.2s;
        }
        .input-underline:focus { border-bottom-color:#adc6ff; }
        .input-box {
          width:100%; background:rgba(22,27,43,0.6);
          border:1px solid rgba(66,71,84,0.3);
          color:#dee1f7; outline:none; padding:10px 14px;
          transition:border-color 0.2s;
        }
        .input-box:focus { border-color:#adc6ff; }
        select.input-underline { appearance:none; cursor:pointer; }
        select.input-box { appearance:none; cursor:pointer; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .animate-pulse { animation:pulse 2s ease-in-out infinite; }
        .toggle-track {
          position:relative; width:48px; height:26px;
          background:rgba(66,71,84,0.4); border-radius:13px;
          display:inline-block; transition:background 0.2s; cursor:pointer;
        }
        .toggle-track.on { background:#4d8eff; }
        .toggle-thumb {
          position:absolute; top:3px; width:20px; height:20px;
          background:#fff; border-radius:50%; transition:left 0.2s;
        }
        .toggle-track.on .toggle-thumb { left:25px; }
        .toggle-track.off .toggle-thumb { left:3px; }
      `}</style>

      <div className="min-h-screen dotted-bg" style={{ background: '#0e1322' }}>

        {/* ── Fixed glow blobs ── */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full" style={{ background: 'rgba(173,198,255,0.04)', filter: 'blur(120px)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full" style={{ background: 'rgba(208,188,255,0.04)', filter: 'blur(150px)' }} />
        </div>

        <DashboardNavbar profile={{ user_id: session?.user?.id, full_name: fullName, avatar_url: displayAvatar }} />
        <DashboardSidebar profile={{ full_name: fullName, avatar_url: displayAvatar, score }} session={session} />

        {/* ── Main Content ── */}
        <main className="relative z-10 md:ml-64 pt-16 min-h-screen custom-scrollbar">
          <div className="max-w-4xl mx-auto py-12 px-8">

            {/* ── Page header ── */}
            <div className="flex justify-between items-end mb-10">
              <div>
                <h1 style={{ fontFamily:'Syne', fontSize:'clamp(28px,4vw,40px)', fontWeight:800, color:'#adc6ff', letterSpacing:'-0.04em', textTransform:'uppercase', marginBottom:'8px' }}>
                  Edit Neural Profile
                </h1>
                <p style={{ fontFamily:'DM Mono', fontSize:'12px', color:'rgba(194,198,214,0.7)' }}>
                  Configure your academic footprint across the Hub.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {saved && (
                  <div className="flex items-center gap-2 px-3 py-1 animate-pulse"
                    style={{ background:'rgba(107,216,203,0.08)', border:'1px solid rgba(107,216,203,0.2)', fontFamily:'DM Mono', fontSize:'10px', color:'#6bd8cb', borderRadius:'999px' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background:'#6bd8cb' }} />
                    CHANGES SAVED
                  </div>
                )}
                {unsaved && !saved && (
                  <div className="flex items-center gap-2 px-3 py-1"
                    style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', fontFamily:'DM Mono', fontSize:'10px', color:'#fbbf24', borderRadius:'999px' }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:'#fbbf24' }} />
                    UNSAVED CHANGES
                  </div>
                )}
                {!unsaved && !saved && (
                  <div className="flex items-center gap-2 px-3 py-1 animate-pulse"
                    style={{ background:'rgba(107,216,203,0.05)', border:'1px solid rgba(107,216,203,0.2)', fontFamily:'DM Mono', fontSize:'10px', color:'#6bd8cb', borderRadius:'999px' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background:'#6bd8cb' }} />
                    SYSTEM: READY FOR UPDATE
                  </div>
                )}
              </div>
            </div>

            {/* ── Glass card ── */}
            <div className="p-10 mb-20 space-y-12"
              style={{ background:'rgba(26,31,47,0.6)', backdropFilter:'blur(24px)', border:'1px solid rgba(66,71,84,0.15)', borderRadius:'16px', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.5)' }}>

              {/* ── Error banner ── */}
              {error && (
                <div className="flex items-center gap-3 px-4 py-3"
                  style={{ background:'rgba(251,113,133,0.08)', border:'1px solid rgba(251,113,133,0.2)' }}>
                  <span className="material-symbols-outlined" style={{ color:'#fb7185', fontSize:'18px' }}>error</span>
                  <p style={{ fontFamily:'DM Mono', fontSize:'12px', color:'#fb7185' }}>{error}</p>
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────── */}
              {/* Section 1 — Profile Identity                                */}
              {/* ──────────────────────────────────────────────────────────── */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined" style={{ color:'#adc6ff' }}>account_circle</span>
                  <h2 style={{ fontFamily:'Syne', fontSize:'18px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'#dee1f7' }}>
                    Profile Identity
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">

                  {/* Avatar */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-32 h-32">
                      {/* Score ring */}
                      <svg className="absolute inset-0 w-full h-full" style={{ transform:'rotate(-90deg)' }}>
                        <circle cx="50%" cy="50%" r="45%" fill="none" stroke="rgba(47,52,69,0.6)" strokeWidth="4" />
                        <circle cx="50%" cy="50%" r="45%" fill="none"
                          stroke={color} strokeWidth="4"
                          strokeDasharray="283" strokeDashoffset={dashOffset}
                          style={{ filter:`drop-shadow(0 0 5px ${color}80)`, transition:'stroke-dashoffset 1s ease' }} />
                      </svg>
                      {/* Avatar image */}
                      <div className="absolute inset-2 rounded-full overflow-hidden"
                        style={{ border:'1px solid rgba(66,71,84,0.4)' }}>
                        {displayAvatar ? (
                          <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background:'#25293a' }}>
                            <span className="material-symbols-outlined" style={{ fontSize:'40px', color:'#adc6ff' }}>person</span>
                          </div>
                        )}
                      </div>
                      {/* Edit button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute bottom-0 right-0 p-2 rounded-full transition-transform hover:scale-110"
                        style={{ background:'#4d8eff', color:'#002e6a', boxShadow:'0 0 10px rgba(77,142,255,0.4)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>
                          {uploading ? 'hourglass_empty' : 'edit'}
                        </span>
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>
                    <div className="text-center">
                      <span style={{ fontFamily:'DM Mono', fontSize:'10px', color:'rgba(194,198,214,0.5)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                        Score: {score}
                      </span>
                    </div>
                  </div>

                  {/* Name, dept, year */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="space-y-1">
                      <label style={{ fontFamily:'DM Mono', fontSize:'10px', textTransform:'uppercase', color:'rgba(194,198,214,0.5)', display:'block', marginLeft:'4px' }}>
                        Full Name <span style={{ color:'#fb7185' }}>*</span>
                      </label>
                      <input
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="input-underline neon-primary"
                        style={{ fontFamily:'Space Grotesk', fontSize:'20px', fontWeight:700, letterSpacing:'-0.02em' }}
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label style={{ fontFamily:'DM Mono', fontSize:'10px', textTransform:'uppercase', color:'rgba(194,198,214,0.5)', display:'block', marginLeft:'4px' }}>
                          Department
                        </label>
                        <div className="relative">
                          <select
                            value={department}
                            onChange={e => setDepartment(e.target.value)}
                            className="input-underline"
                            style={{ fontFamily:'Manrope', paddingRight:'36px' }}>
                            <option value="">Select...</option>
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ fontSize:'18px', color:'#8c909f' }}>expand_more</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label style={{ fontFamily:'DM Mono', fontSize:'10px', textTransform:'uppercase', color:'rgba(194,198,214,0.5)', display:'block', marginLeft:'4px' }}>
                          Academic Year
                        </label>
                        <div className="relative">
                          <select
                            value={year}
                            onChange={e => setYear(Number(e.target.value))}
                            className="input-underline"
                            style={{ fontFamily:'Manrope', paddingRight:'36px' }}>
                            <option value="">Select...</option>
                            {YEARS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                          </select>
                          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ fontSize:'18px', color:'#8c909f' }}>expand_more</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div style={{ borderTop:'1px solid rgba(66,71,84,0.15)' }} />

              {/* ──────────────────────────────────────────────────────────── */}
              {/* Section 2 — Bio / Scriptorium                               */}
              {/* ──────────────────────────────────────────────────────────── */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined" style={{ color:'#adc6ff' }}>history_edu</span>
                  <h2 style={{ fontFamily:'Syne', fontSize:'18px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'#dee1f7' }}>
                    The Scriptorium
                    <span style={{ fontFamily:'DM Mono', fontSize:'11px', fontWeight:400, color:'#8c909f', marginLeft:'8px' }}>(Bio)</span>
                  </h2>
                </div>

                <div className="relative">
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value.slice(0, 500))}
                    rows={4}
                    placeholder="Input research focus and personal trajectory..."
                    className="input-box custom-scrollbar"
                    style={{ fontFamily:'Space Grotesk', fontSize:'14px', lineHeight:1.7, resize:'none', borderRadius:'4px', width:'100%', boxSizing:'border-box' }}
                  />
                  <div className="absolute bottom-3 right-4"
                    style={{ fontFamily:'DM Mono', fontSize:'10px', color: bio.length > 450 ? '#fbbf24' : 'rgba(194,198,214,0.4)' }}>
                    {bio.length} / 500
                  </div>
                </div>
              </section>

              <div style={{ borderTop:'1px solid rgba(66,71,84,0.15)' }} />

              {/* ──────────────────────────────────────────────────────────── */}
              {/* Section 3 — Skills / Neural Matrix                          */}
              {/* ──────────────────────────────────────────────────────────── */}
              <section id="skills">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined" style={{ color:'#adc6ff' }}>psychology</span>
                  <h2 style={{ fontFamily:'Syne', fontSize:'18px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'#dee1f7' }}>
                    Neural Matrix
                    <span style={{ fontFamily:'DM Mono', fontSize:'11px', fontWeight:400, color:'#8c909f', marginLeft:'8px' }}>(Skills)</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Search input */}
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2" style={{ color:'#8c909f', fontSize:'18px' }}>search</span>
                    <input
                      value={skillQuery}
                      onChange={e => setSkillQuery(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && skillQuery.trim()) { e.preventDefault(); addSkill(skillQuery.trim()) } }}
                      placeholder="Search and add skills... (Enter to add)"
                      className="input-box"
                      style={{ paddingLeft:'44px', borderRadius:'999px', fontFamily:'Manrope' }}
                    />
                    {/* Suggestions */}
                    {skillSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-20 overflow-hidden"
                        style={{ background:'#1a1f2f', border:'1px solid rgba(66,71,84,0.3)', borderRadius:'8px' }}>
                        {skillSuggestions.slice(0, 6).map(s => (
                          <button key={s} onClick={() => addSkill(s)}
                            className="w-full text-left px-4 py-2.5 hover:bg-[#25293a] transition-colors"
                            style={{ fontFamily:'DM Mono', fontSize:'11px', color:'#dee1f7', display:'block' }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Skill chips */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {skills.map(skill => (
                        <div key={skill}
                          className="flex items-center gap-2 px-3 py-1.5 neon-tertiary"
                          style={{
                            background:'rgba(208,188,255,0.08)',
                            border:'1px solid rgba(208,188,255,0.25)',
                            color:'#d0bcff',
                            borderRadius:'999px',
                            fontFamily:'DM Mono', fontSize:'11px',
                          }}>
                          <span>{skill}</span>
                          <button onClick={() => removeSkill(skill)}
                            style={{ cursor:'pointer', lineHeight:1, background:'none', border:'none', padding:0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize:'14px', color:'rgba(208,188,255,0.5)' }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#fb7185')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(208,188,255,0.5)')}>
                              close
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {skills.length === 0 && (
                    <p style={{ fontFamily:'DM Mono', fontSize:'11px', color:'rgba(194,198,214,0.4)' }}>
                      Type a skill and press Enter to add it
                    </p>
                  )}
                </div>
              </section>

              <div style={{ borderTop:'1px solid rgba(66,71,84,0.15)' }} />

              {/* ──────────────────────────────────────────────────────────── */}
              {/* Section 4 — System Sync / Connections                       */}
              {/* ──────────────────────────────────────────────────────────── */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined" style={{ color:'#adc6ff' }}>sync_alt</span>
                  <h2 style={{ fontFamily:'Syne', fontSize:'18px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'#dee1f7' }}>
                    System Sync
                    <span style={{ fontFamily:'DM Mono', fontSize:'11px', fontWeight:400, color:'#8c909f', marginLeft:'8px' }}>(Connections)</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* GitHub */}
                  <div className="space-y-2">
                    <label style={{ fontFamily:'DM Mono', fontSize:'10px', textTransform:'uppercase', color:'rgba(194,198,214,0.5)', display:'block' }}>
                      GitHub Node
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={githubUrl}
                        onChange={e => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                        className="input-box"
                        style={{ flex:1, fontFamily:'DM Mono', fontSize:'12px' }}
                      />
                      <button
                        className="px-4 transition-colors hover:bg-[#29a195]/30"
                        style={{ background:'rgba(107,216,203,0.08)', border:'1px solid rgba(107,216,203,0.3)', color:'#6bd8cb', fontFamily:'DM Mono', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.1em', whiteSpace:'nowrap' }}>
                        Verify
                      </button>
                    </div>
                    {githubUrl && !githubUrl.startsWith('https://github.com') && (
                      <p style={{ fontFamily:'DM Mono', fontSize:'10px', color:'#fbbf24', marginTop:'4px' }}>
                        Should start with https://github.com/
                      </p>
                    )}
                  </div>

                  {/* Portfolio */}
                  <div className="space-y-2">
                    <label style={{ fontFamily:'DM Mono', fontSize:'10px', textTransform:'uppercase', color:'rgba(194,198,214,0.5)', display:'block' }}>
                      Portfolio Matrix
                    </label>
                    <input
                      value={portfolioUrl}
                      onChange={e => setPortfolioUrl(e.target.value)}
                      placeholder="https://yourportfolio.com"
                      className="input-box"
                      style={{ fontFamily:'DM Mono', fontSize:'12px' }}
                    />
                  </div>
                </div>
              </section>

              <div style={{ borderTop:'1px solid rgba(66,71,84,0.15)' }} />

              {/* ──────────────────────────────────────────────────────────── */}
              {/* Section 5 — Security & Privacy                              */}
              {/* ──────────────────────────────────────────────────────────── */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined" style={{ color:'#adc6ff' }}>shield</span>
                  <h2 style={{ fontFamily:'Syne', fontSize:'18px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'#dee1f7' }}>
                    Security & Privacy
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Public visibility */}
                  <div className="flex items-center justify-between p-4"
                    style={{ background:'rgba(37,41,58,0.4)', border:'1px solid rgba(66,71,84,0.15)', borderRadius:'8px' }}>
                    <div>
                      <p style={{ fontSize:'14px', fontFamily:'Space Grotesk', fontWeight:500, color:'#dee1f7', marginBottom:'2px' }}>Public Visibility</p>
                      <p style={{ fontFamily:'DM Mono', fontSize:'10px', color:'rgba(194,198,214,0.5)' }}>Broadcast identity to the Global Hub</p>
                    </div>
                    <div className={`toggle-track ${isPublic ? 'on' : 'off'}`} onClick={() => setIsPublic(p => !p)}>
                      <div className="toggle-thumb" />
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="flex items-center justify-between p-4"
                    style={{ background:'rgba(37,41,58,0.4)', border:'1px solid rgba(66,71,84,0.15)', borderRadius:'8px' }}>
                    <div>
                      <p style={{ fontSize:'14px', fontFamily:'Space Grotesk', fontWeight:500, color:'#dee1f7', marginBottom:'2px' }}>Neural Notifications</p>
                      <p style={{ fontFamily:'DM Mono', fontSize:'10px', color:'rgba(194,198,214,0.5)' }}>Real-time alert sync for results</p>
                    </div>
                    <div className={`toggle-track ${notifications ? 'on' : 'off'}`} onClick={() => setNotifications(n => !n)}>
                      <div className="toggle-thumb" />
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Footer Actions ── */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8"
                style={{ borderTop:'1px solid rgba(66,71,84,0.2)' }}>
                <Link href="/dashboard">
                  <button className="px-8 py-3 transition-all hover:bg-[#25293a]"
                    style={{ border:'1px solid rgba(66,71,84,0.4)', color:'rgba(194,198,214,0.7)', fontFamily:'DM Mono', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.15em', background:'transparent', cursor:'pointer' }}>
                    Discard
                  </button>
                </Link>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-10 py-3 transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: saving ? 'rgba(77,142,255,0.4)' : '#4d8eff',
                    color: '#002e6a',
                    fontFamily: 'DM Mono', fontSize:'12px', fontWeight:700,
                    textTransform:'uppercase', letterSpacing:'0.15em',
                    boxShadow: saving ? 'none' : '0 0 20px rgba(77,142,255,0.4)',
                    cursor: saving ? 'wait' : 'pointer', border:'none',
                  }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* ── Status bar (bottom right) ── */}
        <footer className="fixed bottom-0 right-0 p-4 z-50 pointer-events-none">
          <div className="flex items-center gap-4 px-4 py-2"
            style={{ background:'rgba(14,19,34,0.8)', backdropFilter:'blur(12px)', border:'1px solid rgba(66,71,84,0.2)', borderRadius:'8px' }}>
            <div className="flex flex-col">
              <span style={{ fontFamily:'DM Mono', fontSize:'8px', color:'rgba(194,198,214,0.5)', textTransform:'uppercase' }}>Core_Temp</span>
              <span style={{ fontFamily:'DM Mono', fontSize:'10px', color:'#6bd8cb' }}>32.4°C</span>
            </div>
            <div style={{ width:'1px', height:'24px', background:'rgba(66,71,84,0.3)' }} />
            <div className="flex flex-col">
              <span style={{ fontFamily:'DM Mono', fontSize:'8px', color:'rgba(194,198,214,0.5)', textTransform:'uppercase' }}>Latency</span>
              <span style={{ fontFamily:'DM Mono', fontSize:'10px', color:'#adc6ff' }}>12ms</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}