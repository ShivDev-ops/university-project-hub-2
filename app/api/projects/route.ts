// app/api/projects/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch profile using user_id (auth UUID), select user_id for FK
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('user_id')
    .eq('user_id', session.user.id)
    .single()

  if (profileError || !profile) {
    console.error('Profile fetch error:', profileError)
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const body = await req.json()

  // Basic validation
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }
  if (!Array.isArray(body.required_skills) || body.required_skills.length === 0) {
    return NextResponse.json({ error: 'At least one skill is required' }, { status: 400 })
  }
  if (!body.slots || body.slots < 1 || body.slots > 10) {
    return NextResponse.json({ error: 'Slots must be between 1 and 10' }, { status: 400 })
  }

  // Check 2-project limit
  const { count } = await supabaseAdmin
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', profile.user_id)
    .eq('status', 'open')

  if ((count ?? 0) >= 2) {
    return NextResponse.json(
      { error: 'You already have 2 active projects. Complete one before creating more.' },
      { status: 403 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert({
      owner_id:         profile.user_id,                    // ✅ profiles.user_id, not profiles.id
      title:            body.title.trim(),
      description:      body.description?.trim() ?? '',
      full_description: body.full_description?.trim() ?? null,
      required_skills:  body.required_skills,
      slots:            body.slots,
      filled_slots:     0,
      status:           'open',
      visibility:       body.visibility ?? 'public',
      github_repo:      body.github_repo?.trim() || null,
      tech_stack:       body.tech_stack ?? [],
      timeline:         body.timeline?.trim() || null,
      file_urls:        body.file_urls ?? [],
    })
    .select('id')
    .single()

  if (error) {
    console.error('Project insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const status = searchParams.get('status') ?? 'open'
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)
  const offset = parseInt(searchParams.get('offset') ?? '0')

  let query = supabaseAdmin
    .from('projects')
    .select(`
      id,
      title,
      description,
      required_skills,
      slots,
      filled_slots,
      status,
      visibility,
      github_repo,
      tech_stack,
      timeline,
      created_at,
      owner:profiles!projects_owner_id_fkey (
        full_name,
        avatar_url,
        score
      )
    `)
    .eq('status', status)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (q) {
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,required_skills.cs.{${q}}`
    )
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Projects fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ projects: data, total: count })
}