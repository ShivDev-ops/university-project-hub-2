// File: app/dashboard/page.tsx
// This is a Server Component — it fetches data on the server
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
export default async function DashboardPage() {
  const session = await getServerSession()
  // Extra safety check — middleware should handle this but double-check
    if (!session?.user?.id) {
    redirect('/login')
  }
  // Fetch ALL open projects with full details (VEIL level)
  const { data: projects } = await supabaseAdmin
    .from('projects')
    .select(`
      id, title, description, required_skills,
      slots, filled_slots, status, created_at,
      owner_id
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
  // Get the current user's profile to show their score
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('name, score, skills')
    .eq('user_id', session.user.id)
    .single()
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top navigation */}
      <nav className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <span className="text-lg font-bold text-purple-400">Project Hub</span>
        <div className="flex items-center gap-4">
          {/* Show accountability score */}
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
            (profile?.score || 0) >= 600 ? 'bg-green-900 text-green-300' :
            (profile?.score || 0) >= 400 ? 'bg-yellow-900 text-yellow-300' :
                                            'bg-red-900 text-red-300'
          }`}>
 {profile?.score || 500}
          </span>
          <span className="text-gray-300 text-sm">{profile?.name}</span>
          <Link href="/profile/me" className="text-gray-400 hover:text-white text-sm">
            My Profile
          </Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Search bar — AI will power this in Phase 4 */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search projects by skill or description... (AI search coming in Phase 4)"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-5 py-4
                       text-white focus:outline-none focus:border-purple-500 text-sm"
            disabled  // Enable this in Phase 4
          />
        </div>
        {/* Action buttons */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Open Projects ({projects?.length || 0})
          </h2>
          <Link
            href="/projects/create"
            className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg text-sm font-medium"
          >
            + Post a Project
          </Link>
        </div>
        {/* Project cards — full details visible (VEIL level) */}
        <div className="grid gap-5">
          {projects?.map((project) => (
              <div
              key={project.id}
              className="bg-gray-900 border border-gray-800 hover:border-purple-500
                         rounded-xl p-6 transition"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <span className="bg-purple-900 text-purple-300 text-xs px-3 py-1 rounded-full">
                  {project.slots - project.filled_slots} spots left
                </span>
              </div>
              {/* Full description — visible to logged-in users */}
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.required_skills?.map((skill: string) => (
                  <span key={skill}
                        className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
              </div>
              <Link
                href={`/projects/${project.id}`}
                className="text-purple-400 text-sm hover:text-purple-300 font-medium"
              >
                View details and apply →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}