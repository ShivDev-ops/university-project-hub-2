export type Project = {
  id: string
  title: string
  description: string
  owner_id: string
  slots: number
  filled_slots: number
  visibility: 'public' | 'private'
  required_skills: string[]
  status: 'open' | 'in_progress' | 'completed'
  created_at: string
}

export type Profile = {
  id: string
  full_name: string
  avatar_url: string | null
  score: number
  bio?: string | null
  skills?: string[]
  department?: string | null
  year?: number | null
  github_url?: string | null
  portfolio_url?: string | null
  academic_focus?: string | null
}