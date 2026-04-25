export type Project = {
  id: string
  owner_id: string
  title: string
  description: string
  required_skills: string[]
  slots: number
  filled_slots: number
  visibility: 'public' | 'private'
  status: 'open' | 'in_progress' | 'completed'
  github_repo?: string | null
  vault_files?: string[] | null
  created_at: string
  updated_at: string
}

export type Profile = {
  id: string
  user_id: string
  email: string
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
  verified: boolean
  profile_complete: boolean
  is_admin: boolean
  is_suspended: boolean
  created_at: string
  updated_at: string
}

export type Application = {
  id: string
  project_id: string
  applicant_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

export type Notification = {
  id: string
  user_id: string
  type: 'join_request' | 'application_accepted' | 'application_rejected' | 'project_updated'
  message: string
  link?: string | null
  metadata: {
    applicant_id?: string
    project_id?: string
    [key: string]: any
  }
  read: boolean
  created_at: string
}

export type OTPCode = {
  id: string
  user_id: string
  code: string
  expires_at: string
  used: boolean
  created_at: string
}