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
  department: string
  year: number
}