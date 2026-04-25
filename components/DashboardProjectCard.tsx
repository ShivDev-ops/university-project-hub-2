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
    <div className="card-hover relative rounded-2xl overflow-hidden"
      style={{background:'rgba(26,31,47,0.4)', backdropFilter:'blur(16px)', border:'1px solid rgba(66,71,84,0.15)'}}>
      <div className="p-6">

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-wrap gap-2">
            <span style={{padding:'2px 8px', borderRadius:'4px', background: spotsLeft > 0 ? 'rgba(173,198,255,0.1)' : 'rgba(66,71,84,0.2)', color: spotsLeft > 0 ? '#adc6ff' : '#8c909f', fontSize:'10px', fontWeight:700, fontFamily:'DM Mono', textTransform:'uppercase'}}>
              {spotsLeft > 0 ? 'Open' : 'Full'}
            </span>
            <span style={{fontSize:'10px', color:'rgba(194,198,214,0.6)', fontFamily:'DM Mono'}}>
              {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-1" style={{fontSize:'10px', color:'rgba(194,198,214,0.6)', fontFamily:'DM Mono'}}>
            <span className="material-symbols-outlined" style={{fontSize:'14px'}}>group</span>
            {spotsLeft} left
          </div>
        </div>

        {/* Title + desc */}
        <h3 style={{fontFamily:'Syne', fontSize:'20px', fontWeight:700, marginBottom:'8px', lineHeight:1.2, color:'#dee1f7'}}>
          {project.title}
        </h3>
        <p style={{color:'#c2c6d6', fontSize:'14px', marginBottom:'16px', lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
          {project.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.required_skills?.slice(0, 3).map((skill: string) => (
            <span key={skill} style={{padding:'4px 8px', borderRadius:'6px', background:'#25293a', fontSize:'10px', fontFamily:'DM Mono', color:'#c2c6d6'}}>
              {skill}
            </span>
          ))}
          {(project.required_skills?.length ?? 0) > 3 && (
            <span style={{padding:'4px 8px', borderRadius:'6px', background:'#25293a', fontSize:'10px', fontFamily:'DM Mono', color:'#8c909f'}}>
              +{project.required_skills.length - 3} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 flex items-center justify-between"
          style={{borderTop:'1px solid rgba(66,71,84,0.1)'}}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center"
              style={{background:'#25293a', border:'1px solid rgba(66,71,84,0.3)'}}>
              {project.owner?.avatar_url ? (
                <img src={project.owner.avatar_url} className="w-full h-full object-cover" alt={project.owner.full_name} />
              ) : (
                <span className="material-symbols-outlined" style={{fontSize:'14px', color:'#adc6ff'}}>person</span>
              )}
            </div>
            <span style={{fontFamily:'DM Mono', fontSize:'10px', color:'rgba(194,198,214,0.7)'}}>
              {project.owner?.full_name ?? 'Unknown'}
            </span>
            <span style={{fontFamily:'DM Mono', fontSize:'9px', fontWeight:700, padding:'1px 6px', borderRadius:'999px', background:`${scoreColor}20`, color: scoreColor}}>
              {score}
            </span>
          </div>
          <Link href={`/projects/${project.id}`}>
            <button className="flex items-center gap-1 text-xs font-bold hover:gap-2 transition-all"
              style={{color:'#adc6ff', fontFamily:'DM Mono'}}>
              View <span className="material-symbols-outlined" style={{fontSize:'16px'}}>arrow_forward</span>
            </button>
          </Link>
        </div>

      </div>
    </div>
  )
}
