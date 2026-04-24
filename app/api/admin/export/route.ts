import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId, message } = await req.json()

  // Get applicant profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Check not already applied
  const { data: existing } = await supabaseAdmin
    .from('applications')
    .select('id')
    .eq('project_id', projectId)
    .eq('applicant_id', profile.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already applied' }, { status: 409 })
  }

  // Check 2-project limit
  const { count } = await supabaseAdmin
    .from('applications')
    .select('id', { count: 'exact' })
    .eq('applicant_id', profile.id)
    .eq('status', 'accepted')

  if ((count || 0) >= 2) {
    return NextResponse.json({ error: 'You are in 2 active projects' }, { status: 403 })
  }

  // Insert application
  const { error } = await supabaseAdmin
    .from('applications')
    .insert({
      project_id: projectId,
      applicant_id: profile.id,
      message: message || null,
      status: 'pending',
      applied_at: new Date().toISOString(),
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}