import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
 
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 
  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
 
  const { error } = await supabaseAdmin
    .from('user_blocks')
    .insert({ blocker_id: session.user.id, blocked_id: userId })
 
  if (error && error.code !== '23505') // ignore duplicate
    return NextResponse.json({ error: error.message }, { status: 500 })
 
  return NextResponse.json({ ok: true })
}