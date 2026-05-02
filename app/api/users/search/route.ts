import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  const { data } = await supabaseAdmin
    .from('profiles')
    .select('user_id, full_name, avatar_url, email, score')
    .or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
    .neq('user_id', session.user.id)
    .limit(8)

  return NextResponse.json(data ?? [])
}