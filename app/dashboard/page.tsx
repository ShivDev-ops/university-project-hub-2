// app/dashboard/page.tsx
export const revalidate = 0

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import DashboardNavbar from '@/components/DashboardNavbar'
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
        body { font-family: 'Manrope', sans-serif; background-color: #0e1322; color: #dee1f7; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-card { backdrop-filter: blur(16px); background: rgba(26, 31, 47, 0.6); }
        .neon-glow-primary { box-shadow: 0 0 20px rgba(77, 142, 255, 0.15); }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(77, 142, 255, 0.05) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .card-hover { transition: all 0.3s; }
        .card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 40px -10px rgba(77, 142, 255, 0.2);
        }
      `}</style>

      <div className="bg-[#0e1322] min-h-screen selection:bg-[#4d8eff]/30">

        {/* Top Nav */}
        <DashboardNavbar profile={profile} />

        <div className="flex pt-[60px] min-h-screen dot-grid">

          <DashboardSidebar profile={profile} session={session} />

          {/* Main Content */}
          <main className="ml-64 w-full p-8">

            {/* Search Bar */}
            <DashboardSearchBar />

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
                  {projectsWithOwners.length} open projects
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
              {projectsWithOwners.length > 0 ? (
                projectsWithOwners.map((project) => (
                  <DashboardProjectCard key={project.id} project={project} />
                ))
              ) : (
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
            </div>
          </main>
        </div>
      </div>
    </>
  )
}