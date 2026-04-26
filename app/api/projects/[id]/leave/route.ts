import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

function isStatusConstraintViolation(message: string | undefined) {
  const normalized = String(message || '').toLowerCase()
  return normalized.includes('applications_status_check') || normalized.includes('check constraint')
}

function isAcceptedLikeStatus(status: string | null | undefined) {
  const normalized = String(status || '').trim().toLowerCase()
  return normalized === 'accepted' || normalized === 'approved' || normalized === 'active'
}

type ProfileCandidate = {
  id: string
  user_id: string
  full_name: string
}

async function resolveProfileCandidates(sessionUserId: string, sessionUserEmail: string | null | undefined) {
  const dedupe = new Map<string, ProfileCandidate>()

  const { data: byIdRows } = await supabaseAdmin
    .from('profiles')
    .select('id, user_id, full_name')
    .or(`user_id.eq.${sessionUserId},id.eq.${sessionUserId}`)
    .limit(10)

  for (const row of byIdRows ?? []) {
    dedupe.set(`${row.id}:${row.user_id}`, row)
  }

  if (sessionUserEmail) {
    const { data: byEmailRows } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id, full_name')
      .eq('email', sessionUserEmail)
      .limit(10)

    for (const row of byEmailRows ?? []) {
      dedupe.set(`${row.id}:${row.user_id}`, row)
    }
  }

  const candidates = Array.from(dedupe.values())
  candidates.sort((a, b) => {
    const aMatch = a.user_id === sessionUserId || a.id === sessionUserId ? 1 : 0
    const bMatch = b.user_id === sessionUserId || b.id === sessionUserId ? 1 : 0
    return bMatch - aMatch
  })

  return candidates
}

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

  const profileCandidates = await resolveProfileCandidates(session.user.id, session.user.email)
  const identityCandidates = Array.from(
    new Set(profileCandidates.flatMap((candidate) => [candidate.user_id, candidate.id]).filter(Boolean))
  )

  if (identityCandidates.length === 0) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const profile = profileCandidates[0]
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  if (identityCandidates.includes(project.owner_id)) {
    return NextResponse.json(
      { error: 'Project owners cannot leave their own project.' },
      { status: 403 }
    )
  }

  const { data: applicationRows } = await supabaseAdmin
    .from('applications')
    .select('id, status, created_at')
    .eq('project_id', projectId)
    .in('applicant_id', identityCandidates)
    .order('created_at', { ascending: false })

  const application = (applicationRows || []).find((row) => isAcceptedLikeStatus(row.status))

  let hasAcceptedNotification = false
  if (!application) {
    const { data: acceptedNotif } = await supabaseAdmin
      .from('notifications')
      .select('id')
      .in('user_id', identityCandidates)
      .eq('type', 'accepted')
      .contains('metadata', { project_id: projectId })
      .limit(1)

    hasAcceptedNotification = (acceptedNotif?.length ?? 0) > 0
  }

  if (!application && !hasAcceptedNotification) {
    return NextResponse.json(
      { error: 'You are not an accepted collaborator on this project.' },
      { status: 403 }
    )
  }

  let applicationError: { message?: string } | null = null
  let shouldDecrementSlots = !!application || hasAcceptedNotification

  if (application) {
    shouldDecrementSlots = true

    // Prefer explicit "left" status. If current DB constraint doesn't allow it,
    // gracefully fall back to "rejected" so collaborator removal still works.
    let updateResult = await supabaseAdmin
      .from('applications')
      .update({ status: 'left' })
      .eq('id', application.id)

    applicationError = updateResult.error

    if (applicationError && isStatusConstraintViolation(applicationError.message)) {
      const { error: fallbackError } = await supabaseAdmin
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', application.id)
      applicationError = fallbackError
    }

    // Final safety net: if status transitions are constrained by legacy DB rules,
    // remove the accepted membership row directly so collaborator access is revoked.
    if (applicationError) {
      const { error: deleteError } = await supabaseAdmin
        .from('applications')
        .delete()
        .eq('id', application.id)

      if (!deleteError) {
        applicationError = null
      }
    }
  }

  if (applicationError) {
    return NextResponse.json(
      { error: 'Could not update collaborator status while leaving project.' },
      { status: 500 }
    )
  }

  const { error: revokeNotificationError } = await supabaseAdmin
    .from('notifications')
    .delete()
    .in('user_id', identityCandidates)
    .eq('type', 'accepted')
    .contains('metadata', { project_id: projectId })

  if (revokeNotificationError) {
    return NextResponse.json(
      { error: 'Could not revoke collaborator access notifications.' },
      { status: 500 }
    )
  }

  if (shouldDecrementSlots) {
    const nextFilledSlots = Math.max((project.filled_slots ?? 0) - 1, 0)
    const { error: projectUpdateError } = await supabaseAdmin
      .from('projects')
      .update({ filled_slots: nextFilledSlots })
      .eq('id', projectId)

    if (projectUpdateError) {
      return NextResponse.json({ error: projectUpdateError.message }, { status: 500 })
    }
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
