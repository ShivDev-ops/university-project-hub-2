// app/api/applications/route.ts
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

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
  }

  // Get applicant profile using session user_id
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, user_id, full_name, score')
    .eq('user_id', session.user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Get project + owner info
  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('id, title, owner_id, slots, filled_slots, status')
    .eq('id', projectId)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Guard: project must be open
  if (project.status !== 'open') {
    return NextResponse.json({ error: 'Project is no longer accepting applications' }, { status: 403 })
  }

  // Guard: can't apply to own project
  if (project.owner_id === profile.user_id || project.owner_id === profile.id) {
    return NextResponse.json({ error: 'You cannot apply to your own project' }, { status: 403 })
  }

  // Guard: no slots left
  if (project.filled_slots >= project.slots) {
    return NextResponse.json({ error: 'No slots available' }, { status: 403 })
  }

  // Guard: already applied
  const { data: existing } = await supabaseAdmin
    .from('applications')
    .select('id')
    .eq('project_id', projectId)
    .or(`applicant_id.eq.${profile.user_id},applicant_id.eq.${profile.id}`)
    .limit(1)

  if ((existing?.length ?? 0) > 0) {
    return NextResponse.json({ error: 'Already applied to this project' }, { status: 409 })
  }

  // Guard: already in 2 active projects
  const { count } = await supabaseAdmin
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .or(`applicant_id.eq.${profile.user_id},applicant_id.eq.${profile.id}`)
    .eq('status', 'accepted')

  if ((count ?? 0) >= 2) {
    return NextResponse.json({ error: 'You are already in 2 active projects' }, { status: 403 })
  }

  // Insert application — applicant_id uses profiles.user_id
  const { data: application, error } = await supabaseAdmin
    .from('applications')
    .insert({
      project_id:   projectId,
      applicant_id: profile.user_id,
      message:      message?.trim() || null,
      status:       'pending',
      applied_at:   new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    console.error('Application insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Resolve owner profile deterministically so notifications can fall back across key shapes
  const { data: ownerProfile } = await supabaseAdmin
    .from('profiles')
    .select('id, user_id')
    .or(`user_id.eq.${project.owner_id},id.eq.${project.owner_id}`)
    .maybeSingle()

  if (!ownerProfile) {
    console.error('Owner notification mapping failed for project owner_id:', project.owner_id)
    return NextResponse.json(
      {
        success: true,
        id: application.id,
        warning: 'Application submitted, but owner notification could not be created.',
      },
      { status: 201 }
    )
  }

  // Fire notification to project owner
  const notificationPayload = {
    type: 'application',
    message: `${profile.full_name} applied to your project "${project.title}"`,
    link: '/notifications',
    metadata: {
      application_id: application.id,
      project_id: projectId,
      applicant_id: profile.user_id,
      applicant_name: profile.full_name,
      applicant_score: profile.score,
    },
    read: false,
  }

  let { error: notifError } = await supabaseAdmin
    .from('notifications')
    .insert({
      ...notificationPayload,
      user_id: ownerProfile.user_id,
    })

  if (notifError && ownerProfile.id && ownerProfile.id !== ownerProfile.user_id) {
    console.error('Notification insert failed with user_id, retrying as profile id:', notifError)
    const { error: fallbackError } = await supabaseAdmin
      .from('notifications')
      .insert({
        ...notificationPayload,
        user_id: ownerProfile.id,
      })

    notifError = fallbackError
  }

  if (notifError) {
    console.error('Notification error:', notifError)
    return NextResponse.json(
      {
        success: true,
        id: application.id,
        warning: 'Application submitted, but owner notification failed to send.',
      },
      { status: 201 }
    )
  }

  return NextResponse.json({ success: true, id: application.id }, { status: 201 })
}