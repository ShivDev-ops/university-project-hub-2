// app/api/applications/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

type ApplicationWithProject = {
  id: string
  status: string
  applicant_id: string
  project: {
    id: string
    title: string
    owner_id: string
    slots: number
    filled_slots: number
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { status } = await req.json()
  if (!['accepted', 'rejected'].includes(status)) {
    return NextResponse.json(
      { error: 'Status must be accepted or rejected' },
      { status: 400 }
    )
  }

  // owner_id on projects uses profiles.user_id
  const { data: callerProfile } = await supabaseAdmin
    .from('profiles')
    .select('id, user_id')
    .eq('user_id', session.user.id)
    .single()

  if (!callerProfile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Get application + nested project info
  const { data: application } = await supabaseAdmin
    .from('applications')
    .select(`
      id,
      status,
      applicant_id,
      project:projects!applications_project_id_fkey (
        id,
        title,
        owner_id,
        slots,
        filled_slots
      )
    `)
    .eq('id', id)
    .single() as { data: ApplicationWithProject | null }

  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  // Only the project owner can accept/reject
  // application.project.owner_id and session identity both use profiles.user_id
  const isOwner =
    application.project.owner_id === callerProfile.user_id ||
    application.project.owner_id === callerProfile.id

  if (!isOwner) {
    return NextResponse.json(
      { error: 'Only the project owner can do this' },
      { status: 403 }
    )
  }

  // Guard: already processed
  if (application.status !== 'pending') {
    return NextResponse.json(
      { error: 'Application already processed' },
      { status: 409 }
    )
  }

  // Guard: if accepting, check slot availability
  if (status === 'accepted') {
    const spotsLeft = application.project.slots - application.project.filled_slots
    if (spotsLeft <= 0) {
      return NextResponse.json(
        { error: 'No slots available on this project' },
        { status: 403 }
      )
    }
  }

  // Update application status
  const { error: updateError } = await supabaseAdmin
    .from('applications')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) {
    console.error('Application update error:', updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // If accepted → increment filled_slots on the project
  if (status === 'accepted') {
    const { error: slotError } = await supabaseAdmin
      .from('projects')
      .update({
        filled_slots: application.project.filled_slots + 1,
      })
      .eq('id', application.project.id)

    if (slotError) {
      console.error('Slot update error:', slotError)
      // Don't fail the request — application is already accepted
    }
  }

  // Resolve applicant profile so notifications can fall back across key shapes
  const { data: applicantProfile } = await supabaseAdmin
    .from('profiles')
    .select('id, user_id')
    .or(`id.eq.${application.applicant_id},user_id.eq.${application.applicant_id}`)
    .maybeSingle()

  if (applicantProfile) {
    const notifMessage =
      status === 'accepted'
        ? `Your application to "${application.project.title}" was accepted! Welcome to the team.`
        : `Your application to "${application.project.title}" was not accepted this time.`

    const notificationPayload = {
      type: status === 'accepted' ? 'accepted' : 'rejected',
      message: notifMessage,
      link: `/projects/${application.project.id}`,
      metadata: {
        project_id: application.project.id,
        application_id: id,
      },
      read: false,
    }

    let { error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        ...notificationPayload,
        user_id: applicantProfile.user_id,
      })

    if (notifError && applicantProfile.id && applicantProfile.id !== applicantProfile.user_id) {
      console.error('Notification insert failed with user_id, retrying as profile id:', notifError)
      const { error: fallbackError } = await supabaseAdmin
        .from('notifications')
        .insert({
          ...notificationPayload,
          user_id: applicantProfile.id,
        })

      notifError = fallbackError
    }

    if (notifError) {
      // Best-effort — don't fail the request
      console.error('Notification error:', notifError)
    }
  }

  return NextResponse.json({ success: true, status })
}