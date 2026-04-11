// app/page.tsx
// Server Component — fetches real projects from Supabase, renders HTML on server
// Replace the old basic page.tsx with this file entirely

import { createClient } from '@supabase/supabase-js'
import LandingClient from '@/components/LandingClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function LandingPage() {
  // Fetch open public projects — Hook-layer fields only (no github_repo, no full description)
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, description, required_skills, slots, filled_slots, created_at, status')
    .eq('visibility', 'public')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(6)

  // Fallback mock data so the page looks great even before DB is set up
  const displayProjects = projects?.length ? projects : [
    {
      id: '1',
      title: 'AI Attendance System',
      description: 'Face recognition attendance using OpenCV + FastAPI. Real-time detection for 500+ students.',
      required_skills: ['Python', 'OpenCV', 'FastAPI', 'React'],
      slots: 3, filled_slots: 1, created_at: new Date().toISOString(), status: 'open',
    },
    {
      id: '2',
      title: 'Campus Event App',
      description: 'A React Native app for discovering and registering for campus events with QR-based check-in.',
      required_skills: ['React Native', 'Node.js', 'Firebase'],
      slots: 3, filled_slots: 1, created_at: new Date().toISOString(), status: 'open',
    },
    {
      id: '3',
      title: 'Quantum Auth Protocol',
      description: 'Researching post-quantum cryptographic standards for decentralized identity management systems.',
      required_skills: ['Rust', 'Security', 'Cryptography'],
      slots: 4, filled_slots: 1, created_at: new Date().toISOString(), status: 'open',
    },
    {
      id: '4',
      title: 'Neural Archiver',
      description: 'ML model for semantic indexing of academic research papers. Saves hours of literature review.',
      required_skills: ['PyTorch', 'NLP', 'FastAPI', 'PostgreSQL'],
      slots: 2, filled_slots: 0, created_at: new Date().toISOString(), status: 'open',
    },
    {
      id: '5',
      title: 'Smart IoT Dashboard',
      description: 'Real-time sensor data visualization for campus IoT devices using MQTT and WebSockets.',
      required_skills: ['Arduino', 'MQTT', 'React', 'PostgreSQL'],
      slots: 3, filled_slots: 2, created_at: new Date().toISOString(), status: 'open',
    },
    {
      id: '6',
      title: 'Mars Rover HUD',
      description: 'Designing a real-time telemetry interface for the university robotics competition. Three.js powered.',
      required_skills: ['React', 'Three.js', 'WebSocket', 'Embedded C'],
      slots: 4, filled_slots: 3, created_at: new Date().toISOString(), status: 'open',
    },
  ]

  return <LandingClient projects={displayProjects} />
}
