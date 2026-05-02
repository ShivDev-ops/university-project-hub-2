// app/api/friends/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// POST /api/friends — send a friend request
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { receiverId } = await req.json()
  if (!receiverId) return NextResponse.json({ error: 'receiverId required' }, { status: 400 })

  // Check if already exists
  const { data: existing } = await supabaseAdmin
    .from('friend_requests')
    .select('id, status')
    .or(
      `and(sender_id.eq.${session.user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${session.user.id})`
    )
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Request already exists', status: existing.status }, { status: 409 })
  }

  const { data, error } = await supabaseAdmin
    .from('friend_requests')
    .insert({ sender_id: session.user.id, receiver_id: receiverId, status: 'pending' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH /api/friends — accept or decline
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { requestId, action } = await req.json() // action: 'accept' | 'decline'
  if (!requestId || !['accept', 'decline'].includes(action)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('friend_requests')
    .update({ status: action === 'accept' ? 'accepted' : 'declined' })
    .eq('id', requestId)
    .eq('receiver_id', session.user.id) // only receiver can respond
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If accepted, create a DM thread between the two users
  if (action === 'accept' && data) {
    const { data: thread } = await supabaseAdmin
      .from('chat_threads')
      .insert({ type: 'dm', created_by: session.user.id })
      .select()
      .single()

    if (thread) {
      await supabaseAdmin.from('chat_members').insert([
        { thread_id: thread.id, user_id: session.user.id },
        { thread_id: thread.id, user_id: data.sender_id },
      ])
    }
  }

  return NextResponse.json(data)
}