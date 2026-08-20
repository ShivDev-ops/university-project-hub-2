import Link from 'next/link'

type Owner = {
  user_id: string
  full_name: string
  avatar_url: string | null
  score: number
}

type ProjectWithOwner = {
  id: string
  title: string
  description: string
  required_skills: string[]
  slots: number
  filled_slots: number
  status: string
  created_at: string
  owner_id: string
  owner: Owner | null
}

export default function DashboardProjectCard({ project }: { project: ProjectWithOwner }) {
  const spotsLeft = project.slots - project.filled_slots
  const score = project.owner?.score ?? 0
  const scoreColor = score >= 600 ? '#34d399' : score >= 400 ? '#fbbf24' : '#fb7185'

  return (
    <div className="card-hover relative rounded-md overflow-hidden border border-zinc-800 bg-zinc-900/40 backdrop-blur-md">
      <div className="p-6">

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold font-mono uppercase ${spotsLeft > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800/50 text-zinc-500'}`}>
              {spotsLeft > 0 ? 'Open' : 'Full'}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
              {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
          <span className="material-symbols-outlined text-zinc-600 hover:text-emerald-500 cursor-pointer transition-colors" style={{fontSize:'20px'}}>bookmark_add</span>
        </div>

        {/* Title + desc */}
        <h3 className="font-sans text-xl font-bold mb-2 text-zinc-100">
          {project.title}
        </h3>
        <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.required_skills?.slice(0, 3).map((skill: string) => (
            <span key={skill} className="px-2 py-1 rounded-sm bg-zinc-800 text-[10px] font-mono text-zinc-300 border border-zinc-700/50">
              {skill}
            </span>
          ))}
          {(project.required_skills?.length ?? 0) > 3 && (
            <span className="px-2 py-1 rounded-sm bg-zinc-800/50 text-[10px] font-mono text-zinc-500 border border-zinc-800">
              +{(project.required_skills?.length ?? 0) - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-zinc-800 border border-zinc-700">
              {project.owner?.avatar_url ? (
                <img src={project.owner.avatar_url} className="w-full h-full object-cover" alt={project.owner.full_name} />
              ) : (
                <span className="material-symbols-outlined text-[14px] text-zinc-500">person</span>
              )}
            </div>
            <span className="font-mono text-[10px] text-zinc-400">
              {project.owner?.full_name ?? 'Unknown'}
            </span>
            <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{background:`${scoreColor}20`, color: scoreColor}}>
              {score}
            </span>
          </div>
          <Link href={`/projects/${project.id}`}>
            <button className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-500 hover:text-emerald-400 hover:gap-2 transition-all">
              View <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </Link>
        </div>

      </div>
    </div>
  )
}
