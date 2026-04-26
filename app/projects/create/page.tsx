'use client'

// File: app/projects/create/page.tsx

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import DashboardNavbar from '@/components/DashboardNavbar'
import DashboardSidebar from '@/components/DashboardSidebar'
import { MarkdownView } from '@/components/MarkdownView'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Skill {
  skill: string
  weight: number
}

interface PreviewData {
  title: string
  description: string
  required_skills: string[]
  slots: number
  github_repo: string
}

// ─── ScoreBadge (inline, no import needed) ────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 600) return '#34d399'
  if (score >= 400) return '#fbbf24'
  return '#fb7185'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateProjectPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const fullDetailsRef = useRef<HTMLTextAreaElement | null>(null)

  // ── Form State ──
  const [title, setTitle] = useState('')
  const [shortDesc, setShortDesc] = useState('')
  const [fullDesc, setFullDesc] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [skillQuery, setSkillQuery] = useState('')
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([])
  const [slots, setSlots] = useState(4)
  const [githubRepo, setGithubRepo] = useState('')
  const [techStack, setTechStack] = useState('')
  const [timeline, setTimeline] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write')

  // ── UI State ──
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [autoSavedAt, setAutoSavedAt] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [userProfile, setUserProfile] = useState<{ user_id: string; full_name: string; score: number; avatar_url: string | null } | null>(null)
  const [atProjectLimit, setAtProjectLimit] = useState(false)

  // ── Auto-save timestamp ──
  useEffect(() => {
    if (!title && !shortDesc) return
    const t = setTimeout(() => {
      const now = new Date()
      setAutoSavedAt(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }, 2000)
    return () => clearTimeout(t)
  }, [title, shortDesc, fullDesc, selectedSkills, slots])

  // ── Fetch user profile + project limit check ──
  useEffect(() => {
    if (!session?.user?.id) return
    async function fetchProfile() {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        setUserProfile(data.profile)
        setAtProjectLimit(data.activeProjectCount >= 2)
      }
    }
    fetchProfile()
  }, [session])

  // ── Skill autocomplete ──
  useEffect(() => {
    if (skillQuery.length < 1) { setSkillSuggestions([]); return }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/skills?q=${encodeURIComponent(skillQuery)}`)
      if (res.ok) {
        const data = await res.json()
        setSkillSuggestions((data.skills || []).filter((s: string) => !selectedSkills.includes(s)))
      }
    }, 300)
    return () => clearTimeout(t)
  }, [skillQuery, selectedSkills])

  function addSkill(skill: string) {
    if (!selectedSkills.includes(skill)) setSelectedSkills(prev => [...prev, skill])
    setSkillQuery('')
    setSkillSuggestions([])
  }

  function removeSkill(skill: string) {
    setSelectedSkills(prev => prev.filter(s => s !== skill))
  }

  function insertMarkdown(before: string, after = '', placeholder = '') {
    const editor = fullDetailsRef.current
    if (!editor || atProjectLimit) return

    const start = editor.selectionStart ?? fullDesc.length
    const end = editor.selectionEnd ?? fullDesc.length
    const selectedText = fullDesc.slice(start, end) || placeholder
    const nextValue = `${fullDesc.slice(0, start)}${before}${selectedText}${after}${fullDesc.slice(end)}`

    setFullDesc(nextValue)

    requestAnimationFrame(() => {
      editor.focus()
      editor.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    })
  }

  function insertLinePrefix(prefix: string) {
    const editor = fullDetailsRef.current
    if (!editor || atProjectLimit) return

    const start = editor.selectionStart ?? 0
    const end = editor.selectionEnd ?? 0
    const value = fullDesc
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const lineEnd = value.indexOf('\n', end)
    const resolvedLineEnd = lineEnd === -1 ? value.length : lineEnd
    const line = value.slice(lineStart, resolvedLineEnd)
    const nextValue = `${value.slice(0, lineStart)}${prefix}${line}${value.slice(resolvedLineEnd)}`

    setFullDesc(nextValue)

    requestAnimationFrame(() => {
      editor.focus()
      editor.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length + line.length)
    })
  }

  // ── File drop ──
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const files = Array.from(e.dataTransfer.files).slice(0, 5)
    setUploadedFiles(prev => [...prev, ...files].slice(0, 5))
  }, [])

  // ── Validation ──
  const isValid = title.trim().length > 0 && selectedSkills.length > 0 && slots >= 1

  // ── Submit ──
  async function handleSubmit() {
    if (!isValid || loading || atProjectLimit) return
    setLoading(true); setError('')

    try {
      // Upload files first if any
      let fileUrls: string[] = []
      if (uploadedFiles.length > 0) {
        const formData = new FormData()
        uploadedFiles.forEach(f => formData.append('files', f))
        formData.append('bucket', 'project-files')
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        const uploadData = await uploadRes.json()
        
        if (uploadRes.ok && uploadData.urls?.length > 0) {
          fileUrls = uploadData.urls
          if (uploadData.errors?.length > 0) {
            setError(`Some files failed to upload: ${uploadData.errors.join(', ')}. Continuing with uploaded files.`)
          }
        } else {
          // File upload failed completely
          setError(uploadData.error || 'Failed to upload files. Please try again.')
          setLoading(false)
          return
        }
      }

      const body = {
        title: title.trim(),
        description: shortDesc.trim(),
        full_description: fullDesc.trim(),
        required_skills: selectedSkills,
        slots,
        github_repo: githubRepo.trim() || null,
        tech_stack: techStack.trim() ? techStack.split(',').map(s => s.trim()).filter(Boolean) : [],
        timeline: timeline.trim() || null,
        visibility,
        file_urls: fileUrls,
        status: 'open',
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create project')
        return
      }

      const data = await res.json()
      router.push(`/projects/${data.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(`Something went wrong: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  // ── Live preview ──
  const preview: PreviewData = {
    title: title || '[Project_Title]',
    description: shortDesc || 'Project summary will materialize as you input the short description.',
    required_skills: selectedSkills,
    slots,
    github_repo: githubRepo,
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <style>{`
        body { font-family: 'Manrope', sans-serif; background-color: #0e1322; color: #dee1f7; margin: 0; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-panel { background: rgba(26,31,47,0.7); backdrop-filter: blur(16px); }
        .ghost-border { border: 1px solid rgba(66,71,84,0.15); }
        .neon-glow-primary { box-shadow: 0 0 40px -10px rgba(173,198,255,0.15); }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(77,142,255,0.05) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4d8eff; border-radius: 10px; }
        .input-underline {
          background: transparent;
          border: none;
          border-bottom: 2px solid rgba(66,71,84,0.3);
          outline: none;
          color: #dee1f7;
          transition: border-color 0.2s;
          width: 100%;
          padding: 8px 0;
        }
        .input-underline:focus { border-bottom-color: #adc6ff; }
        .input-box {
          background: rgba(14,19,34,0.6);
          border: 1px solid rgba(66,71,84,0.3);
          outline: none;
          color: #dee1f7;
          transition: border-color 0.2s;
          width: 100%;
          padding: 10px 14px;
        }
        .input-box:focus { border-color: #adc6ff; }
        textarea.input-box { resize: none; font-family: 'DM Mono', monospace; font-size: 13px; line-height: 1.7; }
        @keyframes ping { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.5)} }
        .animate-ping { animation: ping 2s ease-in-out infinite; }
        .card-preview-hover { transition: all 0.3s; }
        .card-preview-hover:hover { box-shadow: 0 0 60px -10px rgba(173,198,255,0.25); }
      `}</style>

      <div className="bg-[#0e1322] min-h-screen dot-grid overflow-x-hidden">

        {/* ── Top Nav ── */}
        <DashboardNavbar profile={userProfile} />

        <div className="flex pt-[60px] min-h-screen">

          {/* ── Sidebar ── */}
          <DashboardSidebar profile={userProfile} session={session} />

          {/* ── Main Content ── */}
          <main className="md:ml-64 w-full p-6 lg:p-10 overflow-y-auto custom-scrollbar">
            <div className="max-w-6xl mx-auto flex flex-col xl:flex-row gap-10">

              {/* ── Left Column: Form ── */}
              <div className="flex-1 space-y-10">

                {/* Header */}
                <header className="mb-6">
                  <div className="flex justify-between items-end mb-4">
                    <h1 style={{
                      fontFamily: 'Syne', fontSize: 'clamp(36px,5vw,60px)',
                      fontWeight: 800, color: '#adc6ff', letterSpacing: '-0.04em',
                      textTransform: 'uppercase',
                      textShadow: '0 0 40px rgba(173,198,255,0.2)',
                      lineHeight: 1,
                    }}>
                      New_Experiment
                    </h1>
                  </div>
                  <div style={{ height: '3px', width: '120px', background: 'linear-gradient(to right, #adc6ff, #6bd8cb, transparent)' }} />
                </header>

                {/* ── 2-Project Limit Banner ── */}
                {atProjectLimit && (
                  <div className="flex items-center gap-3 px-5 py-4 rounded-xl"
                    style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)' }}>
                    <span className="material-symbols-outlined" style={{ color: '#fb923c', fontSize: '22px' }}>warning</span>
                    <div>
                      <p style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#fb923c', fontWeight: 700 }}>
                        Project limit reached
                      </p>
                      <p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'rgba(251,146,60,0.7)', marginTop: '2px' }}>
                        You are in 2 active projects. Complete one before creating more.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Section 1: The Hook ── */}
                <section className="glass-panel ghost-border p-8 space-y-8">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined" style={{ color: '#6bd8cb' }}>auto_awesome</span>
                    <h3 style={{ fontFamily: 'DM Mono', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#6bd8cb' }}>
                      01. The Hook
                    </h3>
                  </div>

                  {/* Title */}
                  <div className="relative">
                    <label style={{ display: 'block', fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(173,198,255,0.7)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>
                      Project Title <span style={{ color: '#fb7185' }}>*</span>
                    </label>
                    <input
                      value={title}
                      onChange={e => setTitle(e.target.value.slice(0, 80))}
                      placeholder="e.g., NEURAL-LINK V2"
                      maxLength={80}
                      disabled={atProjectLimit}
                      className="input-underline"
                      style={{ fontFamily: 'Syne', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', opacity: atProjectLimit ? 0.4 : 1 }}
                    />
                    <span style={{ position: 'absolute', right: 0, bottom: '10px', fontFamily: 'DM Mono', fontSize: '10px', color: title.length > 70 ? '#fbbf24' : 'rgba(194,198,214,0.4)' }}>
                      {title.length} / 80
                    </span>
                  </div>

                  {/* Short Description */}
                  <div className="relative">
                    <label style={{ display: 'block', fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(173,198,255,0.7)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>
                      Short Description <span style={{ color: '#8c909f' }}>(the hook)</span> <span style={{ color: '#fb7185' }}>*</span>
                    </label>
                    <textarea
                      value={shortDesc}
                      onChange={e => setShortDesc(e.target.value.slice(0, 160))}
                      placeholder="Define the core mission of this protocol..."
                      rows={2}
                      maxLength={160}
                      disabled={atProjectLimit}
                      className="input-underline"
                      style={{ resize: 'none', fontFamily: 'Manrope', fontSize: '15px', lineHeight: 1.6, opacity: atProjectLimit ? 0.4 : 1 }}
                    />
                    <span style={{ position: 'absolute', right: 0, bottom: '10px', fontFamily: 'DM Mono', fontSize: '10px', color: shortDesc.length > 140 ? '#fbbf24' : 'rgba(194,198,214,0.4)' }}>
                      {shortDesc.length} / 160
                    </span>
                  </div>
                </section>

                {/* ── Section 2: Requirements ── */}
                <section className="glass-panel ghost-border p-8 space-y-8">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined" style={{ color: '#6bd8cb' }}>groups</span>
                    <h3 style={{ fontFamily: 'DM Mono', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#6bd8cb' }}>
                      02. Requirements
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Skill Matrix */}
                    <div className="space-y-4">
                      <label style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(173,198,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>
                        Skill Matrix <span style={{ color: '#fb7185' }}>*</span>
                      </label>
                      <div style={{ background: 'rgba(14,19,34,0.6)', border: '1px solid rgba(66,71,84,0.3)', padding: '16px' }} className="space-y-4">
                        {/* Selected chips */}
                        {selectedSkills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {selectedSkills.map(skill => (
                              <span key={skill}
                                className="flex items-center gap-2"
                                style={{
                                  background: 'rgba(107,216,203,0.08)',
                                  color: '#6bd8cb',
                                  border: '1px solid rgba(107,216,203,0.25)',
                                  padding: '4px 10px',
                                  fontSize: '10px',
                                  fontFamily: 'DM Mono',
                                  textTransform: 'uppercase',
                                  fontWeight: 700,
                                }}>
                                {skill}
                                <button onClick={() => removeSkill(skill)}
                                  style={{ cursor: 'pointer', lineHeight: 1 }}>
                                  <span className="material-symbols-outlined hover:text-white transition-colors"
                                    style={{ fontSize: '14px', color: 'rgba(107,216,203,0.6)' }}>close</span>
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Search input */}
                        <div className="relative">
                          <span className="material-symbols-outlined"
                            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'rgba(140,144,159,0.5)' }}>
                            search
                          </span>
                          <input
                            value={skillQuery}
                            onChange={e => setSkillQuery(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && skillQuery.trim()) {
                                e.preventDefault()
                                addSkill(skillQuery.trim())
                              }
                            }}
                            placeholder="Search parameters..."
                            disabled={atProjectLimit}
                            style={{
                              width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px',
                              background: 'rgba(26,31,47,0.8)', border: '1px solid rgba(66,71,84,0.3)',
                              color: '#dee1f7', fontSize: '12px', fontFamily: 'DM Mono', outline: 'none',
                            }}
                          />
                          {/* Suggestions dropdown */}
                          {skillSuggestions.length > 0 && (
                            <div style={{
                              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
                              background: '#1a1f2f', border: '1px solid rgba(66,71,84,0.3)',
                            }}>
                              {skillSuggestions.slice(0, 6).map(s => (
                                <button key={s} onClick={() => addSkill(s)}
                                  className="w-full text-left hover:bg-[#25293a] transition-colors"
                                  style={{ padding: '8px 14px', fontFamily: 'DM Mono', fontSize: '11px', color: '#dee1f7', display: 'block' }}>
                                  {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {selectedSkills.length === 0 && (
                          <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.4)' }}>
                            Type a skill and press Enter to add
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Vacancies counter */}
                    <div className="space-y-4">
                      <label style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(173,198,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>
                        Vacancies <span style={{ color: '#8c909f' }}>(1–10)</span>
                      </label>
                      <div className="flex items-center justify-between px-6 py-4"
                        style={{ background: 'rgba(14,19,34,0.6)', border: '1px solid rgba(66,71,84,0.3)' }}>
                        <button
                          onClick={() => setSlots(s => Math.max(1, s - 1))}
                          disabled={slots <= 1 || atProjectLimit}
                          className="flex items-center justify-center hover:border-[#adc6ff] hover:text-[#adc6ff] transition-all disabled:opacity-30"
                          style={{ width: '40px', height: '40px', background: 'rgba(26,31,47,0.8)', border: '1px solid rgba(66,71,84,0.3)' }}>
                          <span className="material-symbols-outlined">remove</span>
                        </button>
                        <span style={{ fontFamily: 'Syne', fontSize: '48px', fontWeight: 800, color: '#adc6ff', lineHeight: 1 }}>
                          {String(slots).padStart(2, '0')}
                        </span>
                        <button
                          onClick={() => setSlots(s => Math.min(10, s + 1))}
                          disabled={slots >= 10 || atProjectLimit}
                          className="flex items-center justify-center hover:border-[#adc6ff] hover:text-[#adc6ff] transition-all disabled:opacity-30"
                          style={{ width: '40px', height: '40px', background: 'rgba(26,31,47,0.8)', border: '1px solid rgba(66,71,84,0.3)' }}>
                          <span className="material-symbols-outlined">add</span>
                        </button>
                      </div>

                      {/* Tech Stack (bonus field) */}
                      <div className="mt-6">
                        <label style={{ display: 'block', fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(173,198,255,0.7)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>
                          Tech Stack <span style={{ color: '#8c909f' }}>(optional, comma-separated)</span>
                        </label>
                        <input
                          value={techStack}
                          onChange={e => setTechStack(e.target.value)}
                          placeholder="e.g. Next.js, Supabase, Python"
                          disabled={atProjectLimit}
                          className="input-box"
                          style={{ fontSize: '12px', fontFamily: 'DM Mono', opacity: atProjectLimit ? 0.4 : 1 }}
                        />
                      </div>

                      {/* Timeline */}
                      <div>
                        <label style={{ display: 'block', fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(173,198,255,0.7)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>
                          Timeline <span style={{ color: '#8c909f' }}>(optional)</span>
                        </label>
                        <input
                          value={timeline}
                          onChange={e => setTimeline(e.target.value)}
                          placeholder="e.g. 8 weeks, By May 2026"
                          disabled={atProjectLimit}
                          className="input-box"
                          style={{ fontSize: '12px', fontFamily: 'DM Mono', opacity: atProjectLimit ? 0.4 : 1 }}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── Section 3: Full Details ── */}
                <section className="glass-panel ghost-border p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined" style={{ color: '#6bd8cb' }}>article</span>
                      <h3 style={{ fontFamily: 'DM Mono', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#6bd8cb' }}>
                        03. Full Details
                      </h3>
                    </div>
                    {/* Write / Preview tabs */}
                    <div className="flex" style={{ background: 'rgba(14,19,34,0.6)', border: '1px solid rgba(66,71,84,0.3)', padding: '4px' }}>
                      {(['write', 'preview'] as const).map(tab => (
                        <button key={tab} onClick={() => setEditorTab(tab)}
                          style={{
                            padding: '4px 16px', fontSize: '10px', fontFamily: 'DM Mono', textTransform: 'uppercase',
                            background: editorTab === tab ? 'rgba(173,198,255,0.15)' : 'transparent',
                            color: editorTab === tab ? '#adc6ff' : 'rgba(140,144,159,0.5)',
                            border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                          }}>
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ border: '1px solid rgba(66,71,84,0.3)', overflow: 'hidden' }}>
                    {/* Toolbar */}
                    <div className="flex gap-4 p-3" style={{ background: 'rgba(26,31,47,0.6)', borderBottom: '1px solid rgba(66,71,84,0.2)' }}>
                      <button type="button" onClick={() => insertMarkdown('**', '**', 'bold text')} disabled={atProjectLimit} title="Bold" className="material-symbols-outlined hover:text-[#adc6ff] transition-colors cursor-pointer" style={{ fontSize: '18px', color: 'rgba(140,144,159,0.7)', background: 'none', border: 'none' }}>
                        format_bold
                      </button>
                      <button type="button" onClick={() => insertMarkdown('*', '*', 'italic text')} disabled={atProjectLimit} title="Italic" className="material-symbols-outlined hover:text-[#adc6ff] transition-colors cursor-pointer" style={{ fontSize: '18px', color: 'rgba(140,144,159,0.7)', background: 'none', border: 'none' }}>
                        format_italic
                      </button>
                      <button type="button" onClick={() => insertMarkdown('[', '](https://example.com)', 'link text')} disabled={atProjectLimit} title="Link" className="material-symbols-outlined hover:text-[#adc6ff] transition-colors cursor-pointer" style={{ fontSize: '18px', color: 'rgba(140,144,159,0.7)', background: 'none', border: 'none' }}>
                        link
                      </button>
                      <button type="button" onClick={() => insertMarkdown('![', '](https://example.com/image.png)', 'image alt')} disabled={atProjectLimit} title="Image" className="material-symbols-outlined hover:text-[#adc6ff] transition-colors cursor-pointer" style={{ fontSize: '18px', color: 'rgba(140,144,159,0.7)', background: 'none', border: 'none' }}>
                        image
                      </button>
                      <span style={{ display: 'inline-block', width: '1px', height: '16px', background: 'rgba(66,71,84,0.5)', margin: '0 4px', verticalAlign: 'middle' }} />
                      <button type="button" onClick={() => insertLinePrefix('## ')} disabled={atProjectLimit} title="Heading 2" className="material-symbols-outlined hover:text-[#adc6ff] transition-colors cursor-pointer" style={{ fontSize: '18px', color: 'rgba(140,144,159,0.7)', background: 'none', border: 'none' }}>
                        title
                      </button>
                      <button type="button" onClick={() => insertLinePrefix('- ')} disabled={atProjectLimit} title="Bullet list" className="material-symbols-outlined hover:text-[#adc6ff] transition-colors cursor-pointer" style={{ fontSize: '18px', color: 'rgba(140,144,159,0.7)', background: 'none', border: 'none' }}>
                        format_list_bulleted
                      </button>
                      <button type="button" onClick={() => insertMarkdown('`', '`', 'inline code')} disabled={atProjectLimit} title="Inline code" className="material-symbols-outlined hover:text-[#adc6ff] transition-colors cursor-pointer" style={{ fontSize: '18px', color: 'rgba(140,144,159,0.7)', background: 'none', border: 'none' }}>
                        terminal
                      </button>
                    </div>

                    {editorTab === 'write' ? (
                      <textarea
                        value={fullDesc}
                        ref={fullDetailsRef}
                        onChange={e => setFullDesc(e.target.value)}
                        placeholder={`Initialize deep-dive documentation...

## Overview

Describe your project in full detail. Supports **markdown**.

## What we're building

- The problem we solve
- What we are building

## Who we need

Add headings like ## this, bold text, links, and lists.`}
                        rows={10}
                        disabled={atProjectLimit}
                        style={{
                          width: '100%', background: 'rgba(14,19,34,0.4)', border: 'none', outline: 'none',
                          color: '#dee1f7', fontFamily: 'DM Mono', fontSize: '13px',
                          padding: '24px', lineHeight: 1.7, resize: 'none',
                          boxSizing: 'border-box', opacity: atProjectLimit ? 0.4 : 1,
                        }}
                      />
                    ) : (
                      <div style={{ minHeight: '200px', padding: '24px', background: 'rgba(14,19,34,0.4)', color: '#c2c6d6', fontSize: '14px', lineHeight: 1.8 }}>
                        {fullDesc.trim() ? (
                          <MarkdownView content={fullDesc} />
                        ) : (
                          <p style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#424754' }}>Nothing to preview yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                {/* ── Section 4: The Vault ── */}
                <section className="glass-panel ghost-border p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined" style={{ color: '#d0bcff' }}>lock</span>
                    <h3 style={{ fontFamily: 'DM Mono', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#d0bcff' }}>
                      04. The Vault{' '}
                      <span style={{ fontSize: '10px', opacity: 0.6, marginLeft: '8px' }}>(PRIVATE)</span>
                    </h3>
                  </div>

                  {/* GitHub Repo */}
                  <div className="relative">
                    <span className="material-symbols-outlined"
                      style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#d0bcff', fontSize: '20px' }}>
                      database
                    </span>
                    <input
                      value={githubRepo}
                      onChange={e => setGithubRepo(e.target.value)}
                      placeholder="GitHub Repository URL (e.g. https://github.com/you/repo)"
                      disabled={atProjectLimit}
                      className="input-box"
                      style={{
                        paddingLeft: '46px', fontSize: '13px', fontFamily: 'DM Mono',
                        borderColor: githubRepo && !githubRepo.startsWith('https://github.com')
                          ? '#fb7185' : 'rgba(208,188,255,0.2)',
                        opacity: atProjectLimit ? 0.4 : 1,
                      }}
                    />
                    {githubRepo && !githubRepo.startsWith('https://github.com') && (
                      <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#fb7185', marginTop: '4px' }}>
                        Must be a valid github.com URL. Stays private until applicant is accepted.
                      </p>
                    )}
                  </div>

                  {/* File Upload dropzone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    style={{
                      border: `2px dashed ${dragOver ? '#d0bcff' : 'rgba(66,71,84,0.35)'}`,
                      padding: '40px', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '16px',
                      background: dragOver ? 'rgba(208,188,255,0.06)' : 'rgba(208,188,255,0.02)',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'; input.multiple = true; input.accept = '.pdf,.zip,.docx,.png,.jpg'
                      input.onchange = e => {
                        const files = Array.from((e.target as HTMLInputElement).files || []).slice(0, 5)
                        setUploadedFiles(prev => [...prev, ...files].slice(0, 5))
                      }
                      input.click()
                    }}
                  >
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(208,188,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ color: '#d0bcff', fontSize: '28px' }}>upload_file</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: 'DM Mono', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#dee1f7' }}>
                        Drop encrypted assets here
                      </p>
                      <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(140,144,159,0.6)', marginTop: '4px', textTransform: 'uppercase' }}>
                        PDF, ZIP, DOCX · Max 5 files · 10MB each
                      </p>
                    </div>
                  </div>

                  {/* Uploaded file list */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-2.5"
                          style={{ background: 'rgba(14,19,34,0.6)', border: '1px solid rgba(66,71,84,0.2)' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#d0bcff' }}>description</span>
                          <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#c2c6d6', flex: 1 }}>{f.name}</span>
                          <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#8c909f' }}>
                            {(f.size / 1024 / 1024).toFixed(1)}MB
                          </span>
                          <button onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}
                            style={{ color: 'rgba(251,113,133,0.6)', cursor: 'pointer', background: 'none', border: 'none' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* ── Error message ── */}
                {error && (
                  <div className="flex items-center gap-3 px-5 py-3 rounded-xl"
                    style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)' }}>
                    <span className="material-symbols-outlined" style={{ color: '#fb7185' }}>error</span>
                    <p style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#fb7185' }}>{error}</p>
                  </div>
                )}

                {/* ── Action Footer ── */}
                <div className="pt-4 pb-12 flex justify-end gap-6">
                  <Link href="/dashboard">
                    <button
                      style={{
                        padding: '14px 28px', border: '1px solid rgba(140,144,159,0.3)',
                        color: 'rgba(194,198,214,0.7)', fontSize: '11px', fontFamily: 'DM Mono',
                        textTransform: 'uppercase', letterSpacing: '0.15em',
                        background: 'transparent', cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      className="hover:bg-[#25293a] transition-colors">
                      Abort_Process
                    </button>
                  </Link>
                  <button
                    onClick={handleSubmit}
                    disabled={!isValid || loading || atProjectLimit}
                    style={{
                      padding: '14px 36px',
                      background: (!isValid || loading || atProjectLimit) ? 'rgba(173,198,255,0.3)' : '#adc6ff',
                      color: (!isValid || loading || atProjectLimit) ? 'rgba(0,46,106,0.5)' : '#002e6a',
                      fontFamily: 'Syne', fontWeight: 800, fontSize: '14px',
                      textTransform: 'uppercase', letterSpacing: '-0.02em',
                      border: 'none', cursor: (!isValid || loading || atProjectLimit) ? 'not-allowed' : 'pointer',
                      boxShadow: (!isValid || loading || atProjectLimit) ? 'none' : '0 0 30px rgba(173,198,255,0.3)',
                      transition: 'all 0.2s',
                    }}>
                    {loading ? 'Initiating...' : 'Initiate_Protocol'}
                  </button>
                </div>
              </div>

              {/* ── Right Column: Live Preview ── */}
              <aside className="w-full xl:w-[380px] xl:sticky xl:top-24 space-y-6 h-fit">
                <div className="flex items-center justify-between px-2">
                  <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#adc6ff', textTransform: 'uppercase', letterSpacing: '0.4em' }}>
                    Live Output Stream
                  </p>
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full animate-ping" style={{ background: '#6bd8cb' }} />
                    <span className="w-2 h-2 rounded-full" style={{ background: 'rgba(107,216,203,0.3)' }} />
                    <span className="w-2 h-2 rounded-full" style={{ background: 'rgba(107,216,203,0.3)' }} />
                  </div>
                </div>

                {/* Preview Card */}
                <div className="glass-panel ghost-border overflow-hidden relative card-preview-hover neon-glow-primary">
                  <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full blur-[80px]"
                    style={{ background: 'rgba(173,198,255,0.08)' }} />

                  {/* Card top bar */}
                  <div style={{ height: '8px', background: 'linear-gradient(to right, #adc6ff, #6bd8cb, #d0bcff)' }} />

                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span style={{
                            padding: '2px 8px', fontSize: '10px', fontFamily: 'DM Mono', fontWeight: 700,
                            textTransform: 'uppercase', background: 'rgba(173,198,255,0.1)', color: '#adc6ff',
                          }}>
                            {preview.slots} SLOTS OPEN
                          </span>
                        </div>
                        <h4 style={{
                          fontFamily: 'Syne', fontSize: '22px', fontWeight: 800,
                          color: preview.title === '[Project_Title]' ? 'rgba(222,225,247,0.3)' : '#dee1f7',
                          lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '-0.02em',
                          wordBreak: 'break-word',
                        }}>
                          {preview.title}
                        </h4>
                        <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(173,198,255,0.6)', marginTop: '6px', textTransform: 'uppercase' }}>
                          Lead: {userProfile?.full_name || session?.user?.name || 'You'}
                        </p>
                      </div>

                      {/* Circular progress ring */}
                      <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: '52px', height: '52px' }}>
                        <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="26" cy="26" r="22" fill="transparent" stroke="rgba(107,216,203,0.1)" strokeWidth="3" />
                          <circle cx="26" cy="26" r="22" fill="transparent" stroke="#6bd8cb"
                            strokeWidth="3" strokeDasharray="138"
                            strokeDashoffset={138 - (preview.slots / 10) * 138} />
                        </svg>
                        <span style={{ position: 'absolute', fontFamily: 'DM Mono', fontSize: '10px', color: '#6bd8cb', fontWeight: 700 }}>
                          {Math.round((preview.slots / 10) * 100)}%
                        </span>
                      </div>
                    </div>

                    {fullDesc.trim() ? (
                      <div style={{ marginBottom: '24px' }}>
                        <MarkdownView content={fullDesc} />
                      </div>
                    ) : (
                      <p style={{
                        fontSize: '13px', color: preview.description.startsWith('Project summary') ? 'rgba(194,198,214,0.35)' : '#c2c6d6',
                        lineHeight: 1.7, marginBottom: '24px', fontStyle: preview.description.startsWith('Project summary') ? 'italic' : 'normal',
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {preview.description}
                      </p>
                    )}

                    {/* Skills */}
                    <div style={{ borderTop: '1px solid rgba(66,71,84,0.2)', paddingTop: '16px', marginBottom: '16px' }}>
                      <div className="flex items-center justify-between mb-3">
                        <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#8c909f', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                          Required Skills
                        </span>
                        <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#6bd8cb' }}>
                          {preview.slots} slots
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {preview.required_skills.length > 0 ? (
                          preview.required_skills.map(skill => (
                            <span key={skill} style={{
                              padding: '3px 8px', fontSize: '10px', fontFamily: 'DM Mono',
                              background: 'rgba(107,216,203,0.08)', color: '#6bd8cb',
                              border: '1px solid rgba(107,216,203,0.2)',
                            }}>
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.3)', fontStyle: 'italic' }}>
                            No skills selected yet
                          </span>
                        )}
                      </div>

                      {/* Slot progress bar */}
                      <div style={{ marginTop: '16px', height: '2px', background: 'rgba(66,71,84,0.3)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#adc6ff', width: '0%', boxShadow: '0 0 10px rgba(173,198,255,0.6)' }} />
                      </div>
                    </div>

                    {/* Creator + vault hint */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#25293a', border: '1px solid rgba(66,71,84,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {userProfile?.avatar_url ? (
                            <img src={userProfile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#adc6ff' }}>person</span>
                          )}
                        </div>
                        <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.6)' }}>
                          {userProfile?.full_name || 'You'}
                        </span>
                        <span style={{
                          fontFamily: 'DM Mono', fontSize: '9px', fontWeight: 700,
                          padding: '1px 6px', borderRadius: '999px',
                          background: `${scoreColor(userProfile?.score || 500)}20`,
                          color: scoreColor(userProfile?.score || 500),
                        }}>
                          {userProfile?.score || 500}
                        </span>
                      </div>
                      {githubRepo && githubRepo.startsWith('https://github.com') && (
                        <div className="flex items-center gap-1" style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#d0bcff' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock</span>
                          vault linked
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Technical Specs Panel */}
                <div className="glass-panel ghost-border p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#8c909f', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                      Form completion
                    </span>
                    <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#6bd8cb' }}>
                      {(() => {
                        let score = 0
                        if (title.trim()) score += 25
                        if (shortDesc.trim()) score += 25
                        if (selectedSkills.length > 0) score += 25
                        if (fullDesc.trim()) score += 25
                        return `${score}%`
                      })()}
                    </span>
                  </div>
                  <div style={{ height: '2px', background: 'rgba(66,71,84,0.3)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', background: '#6bd8cb',
                      boxShadow: '0 0 10px #6bd8cb',
                      width: (() => {
                        let score = 0
                        if (title.trim()) score += 25
                        if (shortDesc.trim()) score += 25
                        if (selectedSkills.length > 0) score += 25
                        if (fullDesc.trim()) score += 25
                        return `${score}%`
                      })(),
                      transition: 'width 0.4s ease',
                    }} />
                  </div>

                  {/* Checklist */}
                  <div className="space-y-2 pt-2">
                    {[
                      { label: 'Title', done: title.trim().length > 0 },
                      { label: 'Short description', done: shortDesc.trim().length > 0 },
                      { label: 'At least 1 skill', done: selectedSkills.length > 0 },
                      { label: 'Full description', done: fullDesc.trim().length > 0 },
                      { label: 'GitHub repo (optional)', done: githubRepo.startsWith('https://github.com') },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2">
                        <span className="material-symbols-outlined" style={{
                          fontSize: '14px',
                          color: item.done ? '#34d399' : 'rgba(66,71,84,0.6)',
                        }}>
                          {item.done ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: item.done ? '#c2c6d6' : '#8c909f' }}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </main>
        </div>

        {/* Background particles */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ opacity: 0.25 }}>
          <div className="animate-ping" style={{ position: 'absolute', top: '25%', left: '25%', width: '2px', height: '2px', background: '#adc6ff', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '75%', right: '33%', width: '4px', height: '4px', background: '#6bd8cb', borderRadius: '50%', animation: 'ping 3s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '25%', left: '50%', width: '2px', height: '2px', background: '#d0bcff', borderRadius: '50%' }} />
        </div>
      </div>
    </>
  )
}