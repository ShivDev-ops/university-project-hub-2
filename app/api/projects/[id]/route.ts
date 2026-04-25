// app/api/projects/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

// ── GET single project ─────────────────────────────────────────────────────
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: project, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Manual join — owner_id = profiles.user_id
  const { data: owner } = await supabaseAdmin
    .from('profiles')
    .select('user_id, full_name, avatar_url, score, department, year')
    .eq('user_id', project.owner_id)
    .single()

  return NextResponse.json({ ...project, owner: owner ?? null })
}

// ── PUT edit project ───────────────────────────────────────────────────────
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership — owner_id = profiles.user_id
  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('owner_id')
    .eq('id', id)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  if (project.owner_id !== session.user.id) {
    return NextResponse.json({ error: 'Only the project owner can edit this' }, { status: 403 })
  }

  const body = await req.json()
  const allowedFields = [
    'title', 'description', 'full_description',
    'required_skills', 'slots', 'visibility',
    'github_repo', 'tech_stack', 'timeline',
    'file_urls', 'status',
  ]

  // Only pick allowed fields from body
  const updates = Object.fromEntries(
    Object.entries(body).filter(([key]) => allowedFields.includes(key))
  )

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}

// ── DELETE project ─────────────────────────────────────────────────────────
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('owner_id, status, title')
    .eq('id', id)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // owner_id = profiles.user_id = session.user.id ✅
  if (project.owner_id !== session.user.id) {
    return NextResponse.json({ error: 'Only the project owner can delete this' }, { status: 403 })
  }

  let body: { confirmProjectName?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Project name confirmation is required' },
      { status: 400 }
    )
  }

  if ((body.confirmProjectName || '').trim() !== project.title) {
    return NextResponse.json(
      { error: 'Project name does not match. Deletion cancelled.' },
      { status: 400 }
    )
  }

  // Permanently remove related rows first so the project does not linger in
  // archived views or leave orphaned applications behind.
  const { error: applicationsError } = await supabaseAdmin
    .from('applications')
    .delete()
    .eq('project_id', id)

  if (applicationsError) {
    return NextResponse.json({ error: applicationsError.message }, { status: 500 })
  }

  const { error: notificationsError } = await supabaseAdmin
    .from('notifications')
    .delete()
    .contains('metadata', { project_id: id })

  if (notificationsError) {
    return NextResponse.json({ error: notificationsError.message }, { status: 500 })
  }

  const { error } = await supabaseAdmin
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}