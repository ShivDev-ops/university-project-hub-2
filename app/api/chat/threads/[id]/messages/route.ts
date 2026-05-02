// app/api/chat/threads/[id]/messages/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }  // ✅ Promise
) {
  const { id } = await params  // ✅ await it
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('chat_messages')
    .select(`
      id, content, created_at, sender_id,
      sender:sender_id ( full_name, avatar_url )
    `)
    .eq('thread_id', id)
    .order('created_at', { ascending: true })
    .limit(100)

  return NextResponse.json(data ?? [])
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }  // ✅ Promise
) {
  const { id } = await params  // ✅ await it
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .insert({ thread_id: id, sender_id: session.user.id, content: content.trim() })
    .select(`id, content, created_at, sender_id, sender:sender_id ( full_name, avatar_url )`)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Add this to the bottom of app/api/chat/threads/[id]/messages/route.ts

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }  // matches your existing pattern
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify the requester is a member of this thread before wiping
  const { data: member } = await supabaseAdmin
    .from('chat_members')
    .select('user_id')
    .eq('thread_id', id)
    .eq('user_id', session.user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const { error } = await supabaseAdmin
    .from('chat_messages')
    .delete()
    .eq('thread_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}