// File: app/page.tsx
// This is a Server Component (no 'use client' at the top)
// Server Components fetch data on the server before sending HTML to the browser
// This means the page loads fast and is SEO-friendly
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
// Create a Supabase client using the public anon key
// The anon key is safe to use here because RLS policies protect the data
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
export default async function LandingPage() {
  // Fetch only PUBLIC projects that are still OPEN
  // We only select the columns we need — not github_repo, not full description
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, title, required_skills, slots, filled_slots, created_at')
     .eq('visibility', 'public')
    .eq('status', 'open')
  if (error) {
    console.error('Failed to load projects:', error.message)
  }
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-400">University Project Hub</h1>
        <Link
          href="/login"
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Sign In
        </Link>
      </nav>
      {/* Hero Section */}
      <section className="text-center py-16 px-6">
        <h2 className="text-4xl font-bold mb-4">Find Your Next Project Team</h2>
        <p className="text-gray-400 text-lg mb-8">
          Discover real projects. Apply with your skills. Build something meaningful.
        </p>
        <Link
          href="/login"
          className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-xl text-lg font-semibold"
        >
          Join with University Email →
        </Link>
      </section>
      {/* Project Feed */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h3 className="text-xl font-semibold mb-6 text-gray-200">
          Open Projects ({projects?.length || 0})
        </h3>
        <div className="grid gap-4">
          {projects?.map((project) => (
            <div
              key={project.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-purple-500 transition"
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-lg font-semibold text-white">{project.title}</h4>
                {/* Vacancy badge */}
                <span className="bg-purple-900 text-purple-300 text-xs px-3 py-1 rounded-full">
                  {project.slots - project.filled_slots} spots open
                </span>
              </div>
              {/* Skills required — shown as tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.required_skills?.map((skill: string) => (
                  <span
                    key={skill}
                    className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              {/* Gate — full details only after login */}
              <Link
                href="/login"
                className="text-purple-400 text-sm hover:text-purple-300"
              >
                Sign in to see full details and apply →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}