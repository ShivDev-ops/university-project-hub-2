// app/dashboard/page.tsx
export const revalidate = 0

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import Image from 'next/image'
import DashboardNavbar from '@/components/DashboardNavbar'
import SquaresBackground from '@/components/ui/SquaresBackground'
import DashboardSidebar from '@/components/DashboardSidebar'
import DashboardSearchBar from '@/components/DashboardSearchBar'
import DashboardProjectCard from '@/components/DashboardProjectCard'

type Project = {
  id: string
  title: string
  description: string
  required_skills: string[]
  slots: number
  filled_slots: number
  status: string
  created_at: string
  owner_id: string
}

type Owner = {
  user_id: string
  full_name: string
  avatar_url: string | null
  score: number
}

type ProjectWithOwner = Project & { owner: Owner | null }

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Step 1 — fetch projects without broken FK join
  const { data: projects } = await supabaseAdmin
    .from('projects')
    .select('id, title, description, required_skills, slots, filled_slots, status, created_at, owner_id')
    .eq('status', 'open')
    .order('created_at', { ascending: false }) as { data: Project[] | null }

  // Step 2 — fetch owners manually (owner_id = profiles.user_id confirmed)
  let projectsWithOwners: ProjectWithOwner[] = []
  if (projects && projects.length > 0) {
    const ownerIds = [...new Set(projects.map(p => p.owner_id))]
    const { data: owners } = await supabaseAdmin
      .from('profiles')
      .select('user_id, full_name, avatar_url, score')
      .in('user_id', ownerIds) as { data: Owner[] | null }

    const ownerMap = Object.fromEntries(
      (owners ?? []).map(o => [o.user_id, o])
    )
    projectsWithOwners = projects.map(p => ({
      ...p,
      owner: ownerMap[p.owner_id] ?? null,
    }))
  }

  // Step 3 — fetch current user profile
  const { data: profile } =
   await supabaseAdmin
    .from('profiles')
    .select('user_id, full_name, score, skills, avatar_url')
    .eq('user_id', session.user.id)
    .single()

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&family=DM+Mono&family=Inter:wght@400;500;600&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style>{`
        body { font-family: 'Inter', sans-serif; background-color: #09090b; color: #f4f4f5; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-card { 
          backdrop-filter: blur(12px); 
          background: rgba(24, 24, 27, 0.4); 
          border: 1px solid rgba(16, 185, 129, 0.1); 
        }
        .neon-glow-primary { box-shadow: 0 0 20px rgba(16, 185, 129, 0.15); }
        .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 40px -10px rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.3);
        }
      `}</style>

      <div className="bg-zinc-950 min-h-screen selection:bg-emerald-500/30 relative">
        <SquaresBackground />
        
        <div className="relative z-10">
        {/* Top Nav */}
        <DashboardNavbar profile={profile} />

        <div className="flex pt-[60px] min-h-screen dot-grid">

          <DashboardSidebar profile={profile} session={session} />

          {/* Main Content */}
          <main className="md:ml-64 w-full p-6 md:p-8">

            {/* Search Bar */}
            <DashboardSearchBar />

            {/* Filter + Post Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8 max-w-5xl mx-auto">
              <div className="flex flex-wrap items-center gap-3">
                <button className="px-4 py-1.5 rounded-sm bg-zinc-900/50 border border-zinc-800 flex items-center gap-2 hover:border-emerald-500/50 transition-all font-mono text-[11px] text-zinc-300">
                  All Departments <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </button>
                <button className="px-4 py-1.5 rounded-sm bg-zinc-900/50 border border-zinc-800 flex items-center gap-2 hover:border-emerald-500/50 transition-all font-mono text-[11px] text-zinc-300">
                  All Years <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </button>
                <div className="h-4 w-px mx-2 bg-zinc-800" />
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                  {projectsWithOwners.length} open projects
                </span>
              </div>
              <Link href="/projects/create">
                <button className="px-5 py-2 rounded-sm font-mono font-bold text-[11px] uppercase tracking-widest transition-all hover:scale-105 bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  + Post Project
                </button>
              </Link>
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {projectsWithOwners.length > 0 ? (
                projectsWithOwners.map((project) => (
                  <DashboardProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="col-span-3 text-center py-20">
                  <span className="material-symbols-outlined" style={{fontSize:'48px', color:'#27272a'}}>
                    rocket_launch
                  </span>
                  <p style={{fontFamily:'Inter', fontSize:'20px', fontWeight:700, color:'#d4d4d8', marginTop:'16px'}}>
                    No projects yet
                  </p>
                  <p style={{fontFamily:'DM Mono', fontSize:'12px', color:'#71717a', marginTop:'8px'}}>
                    Be the first to post a project
                  </p>
                  <Link href="/projects/create">
                    <button className="mt-6 px-6 py-3 rounded-sm font-medium neon-glow-primary"
                      style={{background:'#10b981', color:'#000000', fontFamily:'DM Mono'}}>
                      + Post Project
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </main>
        </div>
        </div>
      </div>
    </>
  )
}