// app/api/chat/threads/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: memberRows, error: memberError } = await supabaseAdmin
    .from('chat_members')
    .select('thread_id')
    .eq('user_id', session.user.id)

  console.log('memberRows:', memberRows, 'error:', memberError)

  const threadIds = (memberRows ?? []).map((r: any) => r.thread_id)
  if (threadIds.length === 0) return NextResponse.json([])

  const { data, error } = await supabaseAdmin
    .from('chat_threads')
    .select(`
      id, name, type, created_at,
      chat_members ( user_id, profiles ( full_name, avatar_url, score ) ),
      chat_messages ( id, content, created_at, sender_id )
    `)
    .in('id', threadIds)
    .order('created_at', { ascending: false })

  console.log('threads error:', error)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, type, memberIds } = await req.json()
  const allMembers = Array.from(new Set([session.user.id, ...memberIds]))

  const { data: thread, error: threadError } = await supabaseAdmin
    .from('chat_threads')
    .insert({ name: name ?? null, type: type ?? 'dm', created_by: session.user.id })
    .select()
    .single()

  if (threadError) return NextResponse.json({ error: threadError.message }, { status: 500 })

  const { error: membersError } = await supabaseAdmin
    .from('chat_members')
    .insert(allMembers.map((uid: string) => ({ thread_id: thread.id, user_id: uid })))

  if (membersError) return NextResponse.json({ error: membersError.message }, { status: 500 })

  return NextResponse.json(thread)
}