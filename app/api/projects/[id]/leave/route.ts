import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { confirmProjectName?: string; reason?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Project name confirmation and reason are required' },
      { status: 400 }
    )
  }

  const reason = (body.reason || '').trim()
  if (reason.length < 5) {
    return NextResponse.json(
      { error: 'Please provide a reason with at least 5 characters.' },
      { status: 400 }
    )
  }

  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('id, title, owner_id, filled_slots')
    .eq('id', projectId)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  if ((body.confirmProjectName || '').trim() !== project.title) {
    return NextResponse.json(
      { error: 'Project name does not match. Leave cancelled.' },
      { status: 400 }
    )
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, user_id, full_name')
    .eq('user_id', session.user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  if (project.owner_id === profile.user_id || project.owner_id === profile.id) {
    return NextResponse.json(
      { error: 'Project owners cannot leave their own project.' },
      { status: 403 }
    )
  }

  const { data: application } = await supabaseAdmin
    .from('applications')
    .select('id, status')
    .eq('project_id', projectId)
    .or(`applicant_id.eq.${profile.user_id},applicant_id.eq.${profile.id}`)
    .eq('status', 'accepted')
    .maybeSingle()

  if (!application) {
    return NextResponse.json(
      { error: 'You are not an accepted collaborator on this project.' },
      { status: 403 }
    )
  }

  const { error: applicationError } = await supabaseAdmin
    .from('applications')
    .update({ status: 'left' })
    .eq('id', application.id)

  if (applicationError) {
    return NextResponse.json({ error: applicationError.message }, { status: 500 })
  }

  const nextFilledSlots = Math.max((project.filled_slots ?? 0) - 1, 0)
  const { error: projectUpdateError } = await supabaseAdmin
    .from('projects')
    .update({ filled_slots: nextFilledSlots })
    .eq('id', projectId)

  if (projectUpdateError) {
    return NextResponse.json({ error: projectUpdateError.message }, { status: 500 })
  }

  const { data: ownerProfile } = await supabaseAdmin
    .from('profiles')
    .select('id, user_id')
    .or(`user_id.eq.${project.owner_id},id.eq.${project.owner_id}`)
    .maybeSingle()

  if (ownerProfile) {
    const notificationPayload = {
      type: 'collaborator_left',
      message: `${profile.full_name} left your project "${project.title}". Reason: ${reason}`,
      link: '/notifications',
      metadata: {
        project_id: projectId,
        project_title: project.title,
        collaborator_id: profile.user_id,
        collaborator_name: profile.full_name,
        reason,
      },
      read: false,
    }

    let { error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert({
        ...notificationPayload,
        user_id: ownerProfile.user_id,
      })

    if (notificationError && ownerProfile.id && ownerProfile.id !== ownerProfile.user_id) {
      const { error: fallbackError } = await supabaseAdmin
        .from('notifications')
        .insert({
          ...notificationPayload,
          user_id: ownerProfile.id,
        })
      notificationError = fallbackError
    }

    if (notificationError) {
      console.error('Collaborator leave notification failed:', notificationError)
    }
  }

  return NextResponse.json({ success: true })
}
