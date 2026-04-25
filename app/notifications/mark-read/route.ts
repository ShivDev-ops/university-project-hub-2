// app/api/notifications/mark-read/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, user_id')
    .eq('user_id', session.user.id)
    .single()

  let body: { id?: string } = {}
  try { body = await req.json() } catch { /* mark all */ }

  if (body.id) {
    // Mark single notification read
    await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', body.id)
      .in('user_id', profile ? [profile.user_id, profile.id] : [session.user.id])   // enforce ownership
  } else {
    // Mark ALL notifications read for this user
    await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .in('user_id', profile ? [profile.user_id, profile.id] : [session.user.id])
      .eq('read', false)
  }

  return NextResponse.json({ success: true })
}