'use client'
// components/LandingClient.tsx
// Full visual landing page — converted from Google Stitch HTML into Next.js
// Uses CSS animations only (no external animation library needed)
// Drop-in replacement: just pass { projects } and it renders the full page

import Link from 'next/link'
import { useEffect, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Project {
  id: string
  title: string
  description: string
  required_skills: string[]
  slots: number
  filled_slots: number
  created_at: string
  status: string
}

interface Props {
  projects: Project[]
}

// ─── Skill → category color ───────────────────────────────────────────────────
function skillColor(skill: string): string {
  const s = skill.toLowerCase()
  if (['react', 'next.js', 'vue', 'angular', 'html', 'css', 'tailwind', 'three.js'].some(k => s.includes(k))) return '#4D8EFF'
  if (['python', 'node', 'express', 'fastapi', 'django', 'go', 'rust', 'java', 'spring'].some(k => s.includes(k))) return '#A078FF'
  if (['ml', 'pytorch', 'tensorflow', 'nlp', 'ai', 'neural', 'openai'].some(k => s.includes(k))) return '#8B5CF6'
  if (['docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd', 'linux'].some(k => s.includes(k))) return '#F97316'
  if (['react native', 'flutter', 'android', 'ios', 'swift', 'kotlin'].some(k => s.includes(k))) return '#10B981'
  if (['postgresql', 'mysql', 'mongodb', 'redis', 'supabase', 'firebase'].some(k => s.includes(k))) return '#06B6D4'
  if (['figma', 'design', 'ui', 'ux', 'blender', 'unity'].some(k => s.includes(k))) return '#EC4899'
  return '#6B7280'
}

// ─── Project card accent color ────────────────────────────────────────────────
const CARD_ACCENTS = ['#4D8EFF', '#6BD8CB', '#A078FF', '#F59E0B', '#10B981', '#F43F5E']

// ─── Time ago helper ──────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ─── Vacancy label ────────────────────────────────────────────────────────────
function vacancyLabel(slots: number, filled: number) {
  const open = slots - filled
  if (open <= 0) return { text: 'Full', color: '#F43F5E' }
  if (open === 1) return { text: '1 spot left', color: '#F59E0B' }
  return { text: `${open} vacancies`, color: '#4D8EFF' }
}

// ─── PROJECT CARD ─────────────────────────────────────────────────────────────
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false)
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length]
  const { text: vacText, color: vacColor } = vacancyLabel(project.slots, project.filled_slots)
  const skills = project.required_skills?.slice(0, 4) ?? []

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: 'rgba(26,31,47,0.6)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${hovered ? accent + '55' : 'rgba(140,144,159,0.12)'}`,
        borderRadius: 20,
        overflow: 'hidden',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 0 0 1px ${accent}40, 0 12px 40px rgba(0,0,0,0.5), 0 0 60px ${accent}12`
          : '0 4px 24px rgba(0,0,0,0.35)',
        transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        animationDelay: `${index * 0.09}s`,
      }}
      className="card-entrance"
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${accent}, transparent)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }} />

      <div style={{ padding: '28px 28px 0' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <span style={{
            fontFamily: 'DM Mono, monospace', fontSize: 10,
            color: 'rgba(148,163,184,0.5)', letterSpacing: '0.08em',
          }}>
            {timeAgo(project.created_at)}
          </span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: `${vacColor}18`, color: vacColor,
            border: `1px solid ${vacColor}30`,
            borderRadius: 9999, padding: '3px 10px',
            fontSize: 10, fontFamily: 'DM Mono, monospace', fontWeight: 600,
            letterSpacing: '0.05em',
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: vacColor,
              boxShadow: `0 0 6px ${vacColor}`,
              display: 'inline-block',
              animation: vacText === '1 spot left' ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
            }} />
            {vacText}
          </span>
        </div>

        {/* Title */}
        <h4 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: 20, color: hovered ? accent : '#DEE1F7',
          marginBottom: 10, lineHeight: 1.3,
          transition: 'color 0.25s ease',
        }}>
          {project.title}
        </h4>

        {/* Description */}
        <p style={{
          fontSize: 13, color: 'rgba(194,198,214,0.75)',
          lineHeight: 1.65, marginBottom: 16,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {project.description}
        </p>

        {/* Skill tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
          {skills.map(skill => (
            <span key={skill} style={{
              fontFamily: 'DM Mono, monospace', fontSize: 10,
              padding: '4px 10px', borderRadius: 9999,
              border: `1px solid ${skillColor(skill)}35`,
              color: skillColor(skill),
              background: `${skillColor(skill)}12`,
            }}>
              {skill}
            </span>
          ))}
          {(project.required_skills?.length ?? 0) > 4 && (
            <span style={{
              fontFamily: 'DM Mono, monospace', fontSize: 10,
              padding: '4px 10px', borderRadius: 9999,
              border: '1px solid rgba(148,163,184,0.2)',
              color: 'rgba(148,163,184,0.6)',
            }}>
              +{project.required_skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Frosted lock overlay — bottom 55% */}
      <div style={{
        position: 'absolute', inset: 'auto 0 0 0',
        height: '52%',
        background: `linear-gradient(to top, rgba(14,19,34,0.97) 40%, rgba(14,19,34,0.85) 70%, transparent)`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        paddingBottom: 24, gap: 10,
      }}>
        {/* Progress bar */}
        <div style={{
          width: 'calc(100% - 56px)',
          height: 2, background: 'rgba(255,255,255,0.06)',
          borderRadius: 9999, overflow: 'hidden', marginBottom: 4,
        }}>
          <div style={{
            width: `${(project.filled_slots / project.slots) * 100}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${accent}, ${accent}90)`,
            boxShadow: `0 0 8px ${accent}`,
            borderRadius: 9999,
          }} />
        </div>

        {/* Lock badge */}
        <Link href="/login" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 10, padding: '8px 16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = `${accent}15`
              el.style.borderColor = `${accent}40`
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'rgba(255,255,255,0.05)'
              el.style.borderColor = 'rgba(255,255,255,0.10)'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span style={{
              fontFamily: 'DM Mono, monospace', fontSize: 11,
              color: 'rgba(194,198,214,0.7)',
            }}>
              Sign in to see full details
            </span>
          </div>
        </Link>
      </div>
    </div>
  )
}

// ─── FLOATING HERO CARD ───────────────────────────────────────────────────────
function FloatingCard({
  title, desc, tags, accent, icon, delay, blur = false, scale = 1,
}: {
  title: string; desc: string; tags: string[]; accent: string
  icon: string; delay: string; blur?: boolean; scale?: number
}) {
  return (
    <div style={{
      position: 'absolute',
      background: 'rgba(26,31,47,0.65)',
      backdropFilter: `blur(${blur ? 4 : 20}px)`,
      border: '1px solid rgba(140,144,159,0.15)',
      borderRadius: 16, padding: 24, width: 300,
      transform: `scale(${scale})`,
      opacity: blur ? 0.45 : 1,
      filter: blur ? 'blur(1.5px)' : 'none',
      animation: `float ${blur ? '11s' : '8s'} ease-in-out infinite`,
      animationDelay: delay,
      zIndex: blur ? 0 : 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${accent}18`, border: `1px solid ${accent}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>
          {icon}
        </div>
        <span style={{
          fontFamily: 'DM Mono, monospace', fontSize: 9,
          background: `${accent}18`, color: accent,
          border: `1px solid ${accent}30`,
          borderRadius: 9999, padding: '3px 8px',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Open
        </span>
      </div>
      <h3 style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 800,
        fontSize: 18, color: '#DEE1F7', marginBottom: 8,
      }}>
        {title}
      </h3>
      <p style={{ fontSize: 12, color: 'rgba(194,198,214,0.65)', lineHeight: 1.6, marginBottom: 14 }}>
        {desc}
      </p>
      <div style={{ display: 'flex', gap: 6 }}>
        {tags.map(t => (
          <span key={t} style={{
            fontFamily: 'DM Mono, monospace', fontSize: 10,
            border: '1px solid rgba(140,144,159,0.25)',
            color: 'rgba(194,198,214,0.7)',
            borderRadius: 9999, padding: '2px 8px',
          }}>{t}</span>
        ))}
      </div>
      {/* Slot progress bar */}
      <div style={{ marginTop: 16, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 9999 }}>
        <div style={{
          width: '65%', height: '100%', borderRadius: 9999,
          background: `linear-gradient(90deg, ${accent}, ${accent}80)`,
          boxShadow: `0 0 8px ${accent}80`,
        }} />
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LandingClient({ projects }: Props) {
  const [scrollY, setScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* ── GLOBAL STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        body {
          background: #0E1322;
          color: #DEE1F7;
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0E1322; }
        ::-webkit-scrollbar-thumb { background: #2F3445; border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: #4D8EFF40; }

        /* Float animation for hero cards */
        @keyframes float {
          0%   { transform: translateY(0px) rotate(0deg); }
          50%  { transform: translateY(-18px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }

        /* Pulsing dot for 1-slot-left badge */
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.4); }
        }

        /* Card staggered entrance */
        @keyframes card-in {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-entrance {
          opacity: 0;
          animation: card-in 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }

        /* Nav link hover underline slide */
        .nav-link {
          position: relative; color: #C2C6D6;
          font-size: 14px; font-weight: 500;
          text-decoration: none; padding: 4px 0;
          transition: color 0.2s ease;
        }
        .nav-link::after {
          content: '';
          position: absolute; bottom: 0; left: 0;
          width: 0; height: 1.5px;
          background: #4D8EFF;
          transition: width 0.25s ease;
        }
        .nav-link:hover { color: #4D8EFF; }
        .nav-link:hover::after { width: 100%; }

        /* CTA button shimmer */
        @keyframes shimmer {
          0%   { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(250%) skewX(-15deg); }
        }
        .cta-btn { position: relative; overflow: hidden; }
        .cta-btn::after {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 40%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: translateX(-100%) skewX(-15deg);
        }
        .cta-btn:hover::after { animation: shimmer 0.7s ease forwards; }

        /* Hero entrance */
        @keyframes hero-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-el { opacity: 0; animation: hero-in 0.7s ease forwards; }

        /* Eyebrow badge pulse glow */
        @keyframes badge-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(77,142,255,0); }
          50%       { box-shadow: 0 0 16px 3px rgba(77,142,255,0.25); }
        }

        /* Logo spin on hover */
        .logo-mark { transition: transform 0.6s cubic-bezier(0.34,1.56,0.64,1), color 0.2s; }
        .logo-mark:hover { transform: rotate(180deg); color: #6BD8CB; }

        /* Notification/terminal icon button */
        .icon-btn {
          width: 36px; height: 36px; border-radius: 50%;
          background: transparent; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #C2C6D6; transition: all 0.2s ease;
          position: relative;
        }
        .icon-btn:hover { background: rgba(77,142,255,0.12); color: #4D8EFF; }

        /* Avatar ring */
        .avatar-ring {
          width: 34px; height: 34px; border-radius: 50%;
          border: 2px solid rgba(77,142,255,0.4);
          overflow: hidden; cursor: pointer;
          transition: border-color 0.2s ease;
        }
        .avatar-ring:hover { border-color: rgba(107,216,203,0.7); }

        /* Sticky bottom banner */
        @keyframes banner-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .bottom-banner {
          animation: banner-in 0.6s ease 1.2s forwards;
          opacity: 0;
        }

        /* Particle drift */
        @keyframes drift1 { 0%,100%{transform:translate(0,0)} 25%{transform:translate(6px,-8px)} 75%{transform:translate(-4px,6px)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-8px,5px)} 66%{transform:translate(5px,-6px)} }
        @keyframes drift3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(10px,-4px)} }

        /* Section heading slide in */
        @keyframes slide-left {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* Mobile menu overlay */
        @media (max-width: 768px) {
          .hero-right { display: none !important; }
          .nav-links  { display: none !important; }
          .hero-h1    { font-size: 52px !important; }
          .hero-h1-sub { font-size: 42px !important; }
        }

        @media (max-width: 480px) {
          .hero-h1    { font-size: 40px !important; }
          .hero-h1-sub { font-size: 32px !important; }
        }
      `}</style>

      {/* ── BACKGROUND BLOBS (fixed, behind everything) ── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(77,142,255,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0,
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107,216,203,0.05) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '30%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(160,120,255,0.04) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 60, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(14,19,34,0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(140,144,159,0.10)',
        boxShadow: '0 0 30px rgba(77,142,255,0.06)',
      }}>
        {/* Left: logo + nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span
              className="logo-mark"
              style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 800,
                fontSize: 18, color: '#ADC6FF',
                letterSpacing: '-0.03em', display: 'block',
              }}
            >
              PROJECT_HUB
            </span>
          </Link>
          <div className="nav-links" style={{ display: 'flex', gap: 28 }}>
            {['Discover', 'Labs', 'Teams', 'Archive'].map(l => (
              <Link key={l} href="/login" className="nav-link">{l}</Link>
            ))}
          </div>
        </div>

        {/* Right: icons + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="icon-btn" title="Notifications" onClick={() => {}}>
            {/* Bell icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <button className="icon-btn" title="Terminal">
            {/* Terminal icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5"/>
              <line x1="12" y1="19" x2="20" y2="19"/>
            </svg>
          </button>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <div className="avatar-ring">
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(135deg, #4D8EFF, #A078FF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'DM Mono, monospace', fontSize: 12,
                fontWeight: 500, color: 'white',
              }}>
                ?
              </div>
            </div>
          </Link>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        paddingTop: 60,
        background: `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(77,142,255,0.13) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 85% 75%, rgba(160,120,255,0.09) 0%, transparent 50%),
          radial-gradient(ellipse 50% 40% at 10% 90%, rgba(107,216,203,0.07) 0%, transparent 50%),
          #0E1322
        `,
        overflow: 'hidden',
      }}>
        {/* Dot grid overlay */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(140,144,159,0.09) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }} />

        {/* Floating particles */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {[
            { top: '22%', left: '18%', size: 3, color: 'rgba(77,142,255,0.5)',  anim: 'drift1 9s ease-in-out infinite' },
            { top: '35%', right: '22%', size: 4, color: 'rgba(107,216,203,0.4)', anim: 'drift2 11s ease-in-out infinite' },
            { bottom: '28%', left: '45%', size: 2, color: 'rgba(160,120,255,0.5)', anim: 'drift3 7s ease-in-out infinite' },
            { top: '60%', right: '35%', size: 2, color: 'rgba(77,142,255,0.7)',  anim: 'drift1 13s ease-in-out infinite 2s' },
            { top: '12%', left: '38%', size: 3, color: 'rgba(77,142,255,0.4)',  anim: 'drift2 10s ease-in-out infinite 1s' },
            { bottom: '15%', right: '12%', size: 3, color: 'rgba(107,216,203,0.35)', anim: 'drift3 12s ease-in-out infinite 3s' },
            { top: '48%', left: '8%',  size: 2, color: 'rgba(160,120,255,0.4)', anim: 'drift1 8s ease-in-out infinite 0.5s' },
            { top: '75%', left: '62%', size: 2, color: 'rgba(77,142,255,0.35)', anim: 'drift2 14s ease-in-out infinite 4s' },
          ].map((p, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: p.top, bottom: (p as any).bottom,
              left: (p as any).left, right: (p as any).right,
              width: p.size, height: p.size, borderRadius: '50%',
              background: p.color, boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              animation: p.anim,
            }} />
          ))}
        </div>

        {/* Content grid */}
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 24px',
          width: '100%', display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48, alignItems: 'center',
          position: 'relative', zIndex: 1,
        }}>
          {/* ── LEFT: Text content ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, alignItems: 'flex-start' }}>

            {/* Eyebrow badge */}
            <div
              className="hero-el"
              style={{
                animationDelay: '0.1s',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '7px 16px', borderRadius: 9999,
                background: 'rgba(77,142,255,0.08)',
                border: '1px solid rgba(77,142,255,0.25)',
                animation: 'hero-in 0.7s ease 0.1s forwards, badge-glow 3s ease-in-out 1s infinite',
              }}
            >
              <span style={{ fontSize: 14 }}>🎓</span>
              <span style={{
                fontFamily: 'DM Mono, monospace', fontSize: 11,
                color: '#ADC6FF', fontWeight: 600,
                letterSpacing: '0.10em', textTransform: 'uppercase',
              }}>
                University-Exclusive Platform
              </span>
            </div>

            {/* H1 */}
            <div className="hero-el" style={{ animationDelay: '0.22s' }}>
              <h1
                className="hero-h1"
                style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 800,
                  fontSize: 72, lineHeight: 1.0,
                  letterSpacing: '-0.03em', color: '#DEE1F7',
                  display: 'block',
                }}
              >
                Find Your Team.
              </h1>
              <h1
                className="hero-h1-sub"
                style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 800,
                  fontSize: 62, lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  color: 'rgba(222,225,247,0.68)',
                  display: 'block', marginTop: 6,
                }}
              >
                Build Something Real.
              </h1>
            </div>

            {/* Subheading */}
            <p
              className="hero-el"
              style={{
                animationDelay: '0.35s',
                fontSize: 17, color: '#C2C6D6',
                lineHeight: 1.7, maxWidth: 440,
              }}
            >
              Collaborate with engineers, designers, and innovators within your campus. Bridge the gap between coursework and real products.
            </p>

            {/* CTA */}
            <div className="hero-el" style={{ animationDelay: '0.48s' }}>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <button
                  className="cta-btn"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    height: 52, padding: '0 28px',
                    background: '#4D8EFF',
                    color: 'white',
                    border: 'none', borderRadius: 9999,
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 15, fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 0 30px rgba(77,142,255,0.45), 0 4px 16px rgba(77,142,255,0.25)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={e => {
                    const btn = e.currentTarget as HTMLButtonElement
                    btn.style.transform = 'scale(1.04)'
                    btn.style.boxShadow = '0 0 40px rgba(77,142,255,0.6), 0 8px 24px rgba(77,142,255,0.3)'
                  }}
                  onMouseLeave={e => {
                    const btn = e.currentTarget as HTMLButtonElement
                    btn.style.transform = 'scale(1)'
                    btn.style.boxShadow = '0 0 30px rgba(77,142,255,0.45), 0 4px 16px rgba(77,142,255,0.25)'
                  }}
                >
                  {/* Terminal icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 17 10 11 4 5"/>
                    <line x1="12" y1="19" x2="20" y2="19"/>
                  </svg>
                  Sign In with University Email
                </button>
              </Link>
            </div>

            {/* Social proof */}
            <div
              className="hero-el"
              style={{
                animationDelay: '0.60s',
                display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              {/* Stacked avatars */}
              <div style={{ display: 'flex' }}>
                {[
                  'linear-gradient(135deg,#4D8EFF,#A078FF)',
                  'linear-gradient(135deg,#6BD8CB,#4D8EFF)',
                  'linear-gradient(135deg,#F59E0B,#F43F5E)',
                  'linear-gradient(135deg,#10B981,#6BD8CB)',
                ].map((bg, i) => (
                  <div key={i} style={{
                    width: 34, height: 34, borderRadius: '50%',
                    border: '2px solid #0E1322',
                    background: bg,
                    marginLeft: i === 0 ? 0 : -10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'DM Mono, monospace', fontSize: 10,
                    color: 'white', fontWeight: 600,
                  }}>
                    {['RS','PM','AK','VR'][i]}
                  </div>
                ))}
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  border: '2px solid #0E1322',
                  background: '#25293A', marginLeft: -10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'DM Mono, monospace', fontSize: 9,
                  color: '#4D8EFF', fontWeight: 700,
                }}>
                  +196
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#8C909F', fontFamily: 'DM Mono, monospace' }}>
                Trusted by{' '}
                <span style={{ color: '#4D8EFF', fontWeight: 600 }}>200+ students</span>
              </p>
            </div>
          </div>

          {/* ── RIGHT: Floating project cards ── */}
          <div
            className="hero-right"
            style={{ position: 'relative', height: 580, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {/* Back card (blurred) */}
            <div style={{
              position: 'absolute', top: '30%', left: '-10%',
              width: 290, zIndex: 0, opacity: 0.4,
              filter: 'blur(2px)', transform: 'scale(0.92)',
              animation: 'float 12s ease-in-out infinite -6s',
              background: 'rgba(26,31,47,0.5)',
              border: '1px solid rgba(140,144,159,0.10)',
              borderRadius: 16, padding: 22,
            }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#DEE1F7', marginBottom: 8 }}>
                Neural Archiver
              </div>
              <p style={{ fontSize: 12, color: 'rgba(194,198,214,0.5)', lineHeight: 1.5 }}>
                ML model for semantic indexing of academic research papers.
              </p>
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                {['PyTorch','NLP'].map(t => (
                  <span key={t} style={{ fontFamily:'DM Mono,monospace', fontSize:9, border:'1px solid rgba(140,144,159,0.2)', color:'rgba(194,198,214,0.5)', borderRadius:9999, padding:'2px 8px' }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Front card (main) */}
            <FloatingCard
              title="Mars Rover HUD"
              desc="Designing a real-time telemetry interface for the university robotics competition team."
              tags={['React', 'Three.js']}
              accent="#4D8EFF"
              icon="🚀"
              delay="0s"
            />

            {/* Second front card */}
            <div style={{
              position: 'absolute', bottom: 20, right: '-5%',
              animation: 'float 10s ease-in-out infinite -4s',
              background: 'rgba(26,31,47,0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(160,120,255,0.2)',
              borderRadius: 16, padding: 22, width: 260, zIndex: 5,
              opacity: 0.85,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(160,120,255,0.15)', border: '1px solid rgba(160,120,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                }}>🧠</div>
                <span style={{
                  fontFamily: 'DM Mono, monospace', fontSize: 9,
                  background: 'rgba(160,120,255,0.15)', color: '#A078FF',
                  border: '1px solid rgba(160,120,255,0.25)',
                  borderRadius: 9999, padding: '3px 8px',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>Active</span>
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 17, color: '#DEE1F7', marginBottom: 6 }}>
                Quantum Auth
              </div>
              <p style={{ fontSize: 12, color: 'rgba(194,198,214,0.65)', lineHeight: 1.5, marginBottom: 12 }}>
                Post-quantum cryptographic standards for decentralized identity.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: -6 }}>
                {['#4D8EFF','#A078FF','#6BD8CB'].map((c,i) => (
                  <div key={i} style={{
                    width: 22, height: 22, borderRadius: '50%',
                    border: '2px solid rgba(14,19,34,0.8)',
                    background: `${c}30`, borderColor: `${c}60`,
                    marginLeft: i === 0 ? 0 : -6,
                  }} />
                ))}
                <span style={{ marginLeft: 10, fontFamily:'DM Mono,monospace', fontSize:10, color:'rgba(148,163,184,0.5)' }}>3 members</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJECT FEED SECTION ── */}
      <section style={{
        padding: '80px 24px 120px',
        maxWidth: 1280, margin: '0 auto',
        position: 'relative',
      }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 52 }}>
          <div>
            {/* Heading + live badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <h2 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 800,
                fontSize: 38, letterSpacing: '-0.03em', color: '#DEE1F7',
              }}>
                Active Projects
              </h2>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 9999,
                background: 'rgba(107,216,203,0.10)',
                border: '1px solid rgba(107,216,203,0.25)',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#6BD8CB',
                  boxShadow: '0 0 8px #6BD8CB',
                  display: 'inline-block',
                  animation: 'pulse-dot 2s ease-in-out infinite',
                }} />
                <span style={{
                  fontFamily: 'DM Mono, monospace', fontSize: 10,
                  color: '#6BD8CB', fontWeight: 700,
                  letterSpacing: '0.10em', textTransform: 'uppercase',
                }}>
                  {projects.length > 0 ? `${projects.length * 7} Live` : '42 Live'}
                </span>
              </span>
            </div>
            <p style={{ color: '#8C909F', fontSize: 15, maxWidth: 420, lineHeight: 1.6 }}>
              Browse ongoing collaborations within your network. Sign in to view full details and apply.
            </p>
          </div>

          {/* View all link */}
          <Link href="/login" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontFamily: 'DM Mono, monospace', fontSize: 13,
              color: '#4D8EFF', fontWeight: 600, letterSpacing: '0.05em',
              transition: 'gap 0.2s ease',
            }}>
              VIEW ALL
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4D8EFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>

        {/* Cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 24,
        }}>
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </section>

      {/* ── STICKY BOTTOM BANNER ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 60, padding: '16px 24px',
        display: 'flex', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div
          className="bottom-banner"
          style={{
            pointerEvents: 'auto',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 32,
            padding: '14px 28px',
            background: 'rgba(26,31,47,0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(140,144,159,0.15)',
            borderRadius: 9999,
            boxShadow: '0 -8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(77,142,255,0.08)',
            maxWidth: 700, width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#4D8EFF',
              boxShadow: '0 0 10px #4D8EFF',
              display: 'inline-block',
            }} />
            <p style={{ fontSize: 14, color: '#DEE1F7', fontWeight: 500, whiteSpace: 'nowrap' }}>
              Sign in to unlock full details, apply, and find teammates
            </p>
          </div>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: 'none',
              cursor: 'pointer', padding: '4px 0',
              fontFamily: 'DM Mono, monospace', fontWeight: 700,
              fontSize: 13, color: '#4D8EFF',
              letterSpacing: '0.06em', whiteSpace: 'nowrap',
              transition: 'gap 0.2s ease',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.gap = '10px' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.gap = '6px' }}
            >
              GET STARTED
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </>
  )
}
