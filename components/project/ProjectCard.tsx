// components/project/ProjectCard.tsx
import { ScoreBadge } from '@/components/ScoreBadge'
import { Badge } from '@/components/ui/Badge'

type Project = {
  id: string
  title: string
  description: string
  required_skills: string[]
  slots: number
  filled_slots: number
  owner: {
    id: string
    full_name: string
    avatar_url: string | null
    score: number
  }
  created_at: string
}

export function ProjectCard({ project, isOwner }: { project: Project; isOwner?: boolean }) {
  const vacancies = project.slots - project.filled_slots
  const visibleSkills = project.required_skills.slice(0, 4)
  const extraSkills = project.required_skills.length - 4

  return (
    <div className="bg-[#1E293B] rounded-xl p-4 ring-1 ring-slate-700 hover:ring-slate-500 transition-all flex flex-col gap-3">
      {/* Title + Description */}
      <div>
        <h3 className="text-slate-100 font-semibold text-base line-clamp-1">{project.title}</h3>
        <p className="text-slate-400 text-sm mt-1 line-clamp-2">{project.description}</p>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1">
        {visibleSkills.map(skill => (
          <Badge key={skill} variant="skill" text={skill} />
        ))}
        {extraSkills > 0 && (
          <span className="text-xs text-slate-400">+{extraSkills} more</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-600 overflow-hidden">
            {project.owner.avatar_url
              ? <img src={project.owner.avatar_url} alt={project.owner.full_name} className="w-full h-full object-cover" />
              : <span className="text-xs text-slate-300 flex items-center justify-center h-full">
                  {project.owner.full_name[0]}
                </span>
            }
          </div>
          <ScoreBadge score={project.owner.score} />
          <span className="text-slate-400 text-xs">{vacancies} slot{vacancies !== 1 ? 's' : ''} open</span>
        </div>

        <a href={`/projects/${project.id}`}
          className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors">
          View →
        </a>
      </div>
    </div>
  )
}