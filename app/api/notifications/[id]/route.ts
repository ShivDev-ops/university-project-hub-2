import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, user_id')
    .or(`user_id.eq.${session.user.id},id.eq.${session.user.id}`)
    .maybeSingle()

  const userIds = profile ? [profile.user_id, profile.id] : [session.user.id]

  const { error } = await supabaseAdmin
    .from('notifications')
    .delete()
    .eq('id', id)
    .in('user_id', userIds)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
